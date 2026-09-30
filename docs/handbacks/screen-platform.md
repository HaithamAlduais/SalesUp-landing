# Handback — screen: Platform (`/platform`, الحلول الرقمية)

## 2026-09-30 — naming + التعديلات.pdf + retiring /platform

- **مسوّق → بائع everywhere the site says it** (every form: المسوّقين →
  البائعين, للمسوّق → للبائع, مسوّقون → بائعون …, and the role's
  «فرص/جاهزة/بدء التسويق» → «البيع»); English marketer → seller. Kept:
  مسودة (draft), SalesUp's own marketing services, the «أخصائي تسويق»
  job, old redirect slugs. NOT changeable from code: two WordPress blog
  posts («لماذا يختار مسوقين بالعمولة…», «منصات التسويق بالعمولة…») —
  edit them in wp-admin if wanted (their SEO keyword is «مسوق بالعمولة»).
- **Story step pills removed on every page** («للبائع · اختر فرصتك»,
  «للشركة · البداية من منتجك» …).
- **Students**: every sign-up button reads «انضم معنا» / “Join us”.
- **Sellers page**: «بِع منتجات رقمية».
- **Business**: dropped «أنت تكتب الشروط والعمولة» from the first card.
- **Footer map**: only on home and services (`<PageShell footerMap>`).
- **/platform retired** (Eynas): الحلول الرقمية and the footer link open
  `/platform/business`; `/platform` redirects there (app, WordPress
  301, Vercel). `PlatformPage.tsx`, the audience toggle and its CSS are
  gone.

## 2026-09-29 — client review round (تعديلات وملاحظات لصفحات الهبوط.pdf)

All applied to the page each slide names; shared copy on the other pages
is untouched.
- **Students**: headline «طالب وودّك تجمع بين / خبرة عملية ومصدر دخل»
  (the client's note: students want work experience before they
  graduate); new lead; «ليش يناسبك كطالب»; two reworded bullets in
  «كل شي واضح قدامك»; tools heading «كل الأدوات الي تحتاجها موجودة في
  منصتنا» with the six new descriptions («منتجات متنوعة تنضم لها»);
  FAQ: new answer to «ما عندي خبرة…» and «هل فيه وقت محدد للعمل؟».
- **Marketers**: new hero lead; new answer to «كيف تشتغل المنصة؟»;
  «كيف تُحسب العمولة؟»; added «ماهو CRM؟» (the answer is drafted from
  the approved CRM copy — the client gave the question only, review
  it); final line «سجّل بخطوة واحدة، اختر أول منتج واكسب مع أول صفقة
  تقفلها»; cross card «…وتلقى مسوّقين يبيعونه لك».
- **Companies**: final line «انشر منتجك اليوم وخلّ المسوّقين يبيعونه لك».
- Small fixes to the client's text: «أعتمدت» → «اعتُمدت», a missing
  space after «وقفت،».
- Verified: every new phrase present in AR and EN on its page, no
  console errors; students hero checked at 1440 and 375.

## 2026-09-27 — audience pages (business / affiliate / students)

Ported Eynas's three references (Slack, Sep 22) the same way as
`/platform`: React on shared building blocks, our shell and shaders,
not the raw HTML.

- **Routes**: `/platform/business` (business.html), `/platform/affiliate`
  (affiliate.html), `/platform/students` (students.html).
- **Kit**: `src/pages/platformKit.tsx` now holds every building block
  (board + scenes, hero, duo, sticky story, features, FAQ, final, cross
  card, scroll reveal). `PlatformPage.tsx` (unchanged output — same
  page height, verified) and `PlatformAudiencePage.tsx` compose it.
- **Nav dropdown** (shared `Header.tsx`): الحلول الرقمية opens
  للشركات / للمسوّقين with the reference's icon + one-line description,
  on hover and keyboard focus; on touch screens the first tap opens it.
  The link itself still goes to `/platform` (the overview). The mobile
  menu lists both as indented sub-links. The current page is marked.
