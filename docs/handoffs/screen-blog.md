# Handoff — Blog index (`/blog`)

Read `docs/HANDBOOK.md` first. Build in `src/pages/BlogPage.tsx`.

## Workspace (isolated — do not build on master)

- Branch: `screen/blog` · Worktree: `../salesup-worktrees/blog` · Dev port: **5177**
- Setup: `git worktree add ../salesup-worktrees/blog -b screen/blog master` → `cd ../salesup-worktrees/blog` →
  `npm install` → set `.claude/launch.json` to port 5177 (don't commit
  that change) → open via the Browser pane preview.
- Work ONLY in your page file + new assets + ONE appended
  `/* ===== screen:blog ===== */` block at the end of
  `styles.css`. Commit on your branch; the hub merges all branches into
  `master` and runs the final audit.

## Figma frames
- `5:1392` (1440×2358) — blog index: posts grid Frame 216 (1372×1278),
  a `.button--dark`-sized button (Group 4, 251×79, likely "load more"),
  footer.

## Direction
- Post cards: card radius 22 + shadow per design system; give cards the
  sector-card hover affordance (lift + green border) and consider a
  subtle `CardFx` hover reveal (respect text contrast + GPU lifecycle).
- Post data: extract the posts (titles, excerpts, images) from Figma
  design context; store in a small typed array in the page file; card
  links go to `/blog/<slug>` (create slugs from titles).
- Download post images from the Figma asset server into `src/assets/`
  with semantic names (`blog-<slug>.png`).

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
handback → `docs/handbacks/screen-blog.md`.
