import { ReactNode, useEffect, useRef, useState } from 'react'
import {
  Shader,
  Blob,
  ChromaFlow,
  Dither,
  FilmGrain,
  FlutedGlass,
  Stretch,
  Stripes,
  Swirl,
} from 'shaders/react'

const fillStyle = { position: 'absolute', inset: 0, width: '100%', height: '100%' } as const

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
      {on ? children : null}
    </div>
  )
}

/* coarse pointer = touch device: no hover, needs always-visible effects.
   `?coarse` forces it so touch behavior can be previewed on desktop. */
export const COARSE_POINTER =
  typeof window !== 'undefined' &&
  (window.matchMedia('(hover: none)').matches ||
    new URLSearchParams(window.location.search).has('coarse'))

/*
 * Hero scene (user-specified structure: Swirl + ChromaFlow + FlutedGlass
 * + FilmGrain) tuned to the SalesUp design system. On desktop the cursor
 * paints brand greens (ChromaFlow). On touch devices — where no cursor
 * exists — a soft animated green blob keeps the brand color present.
 */
export function HeroFx({ dark }: { dark: boolean }) {
  return (
    <InViewGate>
      <Shader style={fillStyle}>
      <Swirl
        colorA={dark ? '#0b1b1c' : '#ffffff'}
        colorB={dark ? '#11393a' : '#eefaf4'}
        detail={1.7}
      />
      {COARSE_POINTER ? (
        <Blob
          colorA="#04cb79"
          colorB="#5fcfad"
          deformation={0.8}
          size={0.9}
          softness={1}
          speed={0.5}
          opacity={dark ? 0.5 : 0.4}
        />
      ) : null}
      <ChromaFlow
        baseColor={dark ? '#0b1b1c' : '#ffffff'}
        upColor="#04cb79"
        downColor={dark ? '#0b4844' : '#5fcfad'}
        leftColor={dark ? '#03a462' : '#b9f4df'}
        rightColor="#04e286"
        momentum={13}
        radius={3.5}
      />
      <FlutedGlass
        aberration={0.2}
        angle={31}
        frequency={8}
        highlight={0.12}
        highlightSoftness={0}
        lightAngle={-90}
        refraction={4}
        shape="rounded"
        softness={1}
        speed={0.15}
      />
        <FilmGrain strength={0.05} />
      </Shader>
    </InViewGate>
  )
}

/*
 * The card scenes (user-specified structure: Stripes + Stretch + Dither;
 * colors retuned to the SalesUp design-system palette).
 */
const CARD_SCENES: (() => ReactNode)[] = [
  () => (
    <Shader style={fillStyle}>
      <Stripes angle={-14} balance={0.77} density={4} softness={0.57} />
      <Stretch center={{ x: 0.2, y: 0.52 }} falloff={0.49} />
      <Dither colorA="#04cb79" colorB="#b9f4df" threshold={0.66} />
    </Shader>
  ),
  () => (
    <Shader style={fillStyle}>
      <Stripes angle={24} balance={0.77} density={4} softness={0.57} />
      <Stretch angle={251} center={{ x: 0.45, y: 0.58 }} falloff={0.49} />
      <Dither colorA="#5fcfad" colorB="#076c61" threshold={0.66} />
    </Shader>
  ),
  () => (
    <Shader style={fillStyle}>
      <Stripes angle={-110} balance={0.77} density={4} softness={0.57} />
      <Stretch angle={289} center={{ x: 0.82, y: 0.6 }} falloff={0.49} />
      <Dither colorA="#04e286" colorB="#133f40" threshold={0.66} />
    </Shader>
  ),
  () => (
    <Shader style={fillStyle}>
      <Stripes angle={32} balance={0.77} density={4} softness={0.57} />
      <Stretch angle={165} center={{ x: 0.34, y: 0.37 }} falloff={0.49} />
      <Dither colorA="#9ae8c9" colorB="#03a462" threshold={0.66} />
    </Shader>
  ),
  () => (
    <Shader style={fillStyle}>
      <Stripes angle={-76} balance={0.77} density={4} softness={0.57} />
      <Stretch angle={360} center={{ x: 0.56, y: 0.44 }} falloff={0.49} />
      <Dither colorA="#0b4844" colorB="#04b76d" threshold={0.66} />
    </Shader>
  ),
  () => (
    <Shader style={fillStyle}>
      <Stripes angle={-102} balance={0.77} density={4} softness={0.57} />
      <Stretch angle={246} center={{ x: 0.4, y: 0.62 }} falloff={0.49} />
      <Dither colorA="#177e6f" colorB="#5fcfad" threshold={0.66} />
    </Shader>
  ),
  () => (
    <Shader style={fillStyle}>
      <Stripes angle={-115} balance={0.77} density={4} softness={0.57} />
      <Stretch angle={258} center={{ x: 0.53, y: 0.53 }} falloff={0.49} />
      <Dither colorA="#039458" colorB="#b9f4df" threshold={0.66} />
    </Shader>
  ),
]

function Scene({ variant }: { variant: number }) {
  return <>{CARD_SCENES[variant % CARD_SCENES.length]()}</>
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
      {on ? <Scene variant={variant} /> : null}
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
      {on ? <Scene variant={variant} /> : null}
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
      {on ? <Scene variant={variant} /> : null}
    </div>
  )
}

/*
 * Contact panel (user-specified structure: Swirl + ChromaFlow +
 * FlutedGlass + FilmGrain) retuned to the SalesUp panel teals so the
 * effect stays subtle; the cursor paints soft brand greens across it.
 */
export function ContactFx({ dark }: { dark: boolean }) {
  return (
    <div className="contact-fx" aria-hidden="true">
      <InViewGate>
        <Shader style={fillStyle}>
          <Swirl
            colorA={dark ? '#0c2b2c' : '#133f40'}
            colorB={dark ? '#134243' : '#177e6f'}
            detail={1.7}
          />
          {/* damped so the cursor wash never drops the white copy below
              readable contrast */}
          <ChromaFlow
            baseColor={dark ? '#0f3334' : '#16494a'}
            upColor="#039458"
            downColor="#03a462"
            leftColor="#177e6f"
            rightColor="#04b76d"
            momentum={13}
            radius={3.5}
            opacity={0.45}
          />
          <FlutedGlass
            aberration={0.61}
            frequency={8}
            highlight={0.12}
            highlightSoftness={0}
            lightAngle={-90}
            refraction={4}
            shape="rounded"
            softness={1}
            speed={0.15}
          />
          <FilmGrain strength={0.05} />
        </Shader>
      </InViewGate>
    </div>
  )
}
