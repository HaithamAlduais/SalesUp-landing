import { GlScene } from './glRuntime'
import { COARSE_POINTER } from './pointer'

/*
 * WebGL2 (GLSL ES 3.00) ports of the four vendor WebGPU scenes — the
 * universal mobile render tier. Authored against the vendor effect
 * sources (Swirl/Blob/ChromaFlow/FlutedGlass/FilmGrain/Stripes/Stretch/
 * Dither/SolidColor/WaveDistortion/CursorRipples) to match the shipped
 * look; hosted by glRuntime.tsx on a fullscreen triangle. Loaded lazily
 * as its own chunk — do not import this file statically.
 */

/* ============================ hero ============================ */

const HERO_FRAG = `#version 300 es
precision highp float;

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_pointer;

uniform vec3 u_swirlA;
uniform vec3 u_swirlB;
uniform vec3 u_blobA;
uniform vec3 u_blobB;
uniform float u_blobSize;
uniform float u_blobOpacity;
uniform vec3 u_chromaBase;
uniform vec3 u_chromaUp;
uniform vec3 u_chromaDown;
uniform vec3 u_chromaLeft;
uniform vec3 u_chromaRight;
uniform float u_chromaStrength;
uniform float u_aberr;
uniform float u_grain;

in vec2 v_uv;
out vec4 fragColor;

/* ---- Swirl (vendor swirlField, detail = 1.7, blend = 50, speed = 1) ---- */
vec2 swirlField(vec2 uv, float t) {
  float f1 = 1.7;
  vec2 d1 = vec2(
    uv.x + sin(uv.y * f1 * 1.7 + t * 0.8) * 0.12 + cos(uv.x * f1 * 0.9 - t * 0.5) * 0.05,
    uv.y + cos(uv.x * f1 * 1.3 - t * 0.6) * 0.12 + sin(uv.y * f1 * 1.1 + t * 0.7) * 0.05);
  float p1 = sin(d1.x * f1 * 2.1 + d1.y * f1 * 1.8 + t * 0.4);
  float f2 = f1 * 2.1;
  vec2 d2 = vec2(
    d1.x + cos(d1.y * f2 * 2.7 - t * 0.45) * 0.07 + sin(d1.x * f2 * 1.9 + t * 0.6) * 0.04,
    d1.y + sin(d1.x * f2 * 2.3 + t * 0.65) * 0.07 + cos(d1.y * f2 * 1.6 - t * 0.4) * 0.04);
  float p2 = cos(d2.x * f2 * 1.4 - d2.y * f2 * 1.9 + t * 0.35);
  float f3 = f1 * 3.7;
  vec2 d3 = vec2(
    d2.x + sin(d2.y * f3 * 1.8 + t * 0.85) * 0.04 + cos(d2.x * f3 * 1.3 - t * 0.55) * 0.025
         + sin((d2.x + d2.y) * f3 * 0.7 + t * 0.9) * 0.02,
    d2.y + cos(d2.x * f3 * 1.6 - t * 0.75) * 0.04 + sin(d2.y * f3 * 1.1 + t * 0.5) * 0.025
         + cos((d2.x + d2.y) * f3 * 0.8 - t * 0.95) * 0.02);
  float p3 = sin(d3.x * f3 * 1.1 + d3.y * f3 * 1.5 - t * 0.55);
  float combined = p1 * 0.45 + p2 * 0.35 + p3 * 0.2;
  float blendF = smoothstep(0.3, 0.7, combined * 0.5 + 0.5);
  float shimmer = sin(t * 2.5 + combined * 8.0) * 0.015 + 1.0;
  return vec2(blendF, shimmer);
}

/* ---- Blob (vendor blobField; deformation 0.8, softness 1 -> edgeWidth 0.3,
   edgeCurve 2.5; speed 0.5). Returns (mask, colorMixFactor). ---- */
vec2 blobField(vec2 p, float t) {
  /* organic radius, ns = 4, deformation folded into amplitudes */
  float n1 = (sin(p.x * 3.2 + t * 0.8) * sin(p.y * 2.8 + t * 0.6)
            + sin(p.x * 4.8 - (p.y * 3.6 + t * 0.4))) * 0.12;
  float n2 = sin(p.x * 5.6 - t * 0.5) * sin(p.y * 4.4 + t * 0.7) * 0.096;
  float n3 = (sin(p.x * 7.2 + p.y * 6.4 + t * 0.3) + sin(p.x * 2.4 - t * 0.9)) * 0.08;
  float n4 = sin(p.x * 8.8 + t * 0.2) * sin(p.y * 7.6 - t * 0.8) * 0.032;
  float radius = u_blobSize + n1 + n2 + n3 + n4;
  float dist = length(p);
  float linearMask = 1.0 - smoothstep(radius - 0.3, radius + 0.3, dist);
  float mask = pow(max(linearMask, 0.0), 2.5);
  /* color noise */
  float px = p.x * 3.0, py = p.y * 3.0;
  float c1 = (sin(px + t * 0.4) * sin(py + t * 0.3)
            + sin(px * 0.7 + py * 0.8 + t * 0.2)) * 0.5 + 0.5;
  float c2 = (sin(px * 1.3 - t * 0.5) * sin(py * 1.1 + t * 0.6)
            + sin(px * 0.5 - (py * 0.6 - t * 0.3))) * 0.5 + 0.5;
  float mixF = smoothstep(0.1, 0.9, c1 * 0.6 + c2 * 0.4);
  return vec2(mask, mixF);
}

/* ---- layers under the fluted glass, evaluated at a (possibly warped) uv ---- */
vec3 sceneColor(vec2 uv, float aspect) {
  /* Swirl base */
  vec2 sw = swirlField(uv, u_time);
  vec3 col = mix(u_swirlA, u_swirlB, sw.x) * sw.y;

  /* Blob (touch-ambient wash; u_blobOpacity is 0 on fine-pointer devices) */
  if (u_blobOpacity > 0.001) {
    float bt = u_time * 0.5;
    vec2 p = vec2((uv.x - 0.5) * aspect, 0.5 - uv.y);
    /* gentle organic drift of the blob center */
    p -= vec2(sin(bt * 0.46) * 0.10, cos(bt * 0.62) * 0.08);
    vec2 b = blobField(p, bt);
    vec3 blobCol = mix(u_blobA, u_blobB, b.y);
    col = mix(col, blobCol, b.x * u_blobOpacity);
  }

  /* ChromaFlow-like pointer wash; must contribute ZERO when no pointer */
  if (u_pointer.x > -5.0) {
    vec2 dv = uv - u_pointer;
    if (aspect >= 1.0) { dv.x *= aspect; } else { dv.y /= aspect; }
    float r = 0.26 * (1.0 + 0.15 * sin(u_time * 0.9));
    float influence = exp(-dot(dv, dv) / (r * r));
    /* outward direction from pointer stands in for the fluid flow vector,
       with a slow rotational wobble so the wash animates even when still */
    float wob = 0.35 * sin(u_time * 0.4);
    float cw = cos(wob), swb = sin(wob);
    vec2 dir = dv / (length(dv) + 0.001);
    dir = vec2(dir.x * cw - dir.y * swb, dir.x * swb + dir.y * cw);
    float rightA = smoothstep(0.0, 0.7, max(dir.x, 0.0));
    float leftA  = smoothstep(0.0, 0.7, max(-dir.x, 0.0));
    float upA    = smoothstep(0.0, 0.7, max(dir.y, 0.0));
    float downA  = smoothstep(0.0, 0.7, max(-dir.y, 0.0));
    float hw = leftA + rightA;
    float vw = upA + downA;
    float tw = hw + vw + 0.001;
    vec3 dirCol = (u_chromaLeft * leftA + u_chromaRight * rightA) * (hw / tw)
                + (u_chromaDown * downA + u_chromaUp * upA) * (vw / tw);
    vec3 chromaCol = mix(u_chromaBase, dirCol, 0.85);
    float pulse = 0.85 + 0.15 * sin(u_time * 0.7);
    col = mix(col, chromaCol, influence * pulse * u_chromaStrength);
  }
  return col;
}

/* mirror-repeat edge mode (vendor edgeMode 2) */
vec2 mirrorUV(vec2 p) {
  return 1.0 - abs(mod(p, 2.0) - 1.0);
}

void main() {
  float aspect = u_resolution.x / u_resolution.y;

  /* ---- FlutedGlass geometry (angle 31, frequency 8, refraction 4,
     shape rounded + softness 1 -> exponent 3, speed 0.15 with vendor's
     negated time, aberration 0.2, highlight 0.12, lightAngle -90) ---- */
  float ang = radians(31.0);
  float ca = cos(ang), sa = sin(ang);
  /* vendor works in y-down centered coords */
  vec2 c = vec2((v_uv.x - 0.5) * aspect, 0.5 - v_uv.y);
  float u = c.x * ca + c.y * sa;
  float tF = -0.15 * u_time;
  float flutePos = u * 8.0 + tF;
  float cell = (fract(flutePos) - 0.5) * 2.0;
  float slope = sign(cell) * pow(max(abs(cell), 1e-4), 3.0);
  float refrU = -(slope * 4.0) * (0.5 / 8.0);
  /* back to y-up uv space for the offset */
  vec2 uvW = v_uv + vec2(refrU * ca / aspect, -refrU * sa);
  uvW = mirrorUV(uvW);

  vec3 col = sceneColor(uvW, aspect);

  /* chromatic aberration: re-tap the scene for R and B (disabled on coarse
     devices via u_aberr = 0 to keep mobile at one scene evaluation) */
  if (u_aberr > 0.001) {
    float chrU = refrU * u_aberr * 0.5;
    vec2 chrOff = vec2(chrU * ca / aspect, -chrU * sa);
    col.r = sceneColor(mirrorUV(uvW + chrOff), aspect).r;
    col.b = sceneColor(mirrorUV(uvW - chrOff), aspect).b;
  }

  /* fluted specular highlight (shininess = exp2(8) = 256, fresnel-mixed) */
  float slopeSq = min(slope * slope, 1.0);
  float nz = sqrt(1.0 - slopeSq);
  float hx = sin(radians(-90.0) * 0.5);
  float hy = cos(radians(-90.0) * 0.5);
  float nDotH = max(slope * hx + nz * hy, 0.0);
  float fresnel = pow(1.0 - nz, 5.0);
  float fresnelMix = 0.04 + 0.96 * fresnel;
  float spec = pow(nDotH, 256.0) * fresnelMix * 0.12;
  col += vec3(spec);

  /* ---- FilmGrain (strength 0.05, bias 2, static) ---- */
  float noiseIn = dot(gl_FragCoord.xy, vec2(12.9898, 78.233));
  float grain = fract(sin(noiseIn) * 43758.5453) * 2.0 - 1.0;
  float brightness = clamp(dot(col, vec3(0.2126, 0.7152, 0.0722)), 0.0, 1.0);
  float darkFactor = pow(1.0 - brightness + 1e-6, 2.0);
  col += grain * darkFactor * u_grain * 0.1;

  fragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`

