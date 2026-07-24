import { useEffect, useState } from 'react'
import { COARSE_POINTER } from './pointer'

/*
 * Fx engine selection. Three render tiers:
 *
 *   'webgpu' — the vendor shaders engine (richest; desktop default)
 *   'webgl'  — our own GLSL ports of the four scenes (glScenes.tsx);
 *              universal mobile path — WebGL2 runs on iOS 15+ and
 *              essentially every Android, while WebGPU only exists on
 *              iOS 26+ and is flaky in mobile Safari even there
 *   'css'    — animated brand-gradient fallbacks (html.no-webgpu),
 *              for relics with no WebGL2
 *
 * Selection:
 *  - Coarse pointers (phones/tablets) go straight to 'webgl':
 *    deterministic, instant, and visually near-identical — the vendor
 *    engine's extra richness is cursor-driven, which touch never sees.
 *  - Fine pointers probe WebGPU (real adapter AND device — iOS Safari
 *    exposes the API and can still hand back nothing). Pass → 'webgpu'
 *    guarded by the render watchdog below; fail → 'webgl' → 'css'.
 *  - Watchdog: the engine can die during pipeline compilation and the
 *    library swallows the error (console.error, blank canvas). Every
 *    mounted scene arms a timer; the first rendered frame (Shader
 *    onReady) proves the engine for good. A visible scene that never
 *    renders downgrades 'webgpu' → 'webgl', remembered for a few days
 *    so repeat visits skip the wait. Any successful frame clears it.
 *
 * Debug: ?fx=webgpu|webgl|css forces a tier (legacy ?nogpu → css);
 * ?fxdead ignores onReady to exercise the watchdog. The decision is
 * mirrored on <html data-gpu="mode:reason"> for remote inspection.
 */

export type FxMode = 'webgpu' | 'webgl' | 'css'

const VERDICT_KEY = 'salesup:gpu-broken'
const VERDICT_TTL_MS = 3 * 24 * 60 * 60 * 1000
const WATCHDOG_MS = 4000

type GpuLike = {
  requestAdapter(): Promise<null | {
    requestDevice(): Promise<null | { destroy?: () => void }>
  }>
}

let mode: FxMode | null = null
const listeners = new Set<(m: FxMode) => void>()

function setMode(m: FxMode, reason: string) {
  mode = m
  document.documentElement.classList.toggle('no-webgpu', m === 'css')
  document.documentElement.dataset.gpu = `${m}:${reason}`
  listeners.forEach((l) => l(m))
}

function hasParam(name: string): boolean {
  try {
    return new URLSearchParams(window.location.search).has(name)
  } catch {
    return false
  }
}

function forcedMode(): FxMode | null {
  try {
    const p = new URLSearchParams(window.location.search)
    if (p.has('nogpu')) return 'css'
    const fx = p.get('fx')
    if (fx === 'webgpu' || fx === 'webgl' || fx === 'css') return fx
  } catch {
    /* ignore */
  }
  return null
}

let glKnown: boolean | null = null
function webgl2Available(): boolean {
  if (glKnown !== null) return glKnown
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl2')
    glKnown = gl != null
    gl?.getExtension('WEBGL_lose_context')?.loseContext()
  } catch {
    glKnown = false
  }
  return glKnown
}

function remembered(key: string, ttl: number): boolean {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return false
    const t = Number(raw)
    if (!Number.isFinite(t) || Date.now() - t > ttl) {
      localStorage.removeItem(key)
      return false
    }
    return true
  } catch {
    return false
  }
}

function remember(key: string) {
  try {
    localStorage.setItem(key, String(Date.now()))
  } catch {
    /* private browsing — session-only */
  }
}

function forget(key: string) {
  try {
    localStorage.removeItem(key)
  } catch {
    /* ignore */
  }
}

const rememberedBroken = () => remembered(VERDICT_KEY, VERDICT_TTL_MS)

async function probeWebGpu(): Promise<{ ok: boolean; reason: string }> {
  try {
    const gpu = (navigator as unknown as { gpu?: GpuLike }).gpu
    if (!gpu) return { ok: false, reason: 'no-webgpu-api' }
    const adapter = await gpu.requestAdapter()
    if (!adapter) return { ok: false, reason: 'no-adapter' }
    const device = await adapter.requestDevice()
    if (!device) return { ok: false, reason: 'no-device' }
    device.destroy?.()
    return { ok: true, reason: 'probe-ok' }
  } catch {
    return { ok: false, reason: 'probe-error' }
  }
}

function glTier(): FxMode {
  return webgl2Available() ? 'webgl' : 'css'
}

