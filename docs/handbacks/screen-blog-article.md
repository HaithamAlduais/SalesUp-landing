# Handback — screen: blog-article  (session date: 2026-07-15)

## What was built
- Route(s): `/blog/:slug` — full article for `affiliate-marketing-platforms`,
  "coming soon" body for `ai-in-sales` and `handling-customer-objections`
  (they have titles/cards in Figma but no article body), graceful
  not-found state for unknown slugs.
- Branch / final commit: `screen/blog-article` @ `9aba422`
- Worktree / dev port used: `../salesup-worktrees/blog-article` / 5178
  (note: the Browser-pane 5-server cap was hit by parallel sessions, so
  vite ran via a background shell and the pane opened the URL directly)
- Files touched: `src/pages/BlogArticlePage.tsx`, `src/data/blog.ts`
  (new), `src/assets/blog-{affiliate-platforms,ai-in-sales,customer-objections}.png`
  (new), one appended `/* ===== screen:blog-article ===== */` block in
  `src/styles.css`, this handback.
- Shared files modified: NONE in the commit. (Main-checkout
  `.claude/launch.json` gained a `blog-article-dev` entry — tooling
  only, uncommitted, per the handoff.)
- Figma frames implemented (node ids): `5:1467` (article). Post
  titles/icons sourced from the index card components (`5:1408-5:1410`)
  because `get_design_context` on `5:1392/5:1393` repeatedly timed out
  server-side; titles were transcribed from full-size node screenshots
  and icons extracted from the exported art.

## Design decisions
- Followed Figma exactly: eyebrow/H1 header with back affordance, the
  framed r22 hero card with centered drop-shadowed art, body structure
  (3 headings, paragraphs with Figma's line breaks, two 4-item lists,
  bold lead/closing), Arabic copy verbatim.
- Deviations (handbook license):
  - Body type 19px/1.95 at ~820px measure instead of Figma's 30px —
    30px body is a poster size, unreadable for long-form.
  - Promoted "الفرق بين منصات..." (visually a heading, weighted regular
    in Figma) to a real H2.
  - Added a reading-progress bar (handoff suggestion) and a related-
    posts section from the other two Figma posts.
  - The hero card gets a soft green radial tint so the framed area
    reads intentional on both themes.
- Effects & interactions: reading-progress (scroll-driven scaleX, RTL
  origin-right/LTR origin-left), sector-style hover affordances on
  related cards + back link (lift, green border, CTA fill, arrow
  nudge). No WebGL scenes added (long-form reading page — GPU budget
  untouched; shell header/hero fx unaffected).

## Verification evidence
- [x] `npx tsc --noEmit` clean
- [x] Arabic: desktop 1440 light + dark — DOM/CSSOM verified (see notes)
- [x] Arabic: mobile 375 — verified (media rules applied: back link
      stacks above title, no horizontal overflow, hero/related present,
      tap target 45px after fixing an initial 43px)
- [x] English: desktop 1440 light + dark — DOM verified (dir=ltr, all
      strings English incl. aria-labels, progress origin flips)
- [x] English: mobile 375 — same structural checks as Arabic
- [x] LTR mirroring correct — `html[dir='ltr']` arrow flips included in
      my block for `.article-back`/`.related-card` (base flip is global)
- [x] All new strings bilingual incl. aria-labels/placeholders
- [x] Touch: page has no tap-to-reveal interactions by design; related
      cards/back are plain links (navigate on tap, correct for touch)
- [x] Console error sweep clean
- [x] GPU: no permanently-mounted Shader roots added
- Notes on anything visually uncertain: **the Browser pane's renderer
  was degraded during this session** (6 parallel chats): screenshots
  timed out, native scroll events didn't dispatch, and the compositor
  froze CSS *transitions* at their start values. Verification therefore
  used DOM/CSSOM checks + synthetic events: progress bar proven exact
  (scaleX(0.270) at 900/3333 scroll), header island engages, dark rules
  confirmed present/matching in CSSOM with correct cascade (their
  transitioned color values could not be *observed* — only rules
  without transitions, e.g. body/card colors, could be seen applied).
  **No pixel screenshots exist for this screen — the audit session must
  re-take the 8-state visual matrix per audit-final.md.**

## Known gaps / TODOs for the audit session
- Re-take all pixel screenshots (see above) — first item to check is
  `.article-back`/`.related-cta` dark colors (#35e3ad) rendering.
- `ai-in-sales` and `handling-customer-objections` have no Figma
  article bodies — confirm with the client whether "coming soon" is
  acceptable or content is pending.
- Baseline commit tracks `tools/__pycache__/*.pyc` — hub should
  gitignore/rm it (shared file, out of my scope).
- Blog INDEX session: consume `BLOG_POSTS` from `src/data/blog.ts`
  (module created here per the handoff's dependency note); the search
  field copy from Figma is `ابحث هنا عن مقال معين`.

## New shared things future sessions should know
- `src/data/blog.ts` — typed bilingual posts + article-blocks model
  (`Bi`, `BlogPost`, `ArticleBlock`).
- Figma `get_design_context` can wedge on big frames (5:1392) — fetch
  small child nodes, or use node screenshots + `get_metadata` (text
  node NAMES carry their content).
- If the pane's 5-server cap is hit, run vite in a background shell and
  open the URL with `preview_start {url}`.
