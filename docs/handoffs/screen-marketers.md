# Handoff — Marketers service (`/marketers`, `/marketers/apply`)

Read `docs/HANDBOOK.md` first. Build in `src/pages/MarketersPage.tsx`.

## Workspace (isolated — do not build on master)

- Branch: `screen/marketers` · Worktree: `../salesup-worktrees/marketers` · Dev port: **5175**
- Setup: `git worktree add ../salesup-worktrees/marketers -b screen/marketers master` → `cd ../salesup-worktrees/marketers` →
  `npm install` → set `.claude/launch.json` to port 5175 (don't commit
  that change) → open via the Browser pane preview.
- Work ONLY in your page file + new assets + ONE appended
  `/* ===== screen:marketers ===== */` block at the end of
  `styles.css`. Commit on your branch; the hub merges all branches into
  `master` and runs the final audit.
This is the largest remaining screen (a funnel with states).

## Figma frames
- `5:2379` (1440×4220) — main page: Frame 116 (1321×825, likely package
  cards), Frame 239 (1115×1042, likely features/steps), Group 35
  (1302×519, consultation panel), Frame 159 (1252×532), footer.
- `5:2494` (1440×4220) — variant of the main page (diff it).
- State frames (1440×1617 each): `5:2618`, `5:2699`, `5:2781`, `5:2863`,
  `5:2945`, `5:3104`, `5:3186`, `5:3268`, plus `5:3350` (1440×1543).
  These look like interactive states of one module (package selection /
  application steps). Fetch screenshots of ALL of them first, map the
  state machine, and implement it as ONE interactive React module (not
  9 pages) — state-driven with `ActiveFx` reveals, similar to the
  landing's expander/sticky patterns.

## Direction
- The landing's featured Marketers card (fx variant 1 + جديد badge) is
  the visual anchor — carry its identity into the page hero.
- Multi-step application flow: reuse form field styles from
  `.contact-form` (`.field`, `.button--submit`).
- CountUp for any stats; sticky story if the page narrates steps.

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
handback → `docs/handbacks/screen-marketers.md`.