export function heroUniforms(dark: boolean, coarse: boolean): Record<string, number | number[]> {
  return {
    // Swirl: colorA/colorB per fxScenes HeroScene
    u_swirlA: dark ? [0.043, 0.106, 0.110] : [1, 1, 1],          // #0b1b1c / #ffffff
    u_swirlB: dark ? [0.067, 0.224, 0.227] : [0.933, 0.980, 0.957], // #11393a / #eefaf4
    // Blob: touch-ambient only; opacity 0 disables the whole layer on fine pointers
    u_blobA: dark ? [0.039, 0.561, 0.361] : [0.016, 0.796, 0.475], // #0a8f5c / #04cb79
    u_blobB: dark ? [0.051, 0.290, 0.255] : [0.373, 0.812, 0.678], // #0d4a41 / #5fcfad
    u_blobSize: dark ? 0.55 : 0.9,
    u_blobOpacity: coarse ? (dark ? 0.22 : 0.4) : 0,
    // ChromaFlow pointer wash
    u_chromaBase: dark ? [0.043, 0.106, 0.110] : [1, 1, 1],        // #0b1b1c / #ffffff
    u_chromaUp: [0.016, 0.796, 0.475],                             // #04cb79
    u_chromaDown: dark ? [0.043, 0.282, 0.267] : [0.373, 0.812, 0.678], // #0b4844 / #5fcfad
    u_chromaLeft: dark ? [0.012, 0.643, 0.384] : [0.725, 0.957, 0.875], // #03a462 / #b9f4df
    u_chromaRight: [0.016, 0.886, 0.525],                          // #04e286
    u_chromaStrength: dark ? 0.45 : 0.6,
    // FlutedGlass chromatic aberration: off on coarse devices (keeps mobile at 1 scene tap)
    u_aberr: coarse ? 0 : 0.2,
    // FilmGrain strength
    u_grain: 0.05,
  };
}

