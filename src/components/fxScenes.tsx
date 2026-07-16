import { ReactNode, useEffect } from 'react'
import {
  Shader,
  Blob,
  ChromaFlow,
  CursorRipples,
  Dither,
  FilmGrain,
  FlutedGlass,
  SolidColor,
  Stretch,
  Stripes,
  Swirl,
  WaveDistortion,
} from 'shaders/react'
import { COARSE_POINTER } from './pointer'
import { fxFrameRendered, fxSceneMounted } from './gpu'

/*
 * All WebGL scene definitions live here so the shaders engine ships in
 * its own lazy chunk — CardFx.tsx imports this module on demand the
 * first time any scene mounts. Do not import this file statically.
 */

const fillStyle = { position: 'absolute', inset: 0, width: '100%', height: '100%' } as const

/*
 * Shader root wired to the GPU watchdog (gpu.ts): mounting arms it, and
 * onReady — which the engine fires only after the first successfully
 * rendered frame — proves the device. Devices that pass the adapter
 * probe but can't actually run the engine (iOS Safari) downgrade to the
 * CSS fallbacks instead of showing blank canvases.
 */
function FxShader({ children }: { children: ReactNode }) {
  useEffect(() => fxSceneMounted(), [])
  return (
    <Shader style={fillStyle} onReady={fxFrameRendered}>
      {children}
    </Shader>
  )
}

/*
 * Hero scene (user-specified structure: Swirl + ChromaFlow + FlutedGlass
 * + FilmGrain) tuned to the SalesUp design system. On desktop the cursor
 * paints brand greens (ChromaFlow). On touch devices — where no cursor
 * exists — a soft animated green blob keeps the brand color present.
 */
export function HeroScene({ dark }: { dark: boolean }) {
  return (
    <FxShader>
      <Swirl
        colorA={dark ? '#0b1b1c' : '#ffffff'}
        colorB={dark ? '#11393a' : '#eefaf4'}
        detail={1.7}
      />
      {COARSE_POINTER ? (
        /* touch ambient: light mode gets the broad brand-green wash;
           dark mode stays near-black with only a small, deep, faint
           glow (a bright full-size blob turned the dark hero green) */
        <Blob
          colorA={dark ? '#0a8f5c' : '#04cb79'}
          colorB={dark ? '#0d4a41' : '#5fcfad'}
          deformation={0.8}
          size={dark ? 0.55 : 0.9}
          softness={1}
          speed={0.5}
          opacity={dark ? 0.22 : 0.4}
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
    </FxShader>
  )
}

/*
 * The card scenes (user-specified structure: Stripes + Stretch + Dither;
 * colors retuned to the SalesUp design-system palette).
 */
const CARD_SCENES: (() => ReactNode)[] = [
  () => (
    <FxShader>
      <Stripes angle={-14} balance={0.77} density={4} softness={0.57} />
      <Stretch center={{ x: 0.2, y: 0.52 }} falloff={0.49} />
      <Dither colorA="#04cb79" colorB="#b9f4df" threshold={0.66} />
    </FxShader>
  ),
  () => (
    <FxShader>
      <Stripes angle={24} balance={0.77} density={4} softness={0.57} />
      <Stretch angle={251} center={{ x: 0.45, y: 0.58 }} falloff={0.49} />
      <Dither colorA="#5fcfad" colorB="#076c61" threshold={0.66} />
    </FxShader>
  ),
  () => (
    <FxShader>
      <Stripes angle={-110} balance={0.77} density={4} softness={0.57} />
      <Stretch angle={289} center={{ x: 0.82, y: 0.6 }} falloff={0.49} />
      <Dither colorA="#04e286" colorB="#133f40" threshold={0.66} />
    </FxShader>
  ),
  () => (
    <FxShader>
      <Stripes angle={32} balance={0.77} density={4} softness={0.57} />
      <Stretch angle={165} center={{ x: 0.34, y: 0.37 }} falloff={0.49} />
      <Dither colorA="#9ae8c9" colorB="#03a462" threshold={0.66} />
    </FxShader>
  ),
  () => (
    <FxShader>
      <Stripes angle={-76} balance={0.77} density={4} softness={0.57} />
      <Stretch angle={360} center={{ x: 0.56, y: 0.44 }} falloff={0.49} />
      <Dither colorA="#0b4844" colorB="#04b76d" threshold={0.66} />
    </FxShader>
  ),
  () => (
    <FxShader>
      <Stripes angle={-102} balance={0.77} density={4} softness={0.57} />
      <Stretch angle={246} center={{ x: 0.4, y: 0.62 }} falloff={0.49} />
      <Dither colorA="#177e6f" colorB="#5fcfad" threshold={0.66} />
    </FxShader>
  ),
  () => (
    <FxShader>
      <Stripes angle={-115} balance={0.77} density={4} softness={0.57} />
      <Stretch angle={258} center={{ x: 0.53, y: 0.53 }} falloff={0.49} />
      <Dither colorA="#039458" colorB="#b9f4df" threshold={0.66} />
    </FxShader>
  ),
]

export function CardScene({ variant }: { variant: number }) {
  return <>{CARD_SCENES[variant % CARD_SCENES.length]()}</>
}

/*
 * Footer mega-logo scene (user-specified structure: SolidColor base +
 * Swirl + mouse-following Blob + WaveDistortion + CursorRipples +
 * FilmGrain, retuned to SalesUp colors). Rendered through a CSS mask of
 * the SalesUp wordmark, so the logo appears filled with living glass
 * that follows and ripples with the cursor.
 */
export function MegaLogoScene({ dark }: { dark: boolean }) {
  return (
    <FxShader>
      <SolidColor color={dark ? '#0e2e2f' : '#104041'} />
      <Swirl
        blend={45}
        colorA="#04cb79"
        colorB={dark ? '#0b4844' : '#076c61'}
        colorSpace="oklab"
        detail={3.5}
        speed={0.6}
      />
      <Blob
        blendMode="linearDodge"
        center={{
          type: 'mouse-position',
          reach: 0.55,
          originX: 0.5,
          originY: 0.5,
          momentum: 0.3,
          smoothing: 0.3,
        }}
        colorA="#05ffa6"
        colorB="#04b76d"
        deformation={0.9}
        size={0.15}
        softness={0.7}
      />
      <WaveDistortion angle={23} edges="mirror" frequency={5.1} speed={2.5} strength={0.15} />
      <CursorRipples chromaticSplit={2} decay={5} intensity={20} radius={0.7} />
      <FilmGrain strength={0.075} />
    </FxShader>
  )
}

/*
 * Contact panel (user-specified structure: Swirl + ChromaFlow +
 * FlutedGlass + FilmGrain) retuned to the SalesUp panel teals so the
 * effect stays subtle; the cursor paints soft brand greens across it.
 */
export function ContactScene({ dark }: { dark: boolean }) {
  return (
    <FxShader>
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
    </FxShader>
  )
}