async function boot(): Promise<FxMode> {
  const forced = forcedMode()
  if (forced) {
    setMode(forced === 'webgl' && !webgl2Available() ? 'css' : forced, 'forced')
    return mode as FxMode
  }
  /* every device — phones included — runs the REAL engine first (the
     client's own shader compositions). The WebGL replica exists only
     as the fallback for hardware that demonstrably cannot render it
     (watchdog verdict, remembered for a few days). */
  if (rememberedBroken()) {
    setMode(glTier(), 'remembered-broken')
    return mode as FxMode
  }
  const { ok, reason } = await probeWebGpu()
  setMode(ok ? 'webgpu' : glTier(), reason)
  /* on touch devices the engine's first frame can be several seconds
     out (chunk download + compile — or never, on broken GPUs), so the
     fx layers paint the animated brand gradient until a frame lands */
  if (ok && COARSE_POINTER) document.documentElement.classList.add('fx-unproven')
  return mode as FxMode
}

export const gpuReady: Promise<FxMode> =
  typeof window === 'undefined' ? Promise.resolve('css') : boot()

/* ---------- render watchdog (webgpu tier only) ---------- */

let proven = false
let mountedScenes = 0
let watchdog: number | undefined

function anySceneCanvasVisible(): boolean {
  const canvases = document.querySelectorAll('canvas[data-renderer="shaders"]')
  for (const canvas of canvases) {
    const r = canvas.getBoundingClientRect()
    if (
      r.width > 0 &&
      r.height > 0 &&
      r.bottom > 0 &&
      r.top < window.innerHeight &&
      r.right > 0 &&
      r.left < window.innerWidth
    ) {
      return true
    }
  }
  return false
}

function armWatchdog() {
  if (proven || mode !== 'webgpu' || watchdog !== undefined) return
  watchdog = window.setTimeout(() => {
    watchdog = undefined
    if (proven || mountedScenes === 0 || mode !== 'webgpu') return
    if (!anySceneCanvasVisible()) {
      /* nothing on screen actually tried to render — judge later */
      armWatchdog()
      return
    }
    remember(VERDICT_KEY)
    document.documentElement.classList.remove('fx-unproven')
    setMode(glTier(), 'dead-engine')
  }, WATCHDOG_MS)
}

/* first rendered frame anywhere — the vendor engine works here */
export function fxFrameRendered() {
  if (hasParam('fxdead')) return
  proven = true
  document.documentElement.dataset.gpu = 'webgpu:proven'
  document.documentElement.classList.remove('fx-unproven')
  if (watchdog !== undefined) {
    window.clearTimeout(watchdog)
    watchdog = undefined
  }
  forget(VERDICT_KEY)
}

/* a webgpu scene mounted: give the engine WATCHDOG_MS to produce a
   frame. Returns the matching unmount cleanup. */
export function fxSceneMounted(): () => void {
  mountedScenes++
  armWatchdog()
  return () => {
    mountedScenes--
    if (mountedScenes === 0 && !proven && watchdog !== undefined) {
      window.clearTimeout(watchdog)
      watchdog = undefined
    }
  }
}

/* the WebGL tier failed to compile/run a scene — last stop: CSS */
export function reportGlFailure() {
  if (mode === 'css') return
  setMode('css', 'webgl-failed')
}

/* ?fxinfo — on-screen tier badge. Phones have no devtools; a
   screenshot of this badge answers which tier is active, whether any
   scene canvases exist, and whether the gradient bridge is stuck. */
if (typeof window !== 'undefined' && hasParam('fxinfo')) {
  const badge = document.createElement('div')
  badge.style.cssText =
    'position:fixed;bottom:8px;right:8px;z-index:2147483647;background:rgba(0,0,0,0.85);' +
    'color:#35e3ad;font:11px/1.7 monospace;padding:8px 10px;border-radius:8px;' +
    'direction:ltr;text-align:left;pointer-events:none;max-width:86vw;white-space:pre'
  let rafTicks = 0
  const countTick = () => {
    rafTicks++
    requestAnimationFrame(countTick)
  }
  requestAnimationFrame(countTick)
  const tick = () => {
    badge.textContent = [
      'tier: ' + (document.documentElement.dataset.gpu || 'booting…'),
      'engine canvases: ' + document.querySelectorAll('canvas[data-renderer="shaders"]').length,
      'webgl canvases: ' + document.querySelectorAll('canvas[data-renderer="gl-fallback"]').length,
      'gradient bridge: ' + document.documentElement.classList.contains('fx-unproven'),
      'frames: ' + rafTicks,
    ].join('\n')
  }
  const start = () => {
    document.body.appendChild(badge)
    tick()
    setInterval(tick, 1000)
  }
  if (document.body) start()
  else window.addEventListener('DOMContentLoaded', start)
}


/* reactive view of the engine tier for the fx lifecycle components —
   null while the boot probe is still in flight */
export function useFxMode(): FxMode | null {
  const [m, setM] = useState(mode)
  useEffect(() => {
    setM(mode)
    const l = (v: FxMode) => setM(v)
    listeners.add(l)
    return () => {
      listeners.delete(l)
    }
  }, [])
  return m
}