- **Per the client comments**: hero background = our HeroFx shader;
  business/affiliate use the site's own footer; before the footer a
  cross card links to the other audience's page («صفحة المسوّقين» /
  «صفحة الشركات»); «ابدأ الآن مجاناً» goes straight into the app —
  companies to `app.salesup.sa/login?intent=brand`, marketers AND
  students to `?intent=affiliate` (the marketer flow).
- **Students**: standalone — `src/shared/StandaloneShell.tsx` (unlinked
  logo, CTA, language + theme toggles, no site nav, no WhatsApp button)
  and `<Footer minimal />` (faded wordmark, legal line, closing block,
  socials — the reference's slim footer). Not linked from the site.
- **Same treatment as /platform (flag for review)**: each page also
  gets the sticky product story, using only the step copy already
  approved on /platform — business: publish → approval → performance;
  marketers/students: opportunities → CRM → commissions — and the
  ContactFx final block. Remove a page's story by dropping its
  `<Story>` line.
- **Copy**: verbatim from each reference; the business page's first
  feature card is «انشر منتجك» as in business.html (the /platform card
  stays «انشر منصتك» per the Sep 13 revision).
- **WordPress**: route titles for the three pages; the old-site
  `affiliate` / `برنامج-التسويق-بالعمولة-المطور` 301s now land on
  `/platform/affiliate` instead of `/platform`.
- **Verified**: tsc clean; headless AR light / EN dark desktop 1440 and
  AR light 375 for all three pages, every story step, no console
  errors, no horizontal overflow; dropdown in EN dark (LTR); mobile
  menu; students header at 375 (AR/EN) and 320.
- **Open**: a student-specific signup marker (the reference used
  `?role=student`) needs the app side (Shaya) — for now students use
  the marketer intent. The WhatsApp button overlaps the hero lead on
  phones site-wide (pre-existing, not new here).

---

Earlier session: 2026-09-16 — page rebuilt to match the client's
`platform.html` reference (Eynas, Slack, Sep 13). Earlier sessions
(coming-soon page → native product story) are superseded.

## What was built
- Route: `/platform`
- Branch: `master` (work is uncommitted at handback time — commit after review)
- Files touched:
  - `src/pages/PlatformPage.tsx` — full rewrite from the reference
  - `src/platform.css` — full rewrite; the ONLY platform stylesheet now,
    imported by the page (route chunk), no longer by `main.tsx`
  - Removed: `src/platform-refinement.css`, `platform-authored.css`,
    `platform-mobile.css`, `platform-accounts.css`, `platform-real-product.css`
  - `docs/handbacks/screen-platform.md` (this file)
- Shared files modified (each minimal, listed for the hub):
  - `src/main.tsx` — dropped the three global platform CSS imports
  - `src/styles.css` — deleted the two dead platform blocks
    (`/* ===== screen:platform ===== */` coming-soon styles and the
    "Digital platform — native SalesUp product story" block at the end);
    no other block touched
  - `index.html` — Google Fonts link also loads JetBrains Mono
    (400/500/700); the reference uses it for every number in the boards
- Reference: client file `platform.html` (Slack DM, Sep 13). Not committed
  to the repo — the design source of truth for this screen.

## Client brief (Slack, Eynas)
- «حرفيا سووها نفسها» — make it the same as the reference, BUT keep our
  nav bar, keep our hero background (the platform shader), keep our footer.
- «خليه حي أكثر وأنا أسوي سكرولينق» — more alive while scrolling.
- Revision: the company feature card «انشر منتجك» → «انشر منصتك».
- Haitham (Sep 16): not 100% identical — the shell, the shaders and the
  sticky scroll must be applied on top of the reference.

## Design decisions
- Structure and copy follow the reference 1:1: hero (h1 regular line +
  green bold line, lead, one "grow" CTA), «طرفين على نفس المنصة» duo
  cards, «كل أداة تحتاجها موجودة بمنصتنا» with the للمسوّق/للشركة toggle
  and 3×2 feature cards, FAQ with sticky heading + native `<details>`,
  the dark «سجّل بخطوة وحدة…» final block. The reference's extra hero
  copy that our previous build had (kicker, proof checks, second link)
  is gone because the reference doesn't have it.
- CSS is a scoped port of the reference stylesheet (`.platform …`) with
  the same class names so the two files diff side by side.
- Kept ours: `PageShell` header/footer; `HeroFx` behind the hero (with
  the landing's -86px reach + bottom dissolve; -72px under 980px where
  the header is shorter); the sticky product story.
- Hero board = the reference's 4 auto-rotating scenes (commissions live
  feed that pushes a row every 3s while on screen, CRM kanban,
  leaderboard, performance) — the exact data and timings (5.2s / 3s).
