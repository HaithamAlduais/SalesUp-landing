# Handback — screen: jobs  (session date: 2026-07-15)

## What was built
- Route(s): `/jobs`
- Branch / final commit: `screen/jobs` @ (see `git log -1` on the branch)
- Worktree / dev port used: `../salesup-worktrees/jobs` / 5180
- Files touched (must be: your page file + new assets + your styles.css block):
  - `src/pages/JobsPage.tsx` (placeholder → real page)
  - `src/styles.css` — one appended `/* ===== screen:jobs ===== */` block
    (includes its own dark-mode, LTR, and mobile rules)
  - `docs/handbacks/screen-jobs.md` (this file)
- Shared files modified: **NONE**
- Figma frames implemented (node ids): `5:3470` (الوظائف, 1440×1470)

## Design decisions
- Where I followed Figma exactly: the empty-state copy
  "لا يوجد وظائف متاحة" (node 5:3499) and the return-home button
  (node 5:3500) reproduced to spec — 315×79, radius 152, border
  `#04CB79`, gradient `linear-gradient(157.5deg, #133f40 31.85%,
  #5fcfad 121%)`, 24px bold white label "العودة للصفحة الرئيسية";
  content column 933px wide, centered.
- Where I deviated (handoff license, flag for client): added an eyebrow
  ("الوظائف"/"Careers"), a personality sub-line ("ما عندنا شواغر حالياً،
  بس فريقنا يكبر باستمرار — خلّنا نتعرف عليك" / EN equivalent), and the
  handoff-suggested secondary CTA "خلّينا نتواصل" → `/#contact` (ghost
  pill, sector-CTA styling family). Content sits on a soft card panel
  (radius 22, card shadow) with an ambient `InViewFx` (variant 2,
  opacity 0.22) — the "subtle shader presence" the handoff asked for.
- Figma's two 113×293 decoration frames (5:3471/5:3472) sit behind the
  SHARED footer at y≈1093 and are invisible in the frame render;
  implementing them would mean touching the shared Footer — skipped
  (out of session scope). Audit may revisit.
- English copy (written, not literal): "No open roles right now",
  "Back to Home", "Let's Talk".

## Verification evidence
- [x] `npx tsc --noEmit` clean (in the worktree)
- [~] Arabic: desktop 1440 light — verified via DOM/computed-style (see note)
- [~] Arabic: mobile 375 (dark) — verified via DOM/computed-style
- [~] English: desktop 1440 light + dark — verified via DOM/computed-style
- [~] English/Arabic remaining combos — mechanics shared, spot-verified
- [x] LTR mirroring correct — `html[dir='ltr']` flip measured:
  arrow computed transform `matrix(-1,0,0,1,0,0)`; EN strings + `dir=ltr`
  + nav active "Careers" confirmed
- [x] All new strings bilingual incl. placeholders (no form fields; link
  text + headings localized)
- [x] Touch targets ≥44px (home 301×62 mobile, contact 48px)
- [x] Console error sweep clean
- [x] GPU: only an `InViewFx` (mounts in view, unmounts off-screen) — no
  permanent Shader roots
- **IMPORTANT verification caveat**: this session's Browser pane
  renderer was FROZEN (`document.visibilityState === "hidden"`,
  `requestAnimationFrame` never fired) because several session panes run
  in parallel and Chromium occludes background panes. Pixel screenshots
  were impossible (all `computer screenshot` calls timed out across
  server restarts and fresh tabs). Everything above was verified through
  DOM geometry (`getBoundingClientRect`) and computed styles, including
  disabling CSS transitions to read end-state values (frozen renderers
  freeze transitions at their start frame — two "failures" investigated
  this way turned out correct). **The audit session must re-take the
  8-state screenshot matrix with a live pane**, and should visually
  confirm the InViewFx shader actually paints (it cannot mount under a
  frozen renderer since IntersectionObserver never fires).

## Known gaps / TODOs for the audit session
- Re-take all screenshots (see caveat) and eyeball the shader panel in
  both themes; tune `.jobs-panel .card-fx--inview` opacity (0.22) if it
  reads too strong/weak.
- Personality additions (sub-line, secondary CTA, eyebrow, panel) need
  client sign-off; trivially removable — they're isolated in
  `JobsBody` + the jobs CSS block.
- Figma footer decorations (5:3471/5:3472) skipped — shared-footer
  territory.

## New shared things future sessions should know
- Pattern for parallel-session dev servers: add an `npm --prefix
  <worktree> run dev -- --port <port> --strictPort` entry to the MAIN
  repo's `.claude/launch.json` (uncommitted) — the platform session
  established it, I followed it (`jobs-dev`, port 5180).
- If your pane's screenshots time out: check `visibilityState` and rAF —
  an occluded pane freezes rendering, IntersectionObserver, and CSS
  transitions. Verify via DOM/computed styles (disable transitions when
  reading transitioned properties) and flag for the audit.
