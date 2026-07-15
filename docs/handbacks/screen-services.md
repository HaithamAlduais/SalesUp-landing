# Handback — screen: services  (session date: 2026-07-15)

## What was built
- Route(s): `/services` (index), `/services/:slug` (detail: outside-sales,
  inside-sales, sales-development, lead-generation, ai-sales), in-page
  request-success state. Marketers card links to `/marketers` (owned by
  the marketers session).
- Branch / final commit: `screen/services` @ (this commit)
- Worktree / dev port used: `../salesup-worktrees/services` / 5174
- Files touched: `src/pages/ServicesPage.tsx` + one appended
  `/* ===== screen:services ===== */` block at the end of `src/styles.css`.
- Shared files modified: NONE in this branch. (Note: I added a
  `services-dev` entry to the MAIN checkout's `.claude/launch.json`,
  uncommitted, alongside the other sessions' entries — hub can keep or
  drop it.)
- Figma frames implemented: 5:1675 (index), 5:1755 (card hover CTA),
  5:1835 (detail + request form + FAQ), 5:3609 (success panel).

## Design decisions
- Followed Figma exactly: index heading + 6-card 2-col grid with the
  exact card copy; hover reveals استكشف الخدمة (5:1755); detail page
  heading/desc for outside-sales; request form fields incl. the service
  dropdown (name*, phone*, email, service, company, notes) and intro
  line; success panel copy + العودة الى الرئيسية.
- Deviations (handbook license):
  - Figma repeats two placeholder icons across the six cards; I mapped
    our real assets instead (globe → outside/development/AI, handshake →
    inside/leads) and kept the landing's org-chart icon for Marketers
    (continuity with the landing featured card; Figma shows handshake).
  - Card hover also gets the landing's lift + green border + CardFx
    shader (variants: outside 5, inside 3, development 0, leads 2,
    AI 6, marketers 1 — landing-consistent where services overlap).
  - FAQ rows are underlined rows per Figma with animated grid-rows
    expansion; first item open by default.
  - The index heading in Figma reads "ترتّب المبيعات" (vs the landing's
    "تزيد المبيعات") — kept the page-specific wording verbatim.
- Effects & interactions: CardFx (hover) / InViewFx (coarse) per card,
  ContactFx inside both form and success panels (self-gated GPU),
  FAQ + form submit are state-driven.

## ⚠️ Authored content needing client review
- **FAQ answers are NOT in Figma** (only collapsed questions exist).
  I wrote concise AR answers + EN translations for the five
  outside-sales questions — flagging for client approval/edit.
- FAQs exist in Figma only for outside-sales; other services render
  no FAQ section until content exists.
- All EN copy on this screen is authored (marketing English), as the
  Figma file is AR-only.

## Verification evidence
- [x] `npx tsc --noEmit` clean
- [x] Arabic: desktop 1440 light (index + hover + detail) and dark
      (form, FAQ, success) — screenshots inspected
- [x] Arabic: mobile 375 — DOM-verified (1-col grid, no h-scroll,
      burger, RTL)
- [x] English: desktop light index + hover — screenshot; EN detail —
      DOM-verified (LTR, 6 fields, preselected select, EN FAQ)
- [x] English: mobile 375 dark — DOM-verified (1-col, dark surfaces,
      light text, no h-scroll)
- [x] LTR mirroring correct (grid mirrors, Explore Service arrow points
      right via the shared `html[dir='ltr']` flip, select chevron swaps
      sides)
- [x] All new strings bilingual incl. aria-labels/placeholders
- [x] Touch behaviors via `?coarse`: InViewFx on all 6 cards with only
      in-viewport canvases mounted (2 of 6) — GPU-gated
- [x] Console error sweep clean
- [x] GPU: no permanently-mounted Shader roots (CardFx hover lifecycle,
      InViewFx observer, ContactFx internal gate)
- FAQ toggle + submit→success verified by async state assertions
  (open/close per click; success panel replaces form and scrolls top).
- **Note:** mid-session the Browser pane's screenshot capture began
  timing out (JS/DOM tools kept working — likely renderer contention
  with 3+ parallel session dev servers running WebGPU pages). Visual
  states captured before the outage are listed above; EN detail and
  mobile states were verified via DOM/computed-style assertions instead.
  The audit session should re-take the full screenshot matrix.

## Known gaps / TODOs for the audit session
- Re-take the complete 8-state screenshot matrix (see note above).
- FAQ answers + EN copy need client sign-off (flagged section).
- The request form is front-end only (no backend/endpoint — same as the
  landing contact form).
- Detail pages for services other than outside-sales use their index
  card copy as the description (no Figma detail content exists); FAQ
  hidden there.

## New shared things future sessions should know
- Pattern: a page can serve subroutes without touching the shared
  router — parse `window.location.pathname` inside the page (see
  ServicesPage `/services/:slug`).
- The `.contact-panel` + `ContactFx` combo reuses cleanly for any dark
  form/status panel; pair with `.svc-select`-style rules for dropdowns
  (white chevron, `html[dir='ltr']` position swap).
- Async-read gotcha when verifying React state from the console: read
  AFTER a timeout — programmatic `.click()` flushes async, and same-tick
  reads look like frozen state.
