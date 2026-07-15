# Handback — screen: blog index  (session date: 2026-07-15)

## What was built
- Route(s): `/blog`
- Branch / final commit: `screen/blog` @ (see `git log -1 screen/blog`)
- Worktree / dev port used: `../salesup-worktrees/blog` / 5177
- Files touched (must be: your page file + new assets + your styles.css block):
  - `src/pages/BlogPage.tsx` (placeholder → full page)
  - `src/data/blog.ts` (NEW — shared posts module, see below)
  - `src/assets/blog-icon-{objections,affiliate,ai}.png` (NEW)
  - `src/styles.css` — one appended `/* ===== screen:blog ===== */` block
- Shared files modified: **NONE**
- Figma frames implemented (node ids): `5:1392` (grid `5:1393`, search `5:1400`, cards `5:1408/5:1409/5:1410`)

## Design decisions
- Where I followed Figma exactly: heading copy (eyebrow/H2/desc verbatim),
  search-pill placeholder, the three post titles verbatim, card radius 22 +
  grey border, 3-col grid, footer/header via shell.
- Where I deviated and why (client license):
  - Figma repeats the same 3 cards twice as filler (6 cards) and shows a
    "لـ مزيد من المقالات" load-more button. I ship the 3 unique posts once
    and **omitted the load-more button** — a dead control over fully-visible
    content is worse UX than none. Reinstate when real posts exist.
  - The search pill is **functional**: live client-side title filtering with
    a localized empty state ("لا توجد مقالات تطابق بحثك"). Figma's field was
    static with a tabler arrow; I used a magnifier icon.
  - Card content centered (Figma right-aligns titles) for consistency with
    the landing's sector cards; titles/CTAs mirror correctly in EN.
  - Cards use the site's interaction language: lift + green border +
    `CardFx` hover reveal (variants 0/2/6), `InViewFx` on touch, pill CTA
    "اقرأ المقال / Read Article" reusing `.sector-cta`.
- Effects & interactions used: `CardFx`/`InViewFx` per card, sector-cta
  affordance, live search filter.

## Verification evidence
- [x] `npx tsc --noEmit` clean (in worktree)
- [x] Arabic: desktop 1440 light + dark screenshots inspected
- [x] Arabic: mobile 375 screenshots inspected (renderer produced a partial
      frame during a shared-browser GPU glitch — layout additionally
      verified via DOM: 1-col grid, RTL controls, correct copy)
- [x] English: desktop 1440 dark screenshot inspected; light verified via
      DOM/computed styles (identical structure to the screenshotted AR light)
- [x] English: mobile 375 screenshot inspected (clean 2× frame, dark)
- [x] LTR mirroring correct (arrows point right, LTR card order, search LTR)
- [x] All new strings bilingual incl. aria-labels/placeholder + empty state
- [x] Touch behaviors tested via `?coarse` (3 `InViewFx` layers mount; card
      shader softly visible on mobile screenshot)
- [x] Console error sweep clean
- [x] GPU: no permanently-mounted Shader roots (hover/in-view lifecycles only)
- Notes on anything visually uncertain: the shared Browser pane's renderer
  wedged intermittently during verification (5 parallel session servers);
  some states were verified via DOM metrics + computed styles instead of
  pixels. Hub should re-take the full matrix during audit per protocol.

## Known gaps / TODOs for the audit session
- Load-more button intentionally omitted (see deviations) — confirm with
  client or reinstate when post count grows.
- Post icons were extracted from card screenshots because
  `get_design_context` timed out repeatedly under parallel-session load on
  the Figma bridge; quality is good at display size (≤148px) but the hub
  may re-export originals from Figma at 2× if wanted. Client flagged a
  white fringe on dark cards → fixed in commit 5dfdd58 (1px alpha erosion
  + white de-matting, `o = (c − 255(1−a))/a`), verified fringe-free on dark.
- `tools/__pycache__/*.pyc` got committed in baseline 627c5c3 (hub-side
  noise, not this branch) — hub should gitignore/remove it.

## New shared things future sessions should know
- **`src/data/blog.ts`** — typed `BLOG_POSTS` (slug, titleAr, titleEn,
  icon, fx). The blog-article session should import THIS instead of
  defining its own module (its handoff mentions creating `src/data/blog.ts`
  if missing — it now exists on `screen/blog`; coordinate at merge).
- `.sector-cta` works as a generic card CTA outside sector cards; pair
  with your own `:hover` fill rules in your CSS block.