export function HeroSceneGL({ dark }: { dark: boolean }) {
  return <GlScene frag={HERO_FRAG} uniforms={heroUniforms(dark, COARSE_POINTER)} />
}

/* ============================ cards ============================ */

const CARD_FRAG = `#version 300 es
precision highp float;

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_pointer;

uniform vec3 u_colA;          // Dither dark color (dominant, ~77%)
uniform vec3 u_colB;          // Dither light color
uniform float u_stripeAngle;  // degrees
uniform float u_stretchAngle; // degrees
uniform vec2 u_stretchCenter; // vendor y-down position prop (converted in shader)
uniform float u_balance;      // 0.77
uniform float u_density;      // 4
uniform float u_softness;     // 0.57
uniform float u_speed;        // stripe drift speed
uniform float u_threshold;    // 0.66
uniform float u_falloff;      // 0.49
uniform float u_strength;     // vendor Stretch strength (default 1)
uniform float u_pixelSize;    // dither cell size in physical px
uniform float u_phase;        // per-variant animation phase

in vec2 v_uv;
out vec4 fragColor;

const float DEG = 0.0174533;

// Vendor Stretch: compress the projection along a direction on the positive
// side of the center, so content beneath appears stretched toward it.
vec2 stretchUV(vec2 uv, float aspect) {
  vec2 ac = vec2(uv.x * aspect, uv.y);
  vec2 c = vec2(u_stretchCenter.x * aspect, 1.0 - u_stretchCenter.y); // y-down prop -> y-up
  vec2 delta = ac - c;
  float ar = u_stretchAngle * DEG;
  vec2 dir = vec2(cos(ar), sin(ar));
  float proj = dot(delta, dir);
  vec2 perp = delta - dir * proj;
  float tw = mix(0.001, 75.0, u_falloff);          // vendor transition width
  float mask = clamp(proj / tw, 0.0, 1.0);
  // Slow "breathing" of the warp so cards feel alive (vendor is static here)
  float breathe = 0.8 + 0.25 * sin(u_time * 0.35 + u_phase);
  float sf = 1.0 + u_strength * 100.0 * breathe * mask;
  vec2 suv = c + dir * (proj / sf) + perp;
  return vec2(suv.x / aspect, suv.y);
}

// Vendor stripeMaskValue: box-filtered integral of a square wave with duty
// cycle \`bal\`; F(x) = floor(x)*(1-bal) + max(fract(x)-bal, 0).
float stripeF(float x, float bal) {
  return floor(x) * (1.0 - bal) + max(fract(x) - bal, 0.0);
}

// Stripes luminance (vendor stripes are default black->white, so the mask IS
// the luminance the Dither pass sees).
float stripeLuma(vec2 uv, float aspect) {
  float ar = u_stripeAngle * DEG;
  float rc = uv.x * aspect * cos(ar) + uv.y * sin(ar);
  float p = rc * u_density + u_time * u_speed + u_phase * 0.37;
  // vendor: w = max(fwidth(p), eps) + softness; softness (0.57) dominates,
  // so approximate fwidth analytically from the dither cell size.
  float w = max(u_softness + u_pixelSize * u_density / max(u_resolution.y, 1.0), 1e-4);
  return clamp((stripeF(p + 0.5 * w, u_balance) - stripeF(p - 0.5 * w, u_balance)) / w, 0.0, 1.0);
}

// Vendor recursive Bayer 4x4 built from the 2x2 quad b*3 + a*2 - 4ab.
float bayer4(vec2 cell) {
  vec2 t = mod(cell, 4.0);
  vec2 q2 = mod(t, 2.0);
  vec2 qh = floor(t * 0.5);
  float b00 = q2.y * 3.0 + q2.x * 2.0 - 4.0 * q2.x * q2.y;
  float b11 = qh.y * 3.0 + qh.x * 2.0 - 4.0 * qh.x * qh.y;
  return (b00 * 4.0 + b11) / 16.0;
}

void main() {
  float aspect = u_resolution.x / max(u_resolution.y, 1e-6);

  // Dither pixelation: quantize UVs to cells, sample the scene at cell centers
  vec2 cell = floor(v_uv * u_resolution / u_pixelSize);
  vec2 pixUV = (cell + 0.5) * u_pixelSize / u_resolution;

  // Composition order: Dither( Stretch( Stripes ) )
  vec2 suv = stretchUV(pixUV, aspect);
  float luma = stripeLuma(suv, aspect);

  // Vendor ordered dither: spread = 1, so adjusted dither == bayer value
  float b = bayer4(cell);
  float on = step(b, luma + (u_threshold - 0.5));

  vec3 col = mix(u_colA, u_colB, on);
  // u_pointer intentionally unused: cards animate via u_time only, and the
  // no-pointer sentinel (-10,-10) therefore contributes exactly zero.
  fragColor = vec4(col, 1.0);
}
`