- Sticky story («من المنتج إلى النتيجة», 6 steps, 600vh) reuses the
  reference board as its stage: three reference scenes (CRM, commissions,
  performance) + three built from the same primitives (publish,
  opportunities, approval). `ActiveFx` sits inside the board as a soft
  edge vignette (masked, .14 light / .22 dark) so the data stays legible.
  Under 700px the pinned story becomes a plain list, each step with its
  own board (a 100vh pin doesn't fit a phone with the board + copy).
- "Alive on scroll": the reference's staggered reveal (`.rv` → `.in`,
  110ms sibling stagger) is ported as `useReveal`; reduced-motion skips
  it and freezes the feed/rotation, as in the reference.
- The `.grow` CTA (arrow circle that opens on hover) is always open on
  touch (`hover: none`) so phones get a real button.
- Final block («سجّل بخطوة وحدة…»): per Haitham (Sep 16) it carries the
  landing's contact-panel material — the panel gradient underneath plus
  `ContactFx` (the shell's `.contact-fx` rules clip it and provide the
  animated CSS fallback without a GPU scene). The reference's static
  radial glow was dropped in favour of the scene.
- Client revision applied: company card #1 is «انشر منصتك» / "Publish
  your platform" — flagged: literal reading of the Slack note; confirm.

## Verification evidence
- [x] `npx tsc --noEmit -p tsconfig.app.json` clean
- [x] Console + Vite error sweep clean
- [x] Screenshot matrix (headless Chrome, full page + one shot per story
  step): AR light 1440, EN light 1440, AR dark 1440, EN dark 1440,
  AR light 375, EN dark 375 — no horizontal overflow in any state
- [x] LTR: arrows flip (`html[dir='rtl'] .btn svg`), story progress bar
  origin flips, `.total b` direction flips, numbers stay LTR
- [x] All strings bilingual incl. aria-labels
- [x] Interactions: audience toggle (company set shows «انشر منصتك»),
  FAQ open/close, hero scene rotation, story scroll sync (rail, scene,
  progress bar, ActiveFx gate); rail click → smooth scroll verified by
  scroll position math (the hidden Browser pane can't animate scroll)
- [x] GPU: HeroFx (InViewGate) + ActiveFx (track-visibility gated) +
  ContactFx (InViewGate) — never more than two alive at once, as on the
  landing
- Not verified: real WebGPU look of the vignette (headless used the GL
  path); the ActiveFx opacity is a judgement call — tune if it reads
  as noise on the white board in a real browser.

## Known gaps / TODOs
- Both CTAs (`ابدأ مجاناً`) go to the app: `https://app.salesup.sa/login`
  (Sep 16, per Haitham). The app's login page also accepts
  `?intent=brand` / `?intent=affiliate` if role-specific entry is wanted.
- `src/components/ProductAppPreview.tsx`, `src/product-*.css`,
  `src/platform-product-content.ts` and `src/components/product-ui/`
  are no longer referenced by any page (they were already unused
  before this session). Left in place; delete if the product-UI port
  is not coming back.
- Final block lead wraps to two lines in AR at 1440 (reference shows
  one) — same `46ch` cap; cosmetic.

## New shared things future sessions should know
- Reference-driven screens: scope the reference CSS under one root
  class and keep its class names — the diff against the client file
  stays readable and revisions are a copy-paste.
- The Browser pane can't scroll or animate while hidden; use the
  headless capture scripts pattern (CDP + scroll-through + per-step
  shots) for the screenshot matrix.
