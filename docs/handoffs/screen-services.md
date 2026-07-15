# Handoff — Services index (`/services`)

Read `docs/HANDBOOK.md` first. Build the body in `src/pages/ServicesPage.tsx`.

## Workspace (isolated — do not build on master)

- Branch: `screen/services` · Worktree: `../salesup-worktrees/services` · Dev port: **5174**
- Setup: `git worktree add ../salesup-worktrees/services -b screen/services master` → `cd ../salesup-worktrees/services` →
  `npm install` → set `.claude/launch.json` to port 5174 (don't commit
  that change) → open via the Browser pane preview.
- Work ONLY in your page file + new assets + ONE appended
  `/* ===== screen:services ===== */` block at the end of
  `styles.css`. Commit on your branch; the hub merges all branches into
  `master` and runs the final audit.

## Figma frames
- `5:1675` (1440×2249) — main services page: hero heading block
  (Frame 269, 1372×1387 at top) + TWO large service banners
  (Group 23 + Group 24, 1140×458 each) + footer.
- `5:1755` (1440×2249) — variant of the same page (diff it: likely a
  hover/alt state — fetch both screenshots and compare).
- `5:1835` (1440×2385) — services page variant with ONE banner
  (Group 23) + content Frame 293 (1372×842) + a wide CTA panel
  (Group 35, 1302×519 — likely the consultation panel, reuse
  `.contact-panel` + `ContactFx`).
- `5:3609` (1440×1543) — shorter services screen (Frame 161, 1252×673).

Decide from screenshots which frame is the canonical `/services` and
whether the others are detail states — document your call in the
handback.

## Direction
- The landing's Services section already uses the expander pattern; the
  full page should feel like its expansion: richer service cards
  (icon + title + desc + CTA) using `CardFx`/`ActiveFx` variants 1/3/5,
  the 84px section rhythm, and a closing consultation panel
  (`.contact-panel` + `ContactFx({dark})` via `usePageTheme`).
- Respect exact Figma copy. Banner layouts (1140×458) are wide
  icon+text rows — consider the sector-card CTA affordance on them.

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
Handback → `docs/handbacks/screen-services.md`.