export function cardUniforms(variant: number): Record<string, number | number[]> {
  const i = ((variant % 7) + 7) % 7
  const stripeAngle = [-14, 24, -110, 32, -76, -102, -115]
  const stretchAngle = [0, 251, 289, 165, 360, 246, 258]
  const centerX = [0.2, 0.45, 0.82, 0.34, 0.56, 0.4, 0.53]
  const centerY = [0.52, 0.58, 0.6, 0.37, 0.44, 0.62, 0.53]
  // Dither colorA (dark/dominant), colorB (light) per variant, sRGB 0..1
  const colA = [
    [0.016, 0.796, 0.475], // #04cb79
    [0.373, 0.812, 0.678], // #5fcfad
    [0.016, 0.886, 0.525], // #04e286
    [0.604, 0.910, 0.788], // #9ae8c9
    [0.043, 0.282, 0.267], // #0b4844
    [0.090, 0.494, 0.435], // #177e6f
    [0.012, 0.580, 0.345], // #039458
  ]
  const colB = [
    [0.725, 0.957, 0.875], // #b9f4df
    [0.027, 0.424, 0.380], // #076c61
    [0.075, 0.247, 0.251], // #133f40
    [0.012, 0.643, 0.384], // #03a462
    [0.016, 0.718, 0.427], // #04b76d
    [0.373, 0.812, 0.678], // #5fcfad
    [0.725, 0.957, 0.875], // #b9f4df
  ]
  return {
    u_colA: colA[i],
    u_colB: colB[i],
    u_stripeAngle: stripeAngle[i],
    u_stretchAngle: stretchAngle[i],
    u_stretchCenter: [centerX[i], centerY[i]],
    u_balance: 0.77,
    u_density: 4,
    u_softness: 0.57,
    u_speed: 0.1,
    u_threshold: 0.66,
    u_falloff: 0.49,
    u_strength: 1,
    u_pixelSize: 6,
    u_phase: i * 1.7,
  }
}

