import { useEffect, useState } from 'react'

/*
 * GPU capability pipeline for the shader engine (WebGPU-only, no WebGL
 * path). Three layers, because `navigator.gpu` existing means almost
 * nothing on mobile Safari:
 *
 *  1. Boot probe — request a real adapter AND device. iOS Safari
 *     exposes the API and can still hand back nothing.
 *  2. Render watchdog — even with a live device the engine can die
 *     during pipeline compilation, and the library swallows the error
 *     (console.error, blank canvas). Every mounted scene arms a timer;
 *     the first rendered frame (Shader onReady) proves the engine for
 *     good. If a visible scene produces no frame in time, downgrade to
 *     the CSS gradient fallbacks.
 *  3. Persistence — a downgrade verdict is remembered for a few days so
 *     repeat visits paint the fallbacks instantly instead of waiting on
 *     the watchdog again. Any successful frame clears it.
 *
 * Debug: `?nogpu` forces the probe to fail; `?fxdead` ignores onReady so
 * the watchdog path can be exercised on a healthy device. The verdict is
 * mirrored on <html data-gpu="..."> for remote inspection.
 */

const VERDICT_KEY = 'salesup:gpu-broken'
const VERDICT_TTL_MS = 3 * 24 * 60 * 60 * 1000
const WATCHDOG_MS = 4000

type GpuLike = {
  requestAdapter(): Promise<null | {
    requestDevice(): Promise<null | { destroy?: () => void }>
  }>
}

let known: boolean | null = null
const listeners = new Set<(ok: boolean) => void>()

function mark(reason: string) {
  document.documentElement.dataset.gpu = reason
}

function emit(ok: boolean, reason: string) {
  known = ok
  document.documentElement.classList.toggle('no-webgpu', !ok)
  mark(reason)
  listeners.forEach((l) => l(ok))
}

function hasParam(name: string): boolean {
  try {
    return new URLSearchParams(window.location.search).has(name)
  } catch {
    return false
  }
}

function rememberedBroken(): boolean {
  try {
    const raw = localStorage.getItem(VERDICT_KEY)
    if (!raw) return false
    const t = Number(raw)
    if (!Number.isFinite(t) || Date.now() - t > VERDICT_TTL_MS) {
      localStorage.removeItem(VERDICT_KEY)
      return false
    }
    return true
  } catch {
    return false
  }
}

async function probe(): Promise<{ ok: boolean; reason: string }> {
  try {
    if (hasParam('nogpu')) return { ok: false, reason: 'forced-off' }
    if (rememberedBroken()) return { ok: false, reason: 'remembered-broken' }
    const gpu = (navigator as unknown as { gpu?: GpuLike }).gpu
    if (!gpu) return { ok: false, reason: 'no-api' }
    const adapter = await gpu.requestAdapter()
    if (!adapter) return { ok: false, reason: 'no-adapter' }
    const device = await adapter.requestDevice()
    if (!device) return { ok: false, reason: 'no-device' }
    device.destroy?.()
    return { ok: true, reason: 'ok' }
  } catch {
    return { ok: false, reason: 'probe-error' }
  }
}

export const gpuReady: Promise<boolean> =
  typeof window === 'undefined'
    ? Promise.resolve(false)
    : probe().then(({ ok, reason }) => {
        emit(ok, reason)
        return ok
      })

/* ---------- render watchdog ---------- */

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
  if (proven || known !== true || watchdog !== undefined) return
  watchdog = window.setTimeout(() => {
    watchdog = undefined
    if (proven || mountedScenes === 0) return
    if (!anySceneCanvasVisible()) {
      /* nothing on screen actually tried to render — judge later */
      armWatchdog()
      return
    }
    try {
      localStorage.setItem(VERDICT_KEY, String(Date.now()))
    } catch {
      /* private browsing — session-only verdict */
    }
    emit(false, 'dead-engine')
  }, WATCHDOG_MS)
}

/* first rendered frame anywhere — the engine works on this device */
export function fxFrameRendered() {
  if (hasParam('fxdead')) return
  proven = true
  mark('proven')
  if (watchdog !== undefined) {
    window.clearTimeout(watchdog)
    watchdog = undefined
  }
  try {
    localStorage.removeItem(VERDICT_KEY)
  } catch {
    /* ignore */
  }
}

/* a scene mounted: give the engine WATCHDOG_MS to produce a frame.
   Returns the matching unmount cleanup. */
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

/* reactive view of the capability verdict for the fx lifecycle
   components — flips mid-session if the watchdog downgrades */
export function useGpuOk(): boolean {
  const [ok, setOk] = useState(known === true)
  useEffect(() => {
    setOk(known === true)
    const l = (v: boolean) => setOk(v)
    listeners.add(l)
    return () => {
      listeners.delete(l)
    }
  }, [])
  return ok
}
