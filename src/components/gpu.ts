import { useEffect, useState } from 'react'

/*
 * Real WebGPU capability probe. `'gpu' in navigator` is not enough:
 * iOS Safari (and others) expose the API while requestAdapter()
 * returns null — scenes would render nothing AND the CSS fallback
 * would never engage. So we ask for an actual adapter once at boot;
 * on failure the `no-webgpu` class turns on the animated-gradient
 * fallbacks, and the fx components skip mounting scenes entirely.
 */

let known: boolean | null = null
const listeners = new Set<(ok: boolean) => void>()

async function probe(): Promise<boolean> {
  try {
    const gpu = (navigator as unknown as { gpu?: { requestAdapter(): Promise<unknown> } }).gpu
    if (!gpu) return false
    const adapter = await gpu.requestAdapter()
    return adapter != null
  } catch {
    return false
  }
}

export const gpuReady: Promise<boolean> =
  typeof window === 'undefined'
    ? Promise.resolve(false)
    : probe().then((ok) => {
        known = ok
        if (!ok) document.documentElement.classList.add('no-webgpu')
        listeners.forEach((l) => l(ok))
        listeners.clear()
        return ok
      })

/* reactive view of the probe for the fx lifecycle components */
export function useGpuOk(): boolean {
  const [ok, setOk] = useState(known === true)
  useEffect(() => {
    if (known !== null) {
      setOk(known)
      return
    }
    const l = (v: boolean) => setOk(v)
    listeners.add(l)
    return () => {
      listeners.delete(l)
    }
  }, [])
  return ok
}
