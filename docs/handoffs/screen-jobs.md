# Handoff — Jobs (`/jobs`)

Read `docs/HANDBOOK.md` first. Build in `src/pages/JobsPage.tsx`.

## Workspace (isolated — do not build on master)

- Branch: `screen/jobs` · Worktree: `../salesup-worktrees/jobs` · Dev port: **5180**
- Setup: `git worktree add ../salesup-worktrees/jobs -b screen/jobs master` → `cd ../salesup-worktrees/jobs` →
  `npm install` → set `.claude/launch.json` to port 5180 (don't commit
  that change) → open via the Browser pane preview.
- Work ONLY in your page file + new assets + ONE appended
  `/* ===== screen:jobs ===== */` block at the end of
  `styles.css`. Commit on your branch; the hub merges all branches into
  `master` and runs the final audit.

## Figma frames
- `5:3470` (1440×1470) — "الوظائف": same skeleton as the platform page
  (heading Frame 238 933×180, two 113×293 decorations, footer at
  y=820). A short teaser page.

## Direction
- Mirror the platform page's approach (they share a skeleton — if the
  platform session ran first, reuse any shared "quiet page" component
  it created; check `docs/handbacks/screen-platform.md`).
- Consider an empty-state with personality: exact Figma copy + a
  "خلّينا نتواصل" CTA to `/#contact`, plus a subtle shader presence.
- If Figma shows job listings, build a listing card component (card 22
  radius + hover affordance) with data in the page file.

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
handback → `docs/handbacks/screen-jobs.md`.
