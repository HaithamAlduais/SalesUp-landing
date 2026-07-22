import { lazy, Suspense, useEffect, useState } from 'react'
import { engineProofFailed, isEngineProven, shouldAttemptEngineProof, useFxMode } from './gpu'

/*
 * Phones boot on the instant WebGL tier so shaders are always visible.
 * This component then quietly answers "could this phone have run the
 * REAL web engine?" by mounting the actual hero scene at 2×2px in a
 * corner. One rendered frame (Shader onReady → fxFrameRendered) marks
 * the device proven, and every later visit runs the same WebGPU engine
 * as the web. No frame within the timeout marks it broken for a few
 * days so the heavy engine chunk isn't fetched again and again on
 * phones that can't use it.
 *
 * The full HeroScene — not a trivial scene — is the test on purpose:
 * iOS proved an engine can pass every capability probe and still die
 * compiling the real effects.
 */

const HeroScene = lazy(() => import('./fxScenes').then((m) => ({ default: m.HeroScene })))

/* let the page settle before spending radio + GPU on a background test */
const START_DELAY_MS = 6000
const PROOF_TIMEOUT_MS = 12000

const proofStyle = {
  position: 'fixed',
  bottom: 0,
  insetInlineStart: 0,
  width: 2,
  height: 2,
  opacity: 0.02,
  pointerEvents: 'none',
  zIndex: 1,
} as const

export function EngineProof() {
  const mode = useFxMode()
  const [phase, setPhase] = useState<'idle' | 'running' | 'done'>('idle')

  useEffect(() => {
    if (mode !== 'webgl' || phase !== 'idle') return
    let cancelled = false
    const t = window.setTimeout(() => {
      /* a hidden tab throttles rAF to nothing — starting there would
         time the proof out and wrongly convict a capable phone */
      if (document.visibilityState !== 'visible') {
        if (!cancelled) setPhase('done')
        return
      }
      shouldAttemptEngineProof().then((go) => {
        if (!cancelled) setPhase(go ? 'running' : 'done')
      })
    }, START_DELAY_MS)
    return () => {
      cancelled = true
      window.clearTimeout(t)
    }
  }, [mode, phase])

  useEffect(() => {
    if (phase !== 'running') return
    /* only count time the tab actually spends visible: rendering is
       throttled while hidden, so hidden time proves nothing either way */
    let visibleMs = 0
    let last = Date.now()
    const poll = window.setInterval(() => {
      const now = Date.now()
      if (document.visibilityState === 'visible') visibleMs += now - last
      last = now
      if (isEngineProven()) {
        window.clearInterval(poll)
        setPhase('done')
      } else if (visibleMs > PROOF_TIMEOUT_MS) {
        window.clearInterval(poll)
        engineProofFailed()
        setPhase('done')
      }
    }, 500)
    return () => window.clearInterval(poll)
  }, [phase])

  if (phase !== 'running') return null
  return (
    <div style={proofStyle} aria-hidden="true">
      <Suspense fallback={null}>
        <HeroScene dark={false} />
      </Suspense>
    </div>
  )
}
