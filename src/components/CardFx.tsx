import { lazy, ReactNode, Suspense, useEffect, useRef, useState } from 'react'

/*
 * Lifecycle wrappers for the fx scenes. Two lazy engine chunks:
 * fxScenes.tsx (the WebGPU vendor engine) and glScenes.tsx (our WebGL2
 * ports — the universal mobile path). gpu.ts picks the tier; these
 * wrappers mount whichever implementation the tier calls for, only
 * while the scene is actually needed (near viewport / hovered / active).
 */

export { COARSE_POINTER } from './pointer'
import { gpuReady, useFxMode, FxMode } from './gpu'

const fillStyle = { position: 'absolute', inset: 0, width: '100%', height: '100%' } as const

const HeroScene = lazy(() => import('./fxScenes').then((m) => ({ default: m.HeroScene })))
const CardScene = lazy(() => import('./fxScenes').then((m) => ({ default: m.CardScene })))
const MegaLogoScene = lazy(() => import('./fxScenes').then((m) => ({ default: m.MegaLogoScene })))
const ContactScene = lazy(() => import('./fxScenes').then((m) => ({ default: m.ContactScene })))

const HeroSceneGL = lazy(() => import('./glScenes').then((m) => ({ default: m.HeroSceneGL })))
const CardSceneGL = lazy(() => import('./glScenes').then((m) => ({ default: m.CardSceneGL })))
const MegaLogoSceneGL = lazy(() => import('./glScenes').then((m) => ({ default: m.MegaLogoSceneGL })))
const ContactSceneGL = lazy(() => import('./glScenes').then((m) => ({ default: m.ContactSceneGL })))

/* warm the right engine chunk so scenes appear instantly when their
   gates open. The GL chunk is small and phones show the hero at load,
   so it warms immediately; the big vendor chunk waits for idle time. */
if (typeof window !== 'undefined') {
  gpuReady.then((m) => {
    if (m === 'webgl') {
      import('./glScenes')
      return
    }
    if (m !== 'webgpu') return
    const warm = () => {
      import('./fxScenes')
    }
    if (typeof window.requestIdleCallback === 'function') {
      window.requestIdleCallback(warm, { timeout: 2500 })
    } else {
      setTimeout(warm, 800)
    }
  })
}

function renders(mode: FxMode | null): mode is 'webgpu' | 'webgl' {
  return mode === 'webgpu' || mode === 'webgl'
}

/*
 * Mounts its children only while near the viewport. Offscreen scenes
 * release their GPU device/context, and a remount on re-entry also
 * recovers from any device loss.
 */
function InViewGate({ children, margin = '220px' }: { children: ReactNode; margin?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [on, setOn] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => setOn(entries[0].isIntersecting),
      { rootMargin: margin }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [margin])

  return (
    <div ref={ref} style={fillStyle}>
      {on ? <Suspense fallback={null}>{children}</Suspense> : null}
    </div>
  )
}

/* hero band scene */
export function HeroFx({ dark }: { dark: boolean }) {
  const mode = useFxMode()
  if (!renders(mode)) return null
  return (
    <InViewGate>
      {mode === 'webgpu' ? <HeroScene dark={dark} /> : <HeroSceneGL dark={dark} />}
    </InViewGate>
  )
}

/*
 * Hover-mounted card effect (desktop): mounts the scene on pointerenter
 * and unmounts ~600ms after pointerleave so only the hovered card holds
 * a GPU context. Visibility fades via CSS :hover.
 */
export function CardFx({ variant }: { variant: number }) {
  const mode = useFxMode()
  const ref = useRef<HTMLDivElement>(null)
  const [on, setOn] = useState(false)

  useEffect(() => {
    const parent = ref.current?.parentElement
    if (!parent) return
    let timer: number | undefined
    const enter = () => {
      window.clearTimeout(timer)
      setOn(true)
    }
    const leave = () => {
      timer = window.setTimeout(() => setOn(false), 650)
    }
    parent.addEventListener('pointerenter', enter)
    parent.addEventListener('pointerleave', leave)
    return () => {
      window.clearTimeout(timer)
      parent.removeEventListener('pointerenter', enter)
      parent.removeEventListener('pointerleave', leave)
    }
  }, [])

  return (
    <div className="card-fx" ref={ref} aria-hidden="true">
      {on && renders(mode) ? (
        <Suspense fallback={null}>
          {mode === 'webgpu' ? <CardScene variant={variant} /> : <CardSceneGL variant={variant} />}
        </Suspense>
      ) : null}
    </div>
  )
}

/*
 * State-driven card effect: mounted while `active` (plus a linger for
 * the fade-out). Used by the sticky about slides and the expanding
 * service cards.
 */
export function ActiveFx({ variant, active }: { variant: number; active: boolean }) {
  const mode = useFxMode()
  const [on, setOn] = useState(active)

  useEffect(() => {
    if (active) {
      setOn(true)
      return
    }
    const t = window.setTimeout(() => setOn(false), 650)
    return () => window.clearTimeout(t)
  }, [active])

  return (
    <div className={`card-fx card-fx--state${active ? ' is-on' : ''}`} aria-hidden="true">
      {on && renders(mode) ? (
        <Suspense fallback={null}>
          {mode === 'webgpu' ? <CardScene variant={variant} /> : <CardSceneGL variant={variant} />}
        </Suspense>
      ) : null}
    </div>
  )
}

/*
 * In-view card effect (touch devices): always softly visible while the
 * card is on screen — no hover needed to reveal it.
 */
export function InViewFx({ variant }: { variant: number }) {
  const mode = useFxMode()
  const ref = useRef<HTMLDivElement>(null)
  const [on, setOn] = useState(false)

  useEffect(() => {
    const parent = ref.current?.parentElement
    if (!parent) return
    const observer = new IntersectionObserver(
      (entries) => setOn(entries[0].isIntersecting),
      { rootMargin: '80px' }
    )
    observer.observe(parent)
    return () => observer.disconnect()
  }, [])

  return (
    <div className="card-fx card-fx--inview" ref={ref} aria-hidden="true">
      {on && renders(mode) ? (
        <Suspense fallback={null}>
          {mode === 'webgpu' ? <CardScene variant={variant} /> : <CardSceneGL variant={variant} />}
        </Suspense>
      ) : null}
    </div>
  )
}

/* footer mega-logo scene */
export function MegaLogoFx({ dark }: { dark: boolean }) {
  const mode = useFxMode()
  if (!renders(mode)) return null
  return (
    <InViewGate margin="160px">
      {mode === 'webgpu' ? <MegaLogoScene dark={dark} /> : <MegaLogoSceneGL dark={dark} />}
    </InViewGate>
  )
}

/* contact panel scene */
export function ContactFx({ dark }: { dark: boolean }) {
  const mode = useFxMode()
  return (
    <div className="contact-fx" aria-hidden="true">
      {renders(mode) ? (
        <InViewGate>
          {mode === 'webgpu' ? <ContactScene dark={dark} /> : <ContactSceneGL dark={dark} />}
        </InViewGate>
      ) : null}
    </div>
  )
}
