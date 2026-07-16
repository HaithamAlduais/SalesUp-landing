import { useEffect, useRef } from 'react'
import { reportGlFailure } from './gpu'

/*
 * Minimal WebGL2 fullscreen-triangle shader host — the universal-mobile
 * fallback for the WebGPU-only vendor engine. Each GlScene owns one
 * canvas + context; the fx lifecycle wrappers (CardFx.tsx) already
 * mount/unmount scenes around the viewport, which keeps live context
 * count low. Runs procedural fragment shaders only (no textures).
 *
 * Contract provided to shaders:
 *   uniform vec2 u_resolution — canvas size in physical pixels
 *   uniform float u_time      — seconds since mount
 *   uniform vec2 u_pointer    — element-space 0..1, y-up, damped;
 *                               (-10,-10) while no pointer has moved
 *   in vec2 v_uv              — 0..1, y-up
 * Custom uniforms arrive via the `uniforms` prop (float / vec2-4).
 */

export type GlUniformValue = number | number[]

const VERT = `#version 300 es
layout(location = 0) in vec2 a_pos;
out vec2 v_uv;
void main() {
  v_uv = a_pos * 0.5 + 0.5;
  gl_Position = vec4(a_pos, 0.0, 1.0);
}`

const MAX_DPR = 2
const POINTER_SMOOTHING = 0.09

function compile(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type)
  if (!shader) return null
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('[glRuntime] shader compile failed:', gl.getShaderInfoLog(shader))
    gl.deleteShader(shader)
    return null
  }
  return shader
}

export function GlScene({
  frag,
  uniforms,
}: {
  frag: string
  uniforms: Record<string, GlUniformValue>
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const uniformsRef = useRef(uniforms)
  uniformsRef.current = uniforms

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    let raf = 0
    let gl: WebGL2RenderingContext | null = null
    let program: WebGLProgram | null = null
    let locations: Record<string, WebGLUniformLocation> = {}
    let lost = false
    const start = performance.now()

    const pointer = { x: -10, y: -10, tx: -10, ty: -10, has: false }
    const onPointerMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect()
      if (r.width === 0 || r.height === 0) return
      pointer.tx = (e.clientX - r.left) / r.width
      pointer.ty = 1 - (e.clientY - r.top) / r.height
      if (!pointer.has) {
        pointer.x = pointer.tx
        pointer.y = pointer.ty
        pointer.has = true
      }
    }

    function setup(): 'ok' | 'lost' | 'failed' {
      const ctx = canvas!.getContext('webgl2', {
        antialias: false,
        alpha: true,
        premultipliedAlpha: true,
        powerPreference: 'low-power',
      })
      gl = ctx
      if (!ctx) return 'failed'
      const fail = () => (ctx.isContextLost() ? 'lost' : 'failed') as 'lost' | 'failed'
      const vs = compile(ctx, ctx.VERTEX_SHADER, VERT)
      const fs = compile(ctx, ctx.FRAGMENT_SHADER, frag)
      if (!vs || !fs) return fail()
      const p = ctx.createProgram()
      if (!p) return fail()
      ctx.attachShader(p, vs)
      ctx.attachShader(p, fs)
      ctx.linkProgram(p)
      ctx.deleteShader(vs)
      ctx.deleteShader(fs)
      if (!ctx.getProgramParameter(p, ctx.LINK_STATUS)) {
        console.error('[glRuntime] program link failed:', ctx.getProgramInfoLog(p))
        ctx.deleteProgram(p)
        return fail()
      }
      const buf = ctx.createBuffer()
      ctx.bindBuffer(ctx.ARRAY_BUFFER, buf)
      ctx.bufferData(ctx.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), ctx.STATIC_DRAW)
      ctx.enableVertexAttribArray(0)
      ctx.vertexAttribPointer(0, 2, ctx.FLOAT, false, 0, 0)
      locations = {}
      const count = ctx.getProgramParameter(p, ctx.ACTIVE_UNIFORMS) as number
      for (let i = 0; i < count; i++) {
        const info = ctx.getActiveUniform(p, i)
        if (!info) continue
        const loc = ctx.getUniformLocation(p, info.name)
        if (loc) locations[info.name] = loc
      }
      ctx.useProgram(p)
      program = p
      return 'ok'
    }

    function setUniform(name: string, value: GlUniformValue) {
      const loc = locations[name]
      if (!loc || !gl) return
      if (typeof value === 'number') gl.uniform1f(loc, value)
      else if (value.length === 2) gl.uniform2f(loc, value[0], value[1])
      else if (value.length === 3) gl.uniform3f(loc, value[0], value[1], value[2])
      else if (value.length === 4) gl.uniform4f(loc, value[0], value[1], value[2], value[3])
    }

    function frame() {
      raf = requestAnimationFrame(frame)
      if (!gl || !program || lost) return
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR)
      const w = Math.max(1, Math.round(canvas!.clientWidth * dpr))
      const h = Math.max(1, Math.round(canvas!.clientHeight * dpr))
      if (canvas!.width !== w || canvas!.height !== h) {
        canvas!.width = w
        canvas!.height = h
        gl.viewport(0, 0, w, h)
      }
      if (pointer.has) {
        pointer.x += (pointer.tx - pointer.x) * POINTER_SMOOTHING
        pointer.y += (pointer.ty - pointer.y) * POINTER_SMOOTHING
      }
      setUniform('u_time', (performance.now() - start) / 1000)
      setUniform('u_resolution', [w, h])
      setUniform('u_pointer', [pointer.x, pointer.y])
      const custom = uniformsRef.current
      for (const name in custom) setUniform(name, custom[name])
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    }

    const onLost = (e: Event) => {
      e.preventDefault()
      lost = true
    }
    const onRestored = () => {
      lost = setup() !== 'ok'
    }

    canvas.addEventListener('webglcontextlost', onLost)
    canvas.addEventListener('webglcontextrestored', onRestored)
    window.addEventListener('pointermove', onPointerMove)
    const status = setup()
    if (status === 'failed') {
      /* device claims WebGL2 but can't run the scene — flip the site
         to the CSS gradient fallbacks */
      reportGlFailure()
      canvas.removeEventListener('webglcontextlost', onLost)
      canvas.removeEventListener('webglcontextrestored', onRestored)
      window.removeEventListener('pointermove', onPointerMove)
      return
    }
    if (status === 'lost') {
      /* transient loss — the restored handler re-runs setup */
      lost = true
    }
    raf = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(raf)
      canvas.removeEventListener('webglcontextlost', onLost)
      canvas.removeEventListener('webglcontextrestored', onRestored)
      window.removeEventListener('pointermove', onPointerMove)
      /* free the heavy resources but do NOT loseContext(): the canvas
         DOM node survives a StrictMode remount and a lost context can
         never be re-created on the same node. The context itself is
         released when the canvas leaves the DOM. */
      if (gl && program) gl.deleteProgram(program)
      gl = null
      program = null
    }
  }, [frag])

  return (
    <canvas
      ref={canvasRef}
      data-renderer="gl-fallback"
      aria-hidden="true"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }}
    />
  )
}
