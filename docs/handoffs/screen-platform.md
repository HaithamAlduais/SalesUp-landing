# Handoff — Platform (`/platform`)

Read `docs/HANDBOOK.md` first. Build in `src/pages/PlatformPage.tsx`.

## Workspace (isolated — do not build on master)

- Branch: `screen/platform` · Worktree: `../salesup-worktrees/platform` · Dev port: **5179**
- Setup: `git worktree add ../salesup-worktrees/platform -b screen/platform master` → `cd ../salesup-worktrees/platform` →
  `npm install` → set `.claude/launch.json` to port 5179 (don't commit
  that change) → open via the Browser pane preview.
- Work ONLY in your page file + new assets + ONE appended
  `/* ===== screen:platform ===== */` block at the end of
  `styles.css`. Commit on your branch; the hub merges all branches into
  `master` and runs the final audit.

## Figma frames
- `5:3414` (1440×1470) — "اضافه المنصه": heading block Frame 238
  (933×180), two small decoration frames (113×293), footer at y=820.
  A short page — likely an announcement/teaser for the digital
  platform (الحلول الرقمية nav item).

## Direction
- Short pages earn their polish through atmosphere: consider a hero
  treatment with `HeroFx`-style shader presence (new tuned scene is
  fine — keep it subtle and dark-mode aware) + the exact Figma copy +
  a CTA to `/#contact`.
- The two 113×293 decorations: fetch them from the asset server; they
  may be the star/squiggle motifs — pin them like the About viewport
  decorations (they must not drift through content).
- If the Figma content is thin, propose ONE tasteful extra section
  (e.g. feature bullets from the landing's platform mentions) and flag
  it clearly in the handback for client approval.

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
handback → `docs/handbacks/screen-platform.md`.
