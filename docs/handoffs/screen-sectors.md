# Handoff — Sector pages (`/sectors/fintech|saas|agencies|technology`)

Read `docs/HANDBOOK.md` first. Build in `src/pages/SectorPage.tsx` —

## Workspace (isolated — do not build on master)

- Branch: `screen/sectors` · Worktree: `../salesup-worktrees/sectors` · Dev port: **5176**
- Setup: `git worktree add ../salesup-worktrees/sectors -b screen/sectors master` → `cd ../salesup-worktrees/sectors` →
  `npm install` → set `.claude/launch.json` to port 5176 (don't commit
  that change) → open via the Browser pane preview.
- Work ONLY in your page file + new assets + ONE appended
  `/* ===== screen:sectors ===== */` block at the end of
  `styles.css`. Commit on your branch; the hub merges all branches into
  `master` and runs the final audit.
ONE template component driven by a per-sector data map (extend the
existing `SECTORS` record: title, icon, copy, fx variant).

## Figma frames (1440×1693 each — same layout, four contents)
- `5:1530` — sector page 1 (top of the column: likely فنتك)
- `5:1944` — sector page 2
- `5:2089` — sector page 3
- `5:2234` — sector page 4

Structure per frame: intro Group 23 (1140×458) + content Frame 269
(1372×776) + footer. Fetch design context for `5:1530` fully, then only
the TEXT of the other three (same layout, different copy). Map which
frame belongs to which sector by its copy/icon.

## Direction
- Landing sector cards (fx variants 4-6 + icons `icon-fintech/saas/
  agencies/tech.png`) already establish each sector's identity — reuse
  the same icon + fx variant per sector for continuity.
- Intro banner: consider `ActiveFx` revealed on load (in-view) at low
  opacity; keep text contrast per handbook.
- Wire the landing's sector cards + router aliases (already in
  `src/pages/router.tsx`) — verify all 4 routes + aliases resolve.

## Language & mobile (required)

- **Bilingual**: every string ships in Arabic (from Figma, verbatim)
  AND English (write proper marketing English). Use `useLang().L(ar, en)`
  inside the shell, `{ ar, en }` pair props above it. Localize
  aria-labels and placeholders. Add `html[dir='ltr']` overrides for any
  physical CSS (arrows flip to point RIGHT in English, side-anchored
  elements swap, `text-align` mirrors) — see the LTR block in styles.css.
- **Mobile (375px)**: design the mobile layout intentionally — stacking
  order, type scale, ≥44px tap targets, and touch interactions
  (`?coarse` first-tap reveals where the pattern applies). Add rules to
  the 1240/980/700 breakpoints.

## Acceptance
Handbook rules + the full verification matrix: `npx tsc --noEmit`,
console sweep, screenshots in Arabic AND English × light AND dark ×
desktop 1440 AND mobile 375 (minimum 8 inspected states), plus `?coarse`
touch flows for any interactive cards/expanders.
handback → `docs/handbacks/screen-sectors.md`.
