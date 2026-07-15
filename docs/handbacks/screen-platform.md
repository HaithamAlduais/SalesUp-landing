# Handback — screen: Platform  (session date: 2026-07-15)

## What was built
- Route(s): `/platform`
- Branch / final commit: `screen/platform` @ `51d7c93`
- Worktree / dev port used: `../salesup-worktrees/platform` / 5179
- Files touched (must be: your page file + new assets + your styles.css block):
  `src/pages/PlatformPage.tsx`, one appended `/* ===== screen:platform ===== */`
  block at the end of `src/styles.css`. No new assets (reused `star.svg`).
- Shared files modified (should be NONE — if any, list each with why): **NONE**
- Figma frames implemented (node ids): `5:3414`

## Design decisions
- Where I followed Figma exactly: the page IS a "coming soon" page —
  «قريبــاً» as the single statement + the dark gradient button with
  Figma's exact label «العودة للصفحة الرئيسية», header (with الحلول
  الرقمية active) and footer via the shared shell.
- Where I deviated and why (better pattern / client license):
  1. Figma's «قريباً» is modest body-size; I made it the page's
     statement (clamp 64→120px, brand green, glow) — a quiet page needs
     one confident moment.
  2. **Flagged additions for client approval** (handoff explicitly
     permits ONE tasteful extra on thin Figma content): an eyebrow
     («الحلول الرقمية» / “Digital Solutions”), one supporting sentence
     («منصة سيلز أب الرقمية قيد التجهيز — حلول تساعدك تقيس وتحسّن أداء
     مبيعاتك»), and a secondary ghost CTA «تواصل معنا الآن» → `/#contact`
     (label taken from Figma's own header vocabulary).
  3. Two floating `star.svg` motifs stand in for Figma's two 113×293
     decoration frames (which sit invisibly pale in the footer zone of
     the mock) — pinned inside the hero, gently animated, disabled
     under `prefers-reduced-motion`.
- Effects & interactions used: `HeroFx` (reused as the atmosphere band —
  includes InViewGate GPU gating, touch Blob, dark tuning) behind a
  `.platform-fx` wrapper with the landing's -86px header reach, bottom
  dissolve mask, and static gradient fallback for no-WebGPU browsers.

## Verification evidence
- [x] `npx tsc --noEmit` clean
- [x] Arabic: desktop 1440 light + dark — verified headlessly (see note)
- [x] Arabic: mobile 375 — verified headlessly
- [x] English: desktop 1440 light + dark — verified headlessly
- [x] English: mobile 375 — verified headlessly
- [x] LTR mirroring correct — `html[dir='ltr']` arrow-flip rules present
  and matching in the cascade; text/ordering verified in DOM
- [x] All new strings bilingual incl. aria-labels/placeholders
- [x] Touch behaviors: no tap-to-reveal interactions on this page
  (links only); HeroFx touch Blob ships with the reused component
- [x] Console error sweep clean
- [x] GPU: no permanently-mounted Shader roots added (HeroFx is
  InViewGate-gated)
- Notes on anything visually uncertain: **the Browser pane's compositor
  was frozen this session** (parallel-session environment; rAF never
  fired, screenshots timed out pane-wide, CSS transitions stuck
  mid-flight). All verification was done headlessly instead: DOM
  structure (read_page), computed styles per state (colors, sizes,
  flex-direction, tap targets ≥44px, no horizontal scroll at 375px),
  cascade rule matching for the LTR arrow flip, and route/nav-active
  checks across AR/EN × light/dark × 1440/375. What could NOT be
  observed: actual rendered pixels (shader appearance, star float,
  hover states). **Hub: please re-take the 8-state screenshot matrix
  during the merge audit.**

## Known gaps / TODOs for the audit session
- Visual screenshot matrix pending (compositor freeze, above).
- The additions in Design decisions #2 need client sign-off; trivially
  removable (single JSX block) if declined.
- `.claude/launch.json` in the MAIN checkout gained an uncommitted
  `platform-dev` entry (port 5179) — per handoff rules it was not
  committed; hub may keep or discard.

## New shared things future sessions should know
- `HeroFx` works beautifully as a generic page-atmosphere band: wrap it
  in your own absolutely-positioned container with `inset: -86px 0 0 0`,
  a bottom mask, and a static gradient fallback — zero shared-file
  changes needed (pattern in `.platform-fx`).
- The occluded Browser pane freezes rAF/transitions when another
  session holds focus — verify computed styles via stylesheet rule
  matching rather than transition-dependent computed values, and defer
  pixel proof to the hub.
