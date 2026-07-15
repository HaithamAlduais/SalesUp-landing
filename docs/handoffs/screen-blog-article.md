# Handoff — Blog article (`/blog/:slug`)

Read `docs/HANDBOOK.md` first. Build in `src/pages/BlogArticlePage.tsx`.

## Workspace (isolated — do not build on master)

- Branch: `screen/blog-article` · Worktree: `../salesup-worktrees/blog-article` · Dev port: **5178**
- Setup: `git worktree add ../salesup-worktrees/blog-article -b screen/blog-article master` → `cd ../salesup-worktrees/blog-article` →
  `npm install` → set `.claude/launch.json` to port 5178 (don't commit
  that change) → open via the Browser pane preview.
- Work ONLY in your page file + new assets + ONE appended
  `/* ===== screen:blog-article ===== */` block at the end of
  `styles.css`. Commit on your branch; the hub merges all branches into
  `master` and runs the final audit.
Depends on: blog index session (shares the posts data — if it hasn't
run yet, define the shared posts module yourself under
`src/data/blog.ts` and note it in the handback).

## Figma frames
- `5:1467` (1440×3622) — article page: content Frame 281 (1348×2767) +
  footer.

## Direction
- Long-form RTL article layout: comfortable measure (~760-820px),
  headings in design-system green, body ink; hero image on top.
- A reading-progress affordance is welcome (thin green bar under the
  header island) — matches the site's motion language.
- Related-posts row at the bottom using the blog index card component.
- Unknown slugs → render the first/fallback article or a graceful
  empty state (your call; document it).

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
handback → `docs/handbacks/screen-blog-article.md`.
