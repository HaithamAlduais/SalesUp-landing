import { lazy, ReactNode, Suspense, useEffect, useRef, useState } from 'react'

/*
 * Lifecycle wrappers for the WebGL scenes. The scene definitions (and
 * the whole shaders engine) live in fxScenes.tsx, loaded lazily the
 * first time a scene actually mounts — pages ship without the engine
 * in their initial bundle.
 */

export { COARSE_POINTER } from './pointer'

const fillStyle = { position: 'absolute', inset: 0, width: '100%', height: '100%' } as const

const HeroScene = lazy(() => import('./fxScenes').then((m) => ({ default: m.HeroScene })))
const CardScene = lazy(() => import('./fxScenes').then((m) => ({ default: m.CardScene })))
const MegaLogoScene = lazy(() => import('./fxScenes').then((m) => ({ default: m.MegaLogoScene })))
const ContactScene = lazy(() => import('./fxScenes').then((m) => ({ default: m.ContactScene })))

/*
 * Mounts its children only while near the viewport. Offscreen scenes
 * release their GPU device (each <Shader> root holds its own), and a
 * remount on re-entry also recovers from any device loss.
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

/* hero band scene — see fxScenes.HeroScene */
export function HeroFx({ dark }: { dark: boolean }) {
  return (
    <InViewGate>
      <HeroScene dark={dark} />
    </InViewGate>
  )
}

/*
 * Hover-mounted card effect (desktop): mounts the WebGL scene on
 * pointerenter and unmounts ~600ms after pointerleave so only the
 * hovered card holds a GPU context. Visibility fades via CSS :hover.
 */
export function CardFx({ variant }: { variant: number }) {
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
      {on ? (
        <Suspense fallback={null}>
          <CardScene variant={variant} />
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
      {on ? (
        <Suspense fallback={null}>
          <CardScene variant={variant} />
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
      {on ? (
        <Suspense fallback={null}>
          <CardScene variant={variant} />
        </Suspense>
      ) : null}
    </div>
  )
}

/* footer mega-logo scene — see fxScenes.MegaLogoScene */
export function MegaLogoFx({ dark }: { dark: boolean }) {
  return (
    <InViewGate margin="160px">
      <MegaLogoScene dark={dark} />
    </InViewGate>
  )
}

/* contact panel scene — see fxScenes.ContactScene */
export function ContactFx({ dark }: { dark: boolean }) {
  return (
    <div className="contact-fx" aria-hidden="true">
      <InViewGate>
        <ContactScene dark={dark} />
      </InViewGate>
    </div>
  )
}