export function CardSceneGL({ variant }: { variant: number }) {
  return <GlScene frag={CARD_FRAG} uniforms={cardUniforms(variant)} />
}

/* ========================== mega logo ========================== */

const MEGALOGO_FRAG = `#version 300 es
precision highp float;

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_pointer;

uniform vec3 u_base;   // deep teal solid base (sRGB)
uniform vec3 u_swA;    // swirl color A, encoded as cbrt(linearRGB) for oklab-feel mixing
uniform vec3 u_swB;    // swirl color B, encoded as cbrt(linearRGB)
uniform vec3 u_blobA;  // blob bright green (sRGB)
uniform vec3 u_blobB;  // blob deep green (sRGB)
uniform vec3 u_hl;     // blob specular highlight color (sRGB)

in vec2 v_uv;
out vec4 fragColor;

const float TAU = 6.28318530718;

// mirror edge handling: reflect out-of-range UVs back into [0,1]
vec2 mirror01(vec2 x) {
  return 1.0 - abs(mod(x, 2.0) - 1.0);
}

void main() {
  float aspect = u_resolution.x / max(u_resolution.y, 1.0);
  float t = u_time;
  vec2 uv = v_uv;

  // (-10,-10) sentinel means "no pointer" -> pointer layers contribute zero
  float valid = step(-5.0, u_pointer.x);
  vec2 pv = clamp(u_pointer, 0.0, 1.0);

  // ---- ambient concentric ripples (CursorRipples stand-in), applied ABOVE the wave
  // center follows pointer when valid, else drifts on its own slow path
  vec2 orbitR = vec2(0.5) + vec2(sin(t * 0.17 + 2.0), cos(t * 0.21)) * 0.20;
  vec2 rc = mix(orbitR, pv, valid);
  vec2 q = vec2((uv.x - rc.x) * aspect, uv.y - rc.y);
  float dr = length(q);
  vec2 dirR = q / max(dr, 1e-4);
  float ringAtt = exp(-dr * 3.5) * smoothstep(0.0, 0.04, dr);
  float ring = sin(dr * 38.0 - t * 2.2) * ringAtt;
  vec2 uv1 = uv + vec2(dirR.x / aspect, dirR.y) * ring * 0.006;

  // ---- WaveDistortion (angle 23, freq 5.1, speed 2.5, strength 0.15, mirror edges)
  // vendor math is y-down; computed in that convention, displacement flipped back
  float ang = 23.0 * 0.01745329252;
  float ca = cos(ang);
  float sa = sin(ang);
  float rotY = (uv1.x - 0.5) * aspect * sa - (uv1.y - 0.5) * ca;
  float phase = (rotY + 0.5) * 5.1 * TAU + t * 1.25; // animatedTime = time*speed*0.5
  float dispW = sin(phase) * 0.15 * 0.5;
  vec2 uv2 = vec2(uv1.x + dispW * ca / aspect, uv1.y - dispW * sa);
  uv2 = mirror01(uv2);

  // ---- Swirl (detail 3.5, blend 45, speed 0.6) — vendor swirlField ported verbatim
  float ts = t * 0.6;
  float f1 = 3.5;
  vec2 d1 = vec2(
    uv2.x + sin(uv2.y * f1 * 1.7 + ts * 0.8) * 0.12 + cos(uv2.x * f1 * 0.9 - ts * 0.5) * 0.05,
    uv2.y + cos(uv2.x * f1 * 1.3 - ts * 0.6) * 0.12 + sin(uv2.y * f1 * 1.1 + ts * 0.7) * 0.05);
  float p1 = sin(d1.x * f1 * 2.1 + d1.y * f1 * 1.8 + ts * 0.4);
  float f2 = f1 * 2.1;
  vec2 d2 = vec2(
    d1.x + cos(d1.y * f2 * 2.7 - ts * 0.45) * 0.07 + sin(d1.x * f2 * 1.9 + ts * 0.6) * 0.04,
    d1.y + sin(d1.x * f2 * 2.3 + ts * 0.65) * 0.07 + cos(d1.y * f2 * 1.6 - ts * 0.4) * 0.04);
  float p2 = cos(d2.x * f2 * 1.4 - d2.y * f2 * 1.9 + ts * 0.35);
  float f3 = f1 * 3.7;
  vec2 d3 = vec2(
    d2.x + sin(d2.y * f3 * 1.8 + ts * 0.85) * 0.04 + cos(d2.x * f3 * 1.3 - ts * 0.55) * 0.025
         + sin((d2.x + d2.y) * f3 * 0.7 + ts * 0.9) * 0.02,
    d2.y + cos(d2.x * f3 * 1.6 - ts * 0.75) * 0.04 + sin(d2.y * f3 * 1.1 + ts * 0.5) * 0.025
         + cos((d2.x + d2.y) * f3 * 0.8 - ts * 0.95) * 0.02);
  float p3 = sin(d3.x * f3 * 1.1 + d3.y * f3 * 1.5 - ts * 0.55);
  float comb = p1 * 0.45 + p2 * 0.35 + p3 * 0.2;
  // blend 45 -> bias (45-50)*0.006 = -0.03 (toward color A)
  float bf = smoothstep(0.3, 0.7, comb * 0.5 + 0.5 - 0.03);
  float shimmer = sin(ts * 2.5 + comb * 8.0) * 0.015 + 1.0;
  // oklab-feel mix: endpoints pre-encoded as cbrt(linear), cube after mixing
  vec3 mroot = mix(u_swA, u_swB, bf);
  vec3 swLin = mroot * mroot * mroot;
  vec3 sw = pow(swLin, vec3(0.4545)) * shimmer;
  vec3 col = mix(u_base, sw, 0.92);

  // ---- Blob (size .15, deformation .9, softness .7, linearDodge), beneath the wave
  // center: pointer with reach 0.55 around (0.5,0.5), else slow autonomous orbit
  float tb = t * 0.5 + 1.0; // speed 0.5, seed 1
  vec2 orbitB = vec2(0.5) + vec2(cos(t * 0.31), sin(t * 0.23)) * 0.16;
  vec2 pcen = mix(orbitB, vec2(0.5) + (pv - 0.5) * 0.55, valid);
  vec2 p = vec2((uv2.x - pcen.x) * aspect, uv2.y - pcen.y);
  float dist = length(p);
  float def = 0.9;
  float n1 = (sin(p.x * 3.2 + tb * 0.8) * sin(p.y * 2.8 + tb * 0.6)
            + sin(p.x * 4.8 - (p.y * 3.6 + tb * 0.4))) * 0.15 * def;
  float n2 = sin(p.x * 5.6 - tb * 0.5) * sin(p.y * 4.4 + tb * 0.7) * 0.12 * def;
  float n3 = (sin(p.x * 7.2 + p.y * 6.4 + tb * 0.3) + sin(p.x * 2.4 - tb * 0.9)) * 0.10 * def;
  float n4 = sin(p.x * 8.8 + tb * 0.2) * sin(p.y * 7.6 - tb * 0.8) * 0.04 * def;
  float orad = 0.15 + n1 + n2 + n3 + n4;
  float ew = 0.7 * 0.3;                 // softness*0.3
  float lm = 1.0 - smoothstep(orad - ew, orad + ew, dist);
  float mask = pow(max(lm, 1e-4), 1.9); // edgeCurve = softness*2+0.5
  float rr = max(orad, 1e-3);
  float tilt = smoothstep(0.0, rr, dist);
  vec3 nrm = normalize(vec3(p * (tilt + 0.2), 1.0 - tilt * 0.1));
  vec3 L = vec3(0.5145, 0.5145, 0.6860); // normalized (0.3,-0.3,0.4), y flipped to y-up
  float specZ = reflect(-L, nrm).z;
  float spec = pow(max(specZ, 0.0), 32.0);
  float hli = spec * (tilt * 0.5 + 0.5) * 0.5 * mask;
  float px3 = p.x * 3.0;
  float py3 = p.y * 3.0;
  float cn1 = (sin(px3 + tb * 0.4) * sin(py3 + tb * 0.3)
             + sin(px3 * 0.7 + py3 * 0.8 + tb * 0.2)) * 0.5 + 0.5;
  float cn2 = (sin(px3 * 1.3 - tb * 0.5) * sin(py3 * 1.1 + tb * 0.6)
             + sin(px3 * 0.5 - (py3 * 0.6 - tb * 0.3))) * 0.5 + 0.5;
  float mixF = smoothstep(0.1, 0.9, cn1 * 0.6 + cn2 * 0.4);
  vec3 blobCol = mix(u_blobA, u_blobB, mixF);
  col += blobCol * mask + u_hl * hli; // linearDodge = additive

  // ripple luminance glint riding on the displacement
  col *= 1.0 + ring * 0.03;
  col = clamp(col, 0.0, 1.0);

  // ---- FilmGrain (strength 0.075), vendor hash, dark-biased
  vec2 pc = v_uv * u_resolution;
  float gn = fract(sin(dot(pc, vec2(12.9898, 78.233)) + t) * 43758.5453);
  float grain = gn * 2.0 - 1.0;
  float bright = clamp(dot(col, vec3(0.2126, 0.7152, 0.0722)), 0.0, 1.0);
  col += grain * (1.0 - bright) * 0.075 * 0.1;

  fragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}`

