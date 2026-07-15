# Handback — screen: Marketers  (session date: 2026-07-15)

## What was built
- Route(s): `/marketers` (main funnel), `/marketers/apply` + `/marketers/request` (request form; `?type=service|package&pick=seo|campaigns|basic|pro` preselects), success state in-page after submit.
- Branch / final commit: `screen/marketers` @ `0da477e`
- Worktree / dev port used: `../salesup-worktrees/marketers` / **5175**
- Files touched: `src/pages/MarketersPage.tsx` (full implementation) + one appended `/* ===== screen:marketers ===== */` block at the end of `src/styles.css`.
- Shared files modified: **NONE**.
- Figma frames implemented: 5:2379 (services tab), 5:2494 (packages tab), 5:2618/5:2699/5:2781/5:2863 (request form, service select + option states), 5:2945/5:3104/5:3186/5:3268 (package variant + option states), 5:3350 (success).

## Design decisions
- Followed Figma exactly: hero copy (خلّ حضورك الرقمي **يوصل أبعد** with the green highlight), services⇄packages segmented toggle, both pricing cards per tab (SEO 3,000 / campaigns 3,900 / basic 6,900 / pro 8,000, all "عند الاشتراك لمدة 3 شهور"), feature checklists verbatim, form fields (الاسم*, رقم الجوال*, الايميل, اختر الخدمة/الباقة*, رابط المنتج / الخدمة*, ملاحظات), success copy verbatim.
- Deviations (client license):
  - The 9 Figma state frames are implemented as ONE interactive module (tab state + query-param preselection + native select + in-page success swap), not separate pages.
  - Figma's typo "تحليل الوقع والمنافسين" (campaigns card) corrected to "تحليل الموقع والمنافسين".
  - The Figma sub-nav on the funnel frames (الرئيسية/الخدمات/الاسئلة الشائعة) is NOT reproduced — the global island header stays per handbook; FAQ is reachable by scroll.
  - Segmented toggle got the site's motion language (sliding white thumb, 300ms).
- Effects & interactions: `ContactFx({dark})` scenes on the hero, contact banner, apply and success panels (all in-view gated by the component itself); tab-keyed entrance animation on card swap; grid-rows FAQ accordion; hover lift + green border on pricing cards.

## Verification evidence
- [x] `npx tsc --noEmit` clean
- [x] Arabic: desktop 1440 light — main (both tabs), FAQ, apply, success all screenshot-inspected
- [x] Arabic: mobile 375 light — main cards + apply form inspected (single column, ≥44px targets)
- [x] English: desktop 1440 light + dark screenshots inspected (LTR order, translated pricing, dark cards readable)
- [ ] English: mobile 375 — NOT separately screenshot; EN mobile shares the AR mobile layout (mirrored automatically) — audit should spot-check
- [x] LTR mirroring correct (toggle thumb direction flips via `html[dir='ltr']`, price row is `dir="ltr"` in both, select chevron uses logical inset)
- [x] All new strings bilingual incl. aria-labels/placeholders
- [x] Touch: no hover-gated content on this screen (CTAs always visible; tabs/FAQ are buttons) — works on touch by construction; `?coarse` not required for any reveal flow
- [x] Console error sweep clean
- [x] GPU: no permanently-mounted Shader roots added (ContactFx self-gates in-view)

## Known gaps / TODOs for the audit session
- **FAQ answers are AUTHORED** (both tabs) — Figma has questions only (accordions collapsed). Client should review the 10 answers' wording/claims (e.g. "خلال يوم عمل", SEO timelines).
- English marketing copy is authored throughout (no EN in Figma).
- Form submits are front-end only (success state swap); no backend endpoint exists yet — same as the landing/services forms.
- EN mobile screenshot pass left to audit (see checkbox above).
- Native `<select>` styling: options list uses browser chrome (white list, ink text) — matches Figma closely enough but not pixel-identical to frames 5:2699/5:3104.

## New shared things future sessions should know
- None added to shared files. Pattern available to copy: the segmented-toggle (`.mk-tabs` + sliding thumb with `html[dir='ltr']` flip) and the grid-rows FAQ accordion (`.mk-faq-a` 0fr→1fr) are clean patterns to lift for other screens.
