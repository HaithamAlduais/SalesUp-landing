# Handback — screen: sectors  (session date: 2026-07-15)

## What was built
- Route(s): `/sectors/technology`, `/sectors/fintech`, `/sectors/saas`,
  `/sectors/agencies` + aliases (`it`, `information-technology`,
  `advertising`, `advertising-agencies`) — all resolve via the existing
  router.
- Branch / final commit: `screen/sectors` @ (this commit)
- Worktree / dev port used: `../salesup-worktrees/sectors` / 5176
- Files touched: `src/pages/SectorPage.tsx` (rebuilt),
  `src/styles.css` (ONE appended `/* ===== screen:sectors ===== */`
  block), this handback. No new assets needed — the four 3D icons
  reuse the landing's `icon-{tech,fintech,saas,agencies}.png`.
- Shared files modified: NONE.
- Figma frames implemented: 5:1530, 5:1944, 5:2089, 5:2234.

## Key discovery
The four Figma frames are NOT four separate pages — they are four
ACCORDION STATES of one sectors page (heading + icon side-panel +
four-item accordion, exactly one item open, panel icon matching the
open sector). Implemented as one page: `/sectors/:slug` deep-links to
the matching item; toggling an item updates the URL with
`history.replaceState` so links stay shareable.

## Design decisions
- Followed Figma exactly: section heading copy (same as the landing
  sectors section), accordion order (تقنية المعلومات، فنتك، Saas،
  الوكالات الاعلانية), one-open-at-a-time behavior, per-sector
  descriptions verbatim, side panel with the sector's 3D icon.
- Deviations (handbook license):
  - Figma writes the fintech title as "فتنك" (typo). Used "فنتك" to
    match the landing. **Client should confirm.**
  - Panel gets the sector's landing fx variant (ActiveFx 7/4/5/6)
    behind the icon, gated by an IntersectionObserver (GPU released
    offscreen); icon swaps with a soft entrance animation.
  - Accordion body animates via the grid-rows 0fr→1fr technique with a
    delayed text fade; open item gets the site's green border + glow
    affordance; chevrons rotate.
  - Header active nav = "من نحن" (matches the Figma header state).
- Bilingual: all Arabic verbatim from Figma; English written fresh
  (incl. the four descriptions). Note: the Figma fintech description
  is creative/design-agency copy, not fintech copy — translated
  faithfully anyway. **Flagged for client review.**

## Verification evidence
- [x] `npx tsc --noEmit` clean (worktree)
- [x] Arabic: desktop light + dark — verified via computed-style probes
      (card/border/text colors, layout) — see limitation below
- [x] Arabic: mobile 375 — panel hidden, inline 80px icons, 59px tap
      targets (≥44), no horizontal overflow
- [x] English: desktop — dir=ltr, all strings translated, layout
      mirrors (panel flips sides: measured left 974 vs accordion 16)
- [x] English: mobile — same probes pass
- [ ] LTR arrow flips — n/a (page has no directional arrows; chevrons
      are symmetric rotators)
- [x] All new strings bilingual incl. aria-labels (`aria-expanded`,
      `aria-controls`, regions)
- [x] Touch: accordion uses plain buttons — no first-tap-reveal pattern
      needed; clicks verified
- [x] Console error sweep clean
- [x] GPU: single ActiveFx scene, IntersectionObserver-gated; no
      permanent Shader roots
- Interaction proof: `/sectors/it` alias opens Information Technology;
  clicking SaaS → opens + URL `/sectors/saas` + panel icon
  `icon-saas.png`; clicking Agencies → aria states `[f,f,f,t]` + URL
  updates.

## Known gaps / TODOs for the audit session
- **Pixel screenshots could not be captured**: the Browser pane
  produced no frames this session (requestAnimationFrame suspended —
  pane backgrounded while other session panes were fronted; screenshot
  calls timed out at the tool level). All structural/computed-style
  probes passed, but the audit session MUST re-take the 8-state
  screenshot matrix. One earlier tab (seed) froze mid-session; a fresh
  tab (tab-1) behaved correctly — disregard the seed tab.
- Fintech copy mismatch (creative-sector text) + "فتنك" typo — client
  decisions pending.
- The accordion is radio-style (one always open, matching all four
  Figma states); if the client prefers collapse-on-second-click, it's
  a two-line change.

## New shared things future sessions should know
- Pattern: Figma sibling frames of equal size may be STATES of one
  page, not separate pages — check before building N pages.
- The `grid-template-rows: 0fr→1fr` accordion recipe (in my CSS block)
  is reusable for any expanding panel.
- Registering a `<screen>-dev` entry in the MAIN checkout's
  `.claude/launch.json` with `npm run dev --prefix ../salesup-worktrees/<screen> -- --port <port> --strictPort`
  is how sessions run their worktree server through the Browser pane.