export function megaLogoUniforms(dark: boolean): Record<string, number | number[]> {
  return {
    // sRGB base: #0e2e2f dark / #104041 light
    u_base: dark ? [0.055, 0.180, 0.184] : [0.063, 0.251, 0.255],
    // Swirl endpoints pre-encoded as cbrt(linearized sRGB) for oklab-feel mixing in-shader:
    // u_swA = #04cb79, u_swB = #0b4844 dark / #076c61 light
    u_swA: [0.107, 0.842, 0.576],
    u_swB: dark ? [0.150, 0.402, 0.387] : [0.128, 0.531, 0.493],
    // Blob colors (plain sRGB): #05ffa6 / #04b76d, highlight #ffe11a
    u_blobA: [0.020, 1.000, 0.651],
    u_blobB: [0.016, 0.718, 0.427],
    u_hl: [1.000, 0.882, 0.102],
  }
}

export function MegaLogoSceneGL({ dark }: { dark: boolean }) {
  return <GlScene frag={MEGALOGO_FRAG} uniforms={megaLogoUniforms(dark)} />
}

/* =========================== contact =========================== */

const CONTACT_FRAG = `#version 300 es
precision highp float;

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_pointer;

/* Swirl gradient endpoints (theme-dependent) */
uniform vec3 u_swirlA;
uniform vec3 u_swirlB;
/* ChromaFlow palette */
uniform vec3 u_cfBase;
uniform vec3 u_cfUp;
uniform vec3 u_cfDown;
uniform vec3 u_cfLeft;
uniform vec3 u_cfRight;

in vec2 v_uv;
out vec4 fragColor;

/* ---- ContactScene constants (from fxScenes.tsx props) ---- */
const float DETAIL      = 1.7;   // Swirl detail
const float FREQ        = 8.0;   // FlutedGlass frequency
const float REFRACTION  = 4.0;   // FlutedGlass refraction
const float ABERRATION  = 0.61;  // FlutedGlass aberration
const float HIGHLIGHT   = 0.12;  // FlutedGlass highlight
const float FLUTE_SPEED = 0.15;  // FlutedGlass speed (t is negated by vendor)
const float CF_OPACITY  = 0.45;  // ChromaFlow layer opacity
const float CF_RADIUS   = 0.175; // vendor: radius(3.5) * 0.05
const float GRAIN       = 0.05;  // FilmGrain strength (bias defaults to 2)

/* Exact port of the vendor swirlField (detail = 1.7, blend = 50 -> bias 0).
   Returns (blendFactor, shimmer). */
vec2 swirlField(vec2 uv, float t) {
  float f1 = DETAIL;
  vec2 d1 = vec2(
    uv.x + sin(uv.y * f1 * 1.7 + t * 0.8) * 0.12 + cos(uv.x * f1 * 0.9 - t * 0.5) * 0.05,
    uv.y + cos(uv.x * f1 * 1.3 - t * 0.6) * 0.12 + sin(uv.y * f1 * 1.1 + t * 0.7) * 0.05);
  float p1 = sin(d1.x * f1 * 2.1 + d1.y * f1 * 1.8 + t * 0.4);

  float f2 = DETAIL * 2.1;
  vec2 d2 = vec2(
    d1.x + cos(d1.y * f2 * 2.7 - t * 0.45) * 0.07 + sin(d1.x * f2 * 1.9 + t * 0.6) * 0.04,
    d1.y + sin(d1.x * f2 * 2.3 + t * 0.65) * 0.07 + cos(d1.y * f2 * 1.6 - t * 0.4) * 0.04);
  float p2 = cos(d2.x * f2 * 1.4 - d2.y * f2 * 1.9 + t * 0.35);

  float f3 = DETAIL * 3.7;
  vec2 d3 = vec2(
    d2.x + sin(d2.y * f3 * 1.8 + t * 0.85) * 0.04 + cos(d2.x * f3 * 1.3 - t * 0.55) * 0.025
         + sin((d2.x + d2.y) * f3 * 0.7 + t * 0.9) * 0.02,
    d2.y + cos(d2.x * f3 * 1.6 - t * 0.75) * 0.04 + sin(d2.y * f3 * 1.1 + t * 0.5) * 0.025
         + cos((d2.x + d2.y) * f3 * 0.8 - t * 0.95) * 0.02);
  float p3 = sin(d3.x * f3 * 1.1 + d3.y * f3 * 1.5 - t * 0.55);

  float combined = p1 * 0.45 + p2 * 0.35 + p3 * 0.2;
  float blendF  = smoothstep(0.3, 0.7, combined * 0.5 + 0.5);
  float shimmer = sin(t * 2.5 + combined * 8.0) * 0.015 + 1.0;
  return vec2(blendF, shimmer);
}

/* FlutedGlass edges="mirror" (default) */
vec2 mirrorUV(vec2 uv) {
  return 1.0 - abs(mod(uv, 2.0) - 1.0);
}

/* Layers BENEATH the fluted glass: Swirl base + ChromaFlow pointer wash.
   ChromaFlow is a pointer-velocity fluid sim in the vendor; here the
   damped pointer paints a soft gaussian wash whose directional greens
   rotate slowly over time (stand-in for flow direction). Contributes
   exactly zero when u_pointer is the (-10,-10) sentinel. */
vec3 sceneColor(vec2 uv, float aspect) {
  vec2 f = swirlField(uv, u_time);
  vec3 col = mix(u_swirlA, u_swirlB, f.x) * f.y;

  if (u_pointer.x > -5.0) {
    vec2 pd = uv - u_pointer;
    pd *= (aspect >= 1.0) ? vec2(aspect, 1.0) : vec2(1.0, 1.0 / aspect);
    float g = exp(-dot(pd, pd) / (CF_RADIUS * CF_RADIUS));

    /* slowly rotating pseudo-flow direction -> vendor directional mix */
    float ang = u_time * 0.35 + sin(u_time * 0.13) * 1.7;
    vec2 dir = vec2(cos(ang), sin(ang));
    float rA = smoothstep(0.0, 0.7, max(dir.x, 0.0));
    float lA = smoothstep(0.0, 0.7, max(-dir.x, 0.0));
    float uA = smoothstep(0.0, 0.7, max(dir.y, 0.0));
    float dA = smoothstep(0.0, 0.7, max(-dir.y, 0.0));
    float tw = rA + lA + uA + dA + 0.001;
    vec3 dirCol = (u_cfLeft * lA + u_cfRight * rA + u_cfDown * dA + u_cfUp * uA) / tw;
    vec3 washCol = mix(u_cfBase, dirCol, 0.85);

    /* breathe keeps the wash liquid instead of a static disc */
    float breathe = 0.8 + 0.2 * sin(u_time * 1.3 + (uv.x + uv.y) * 4.0);
    float liquid = smoothstep(0.04, 0.7, g) * breathe;
    col = mix(col, washCol, liquid * CF_OPACITY);
  }
  return col;
}

void main() {
  float aspect = u_resolution.x / u_resolution.y;
  vec2 uv = v_uv;

  /* ---- FlutedGlass geometry (angle=0 -> vertical flutes) ----
     shape="rounded", softness=1 -> exponent mix(8,3,1)=3; vendor negates t. */
  float t = -FLUTE_SPEED * u_time;
  float u = (uv.x - 0.5) * aspect;
  float flutePos = u * FREQ + t;
  float c = (fract(flutePos) - 0.5) * 2.0;
  float slope = c * c * c;               /* sign(c)*|c|^3 */
  float halfCell = 0.5 / FREQ;
  float refrU = -slope * REFRACTION * halfCell;
  vec2 ruv = vec2(uv.x + refrU / aspect, uv.y);
  float chrU = refrU * ABERRATION * 0.5;
  vec2 chrOff = vec2(chrU / aspect, 0.0);

  /* chromatic aberration: R/B sample the scene at +-chrOff */
  vec3 colC = sceneColor(mirrorUV(ruv), aspect);
  vec3 colR = sceneColor(mirrorUV(ruv + chrOff), aspect);
  vec3 colB = sceneColor(mirrorUV(ruv - chrOff), aspect);
  vec3 col = vec3(colR.r, colC.g, colB.b);

  /* ---- FlutedGlass specular (lightAngle=-90, highlightSoftness=0) ---- */
  float slopeSq = min(slope * slope, 1.0);
  float nz = sqrt(1.0 - slopeSq);
  float nDotH = max(slope * -0.7071068 + nz * 0.7071068, 0.0);
  float fresnel = pow(1.0 - nz, 5.0);
  float spec = pow(nDotH, 256.0) * (0.04 + 0.96 * fresnel) * HIGHLIGHT;
  col += vec3(spec);

  /* ---- FilmGrain (strength 0.05, bias 2, static) ---- */
  vec2 pix = v_uv * u_resolution;
  float n = fract(sin(dot(pix, vec2(12.9898, 78.233))) * 43758.5453);
  float grain = n * 2.0 - 1.0;
  float lum = clamp(dot(col, vec3(0.2126, 0.7152, 0.0722)), 0.0, 1.0);
  float darkF = (1.0 - lum) * (1.0 - lum);
  col += grain * darkF * GRAIN * 0.1;

  fragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`

export function contactUniforms(dark: boolean): Record<string, number | number[]> {
  return {
    // Swirl: #0c2b2c -> #134243 (dark) / #133f40 -> #177e6f (light)
    u_swirlA: dark ? [0.047, 0.169, 0.173] : [0.075, 0.247, 0.251],
    u_swirlB: dark ? [0.075, 0.259, 0.263] : [0.090, 0.494, 0.435],
    // ChromaFlow: base #0f3334 (dark) / #16494a (light)
    u_cfBase: dark ? [0.059, 0.200, 0.204] : [0.086, 0.286, 0.290],
    u_cfUp: [0.012, 0.580, 0.345],    // #039458
    u_cfDown: [0.012, 0.643, 0.384],  // #03a462
    u_cfLeft: [0.090, 0.494, 0.435],  // #177e6f
    u_cfRight: [0.016, 0.718, 0.427], // #04b76d
  }
}

export function ContactSceneGL({ dark }: { dark: boolean }) {
  return <GlScene frag={CONTACT_FRAG} uniforms={contactUniforms(dark)} />
}
