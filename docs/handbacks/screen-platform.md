# Handback — screen: Platform (`/platform`, الحلول الرقمية)

Latest session: 2026-09-16 — page rebuilt to match the client's
`platform.html` reference (Eynas, Slack, Sep 13). Earlier sessions
(coming-soon page → native product story) are superseded.

## What was built
- Route: `/platform`
- Branch: `master` (work is uncommitted at handback time — commit after review)
- Files touched:
  - `src/pages/PlatformPage.tsx` — full rewrite from the reference
  - `src/platform.css` — full rewrite; the ONLY platform stylesheet now,
    imported by the page (route chunk), no longer by `main.tsx`
  - Removed: `src/platform-refinement.css`, `platform-authored.css`,
    `platform-mobile.css`, `platform-accounts.css`, `platform-real-product.css`
  - `docs/handbacks/screen-platform.md` (this file)
- Shared files modified (each minimal, listed for the hub):
  - `src/main.tsx` — dropped the three global platform CSS imports
  - `src/styles.css` — deleted the two dead platform blocks
    (`/* ===== screen:platform ===== */` coming-soon styles and the
    "Digital platform — native SalesUp product story" block at the end);
    no other block touched
  - `index.html` — Google Fonts link also loads JetBrains Mono
    (400/500/700); the reference uses it for every number in the boards
- Reference: client file `platform.html` (Slack DM, Sep 13). Not committed
  to the repo — the design source of truth for this screen.

## Client brief (Slack, Eynas)
- «حرفيا سووها نفسها» — make it the same as the reference, BUT keep our
  nav bar, keep our hero background (the platform shader), keep our footer.
- «خليه حي أكثر وأنا أسوي سكرولينق» — more alive while scrolling.
- Revision: the company feature card «انشر منتجك» → «انشر منصتك».
- Haitham (Sep 16): not 100% identical — the shell, the shaders and the
  sticky scroll must be applied on top of the reference.

## Design decisions
- Structure and copy follow the reference 1:1: hero (h1 regular line +
  green bold line, lead, one "grow" CTA), «طرفين على نفس المنصة» duo
  cards, «كل أداة تحتاجها موجودة بمنصتنا» with the للمسوّق/للشركة toggle
  and 3×2 feature cards, FAQ with sticky heading + native `<details>`,
  the dark «سجّل بخطوة وحدة…» final block. The reference's extra hero
  copy that our previous build had (kicker, proof checks, second link)
  is gone because the reference doesn't have it.
- CSS is a scoped port of the reference stylesheet (`.platform …`) with
  the same class names so the two files diff side by side.
- Kept ours: `PageShell` header/footer; `HeroFx` behind the hero (with
  the landing's -86px reach + bottom dissolve; -72px under 980px where
  the header is shorter); the sticky product story.
- Hero board = the reference's 4 auto-rotating scenes (commissions live
  feed that pushes a row every 3s while on screen, CRM kanban,
  leaderboard, performance) — the exact data and timings (5.2s / 3s).
- Sticky story («من المنتج إلى النتيجة», 6 steps, 600vh) reuses the
  reference board as its stage: three reference scenes (CRM, commissions,
  performance) + three built from the same primitives (publish,
  opportunities, approval). `ActiveFx` sits inside the board as a soft
  edge vignette (masked, .14 light / .22 dark) so the data stays legible.
  Under 700px the pinned story becomes a plain list, each step with its
  own board (a 100vh pin doesn't fit a phone with the board + copy).
- "Alive on scroll": the reference's staggered reveal (`.rv` → `.in`,
  110ms sibling stagger) is ported as `useReveal`; reduced-motion skips
  it and freezes the feed/rotation, as in the reference.
- The `.grow` CTA (arrow circle that opens on hover) is always open on
  touch (`hover: none`) so phones get a real button.
- Final block («سجّل بخطوة وحدة…»): per Haitham (Sep 16) it carries the
  landing's contact-panel material — the panel gradient underneath plus
  `ContactFx` (the shell's `.contact-fx` rules clip it and provide the
  animated CSS fallback without a GPU scene). The reference's static
  radial glow was dropped in favour of the scene.
- Client revision applied: company card #1 is «انشر منصتك» / "Publish
  your platform" — flagged: literal reading of the Slack note; confirm.

## Verification evidence
- [x] `npx tsc --noEmit -p tsconfig.app.json` clean
- [x] Console + Vite error sweep clean
- [x] Screenshot matrix (headless Chrome, full page + one shot per story
  step): AR light 1440, EN light 1440, AR dark 1440, EN dark 1440,
  AR light 375, EN dark 375 — no horizontal overflow in any state
- [x] LTR: arrows flip (`html[dir='rtl'] .btn svg`), story progress bar
  origin flips, `.total b` direction flips, numbers stay LTR
- [x] All strings bilingual incl. aria-labels
- [x] Interactions: audience toggle (company set shows «انشر منصتك»),
  FAQ open/close, hero scene rotation, story scroll sync (rail, scene,
  progress bar, ActiveFx gate); rail click → smooth scroll verified by
  scroll position math (the hidden Browser pane can't animate scroll)
- [x] GPU: HeroFx (InViewGate) + ActiveFx (track-visibility gated) +
  ContactFx (InViewGate) — never more than two alive at once, as on the
  landing
- Not verified: real WebGPU look of the vignette (headless used the GL
  path); the ActiveFx opacity is a judgement call — tune if it reads
  as noise on the white board in a real browser.

## Known gaps / TODOs
- Both CTAs (`ابدأ مجاناً`) go to `/#contact` like before; the
  reference points at `index.html` (placeholder). Swap to the product
  sign-up URL when there is one.
- `src/components/ProductAppPreview.tsx`, `src/product-*.css`,
  `src/platform-product-content.ts` and `src/components/product-ui/`
  are no longer referenced by any page (they were already unused
  before this session). Left in place; delete if the product-UI port
  is not coming back.
- Final block lead wraps to two lines in AR at 1440 (reference shows
  one) — same `46ch` cap; cosmetic.

## New shared things future sessions should know
- Reference-driven screens: scope the reference CSS under one root
  class and keep its class names — the diff against the client file
  stays readable and revisions are a copy-paste.
- The Browser pane can't scroll or animate while hidden; use the
  headless capture scripts pattern (CDP + scroll-through + per-step
  shots) for the screenshot matrix.
