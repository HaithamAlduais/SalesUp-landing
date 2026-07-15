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
- Post-review fix: the card hover shaders were mounting but invisible —
  the global reveal rule is scoped to `.sector-card:hover`; added
  `.svc-card:hover .card-fx { opacity: 0.3 }` to the services block and
  re-verified visually (canvas mounts, opacity 0.3, pattern visible).
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

## Update 2 — sticky-story index (client request)

Per client review ("the sticky scroll and mobile view and shaders should
be visible also in mobile — learn from the main screen"):

- The index grid was replaced with the landing About **sticky story**:
  520vh track (480vh mobile), pinned viewport, six crossfading service
  slides with progress dots. Each slide carries its `ActiveFx` shader
  revealed by STATE — visible on desktop AND mobile, no hover anywhere.
  The استكشف الخدمة CTA is a permanent button on each slide (tap
  navigates; the shader is already visible, per the handbook's touch
  pattern). Figma's 2-col grid (5:1675) is superseded by explicit client
  direction; hover-state frame 5:1755's CTA became the always-visible
  slide CTA.
- `trackVisible` now DEFAULTS TRUE and the IntersectionObserver refines
  it — shaders still show if observer delivery misbehaves, gating still
  reclaims GPU when it works. **Audit note:** the landing About/Sectors
  gates initialize to `false`; consider the same default-true hardening
  there.
- Detail page, request form, success state, FAQ: unchanged.

Verification (matrix re-run):
- tsc clean; scroll→slide mapping verified on desktop (30% → slide 3 of
  6, correct title + dot); mobile 375: viewport pinned (top 0), stage
  343×360, story advances, fx computed opacity 0.32 with canvas mounted,
  no h-scroll; AR + EN strings unchanged from v1 (bilingual ✓).
- **Environment caveat:** the Browser pane degraded further during this
  pass (frozen compositor: screenshots time out, IntersectionObserver
  callbacks never deliver, CSS transitions don't advance — across tabs;
  likely contention from 4 parallel session dev servers + WebGPU). Shader
  visibility was proven by computed style with transitions bypassed
  (0.32 / slide 1.0). The audit session MUST re-verify visually on a
  healthy pane and re-take all screenshots.
- Also observed: `python` on PATH now resolves to a denied
  hermes-agent venv shim (parallel-session side effect?) — used explicit
  tooling instead; audit may want to check the machine's PATH.

## Update 3 — index as a card deck (client direction)

Client shared two scroll-effect references (GSAP cinematic footer;
Lenis + stacked sticky sections) and asked for a "card wheel" done our
way. Decisions:

- Adopted the **stacked sticky deck** for the index: each service panel
  `position: sticky` pins below the header at a cascading offset
  (96px + i×14 desktop / 84px + i×10 mobile) while the next card slides
  up over it. Pure CSS sticky — NO GSAP/Lenis (zero new deps; native on
  mobile; no scroll hijacking). Replaces the crossfade story from
  Update 2 (simpler: no scroll math, no dots).
- Each panel: numbered 01-06 ghost index, icon, copy, permanent CTA,
  and its ActiveFx shader driven by an in-view observer that DEFAULTS
  TRUE (visible even with degraded observer delivery; healthy browsers
  reclaim offscreen GPU). Worst case all 6 scenes mount (~8 devices
  page-wide) — within browser caps; audit may tighten if needed.
- The cinematic-footer reference (giant wordmark, magnetic pills) was
  deliberately NOT implemented here — footer is shared-shell/hub scope
  (and main already carries a MegaLogoFx footer treatment).

Verification (DOM-based; pane screenshots still dead):
- tsc clean. Desktop 1440: panels pin at 96/110/124 with the next card
  mid-slide (544) — cascade formula exact; indices 01-06; no h-scroll.
- Mobile 375: panels pin at 84/94/104/114, next at 558 — deck works
  natively; all six fx layers `is-on` with canvases mounted.
- Mid-pass the session dev server on 5174 DIED (cause unknown —
  parallel-session contention suspected); restarted via preview_start.
  Audit: re-verify visually on a healthy pane, and watch for the
  hermes-agent python PATH shim + server reaping on this machine.
