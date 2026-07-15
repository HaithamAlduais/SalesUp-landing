# SalesUp Website — Session Handbook

Every screen-building session reads this FIRST, then its handoff file in
`docs/handoffs/`, builds its screen, and writes a handback into
`docs/handbacks/` for the audit session.

## Project

Arabic RTL marketing site for SalesUp (سيلز أب), React + Vite + TS, dev
server `npm run dev` → localhost:5173 (use the Browser pane's preview,
never Bash). Figma file `SalesUp Website` (i5dv3EJxlCYWygP7oyAJmp), Ui
section node `18:4604`, Design System node `18:4603`. The landing page
(Figma `5:962`) is DONE and is the quality bar for everything else.

**License from the client:** follow Figma content/copy exactly, but you
may skip Figma layout rules whenever you have something clearly better
("skip many figma rules if you have something better"). The landing
page already departs from Figma with approved patterns — reuse them.

## Design system

- Primary green `#04CB79` (scale `#039458` → `#05FFA6`), secondary teal
  `#133F40` (scale `#0E2E2F` → `#1A5658`), greys `#CFCFCF/#E6E6E6/#E9E9E9`,
  eyebrow `#DCD8D8`. Dark page bg `#0B1B1C`.
- Font: IBM Plex Sans Arabic (400/500/600/700), loaded in index.html.
- Type scale: H1 55/bold, H2 40/bold, H3 34-35/bold, body 24/400,
  buttons 24/bold. Sections use `.section-heading` (eyebrow + h2 + desc).
- Cards: radius 22, shadow `0 0 4px rgba(0,0,0,.1)`. Buttons: full-pill
  radius; `.button--dark` = 251×79 gradient `#133f40→#177e6f`.
- Content width: `--content` = 1123px; `width: min(var(--content), 100% - 32px)`.
- Breakpoints: 1240 / 980 / 700. ≤980 hides desktop nav + decorations.

## Architecture

- `src/shared/PageShell.tsx` — wraps EVERY page: theme system, header
  (pass `active` nav key), footer, skip link. Page bodies read theme via
  `usePageTheme()` → `{ theme, dark }`.
- `src/shared/Header.tsx` — floating-island header (transparent at top →
  glass capsule after 64px scroll), magic-ink nav highlight, shine-sweep
  CTA, glass mobile sheet w/ stagger + scroll lock + Escape. Do NOT fork
  it per page; pass `active`.
- `src/shared/Footer.tsx` — design footer (theme-aware logos, white
  social glyphs in dark).
- `src/shared/theme.tsx` — `useTheme` (View-Transitions circular reveal),
  `ThemeToggle`, `usePageTheme`.
- `src/shared/ui.tsx` — `CountUp` (3.6s ease-out), `PagePlaceholder`.
- `src/components/CardFx.tsx` — ALL WebGL scenes (shaders.com `shaders`
  npm package, WebGPU-only):
  - `HeroFx({dark})` — Swirl+ChromaFlow+FlutedGlass+FilmGrain, cursor
    paints brand greens; on touch a green Blob keeps color present.
  - `CardFx({variant})` — hover-mounted translucent card scene
    (Stripes+Stretch+Dither, 7 brand-tuned variants, 0.3 opacity).
  - `ActiveFx({variant, active})` — state-driven scene (sticky slides,
    expanders), 0.32 opacity while active.
  - `InViewFx({variant})` — touch devices: softly visible while on
    screen (0.26).
  - `ContactFx({dark})` — panel scene (Swirl+ChromaFlow+FlutedGlass+
    FilmGrain in panel teals).
  - `COARSE_POINTER` — touch detection (`hover: none`, `?coarse` URL
    override for desktop testing).
- `src/pages/router.tsx` — path → page map. `src/App.tsx` = landing.
- One CSS file: `src/styles.css` (sections are commented). Add your
  screen's styles in a clearly-marked block + its dark-mode overrides in
  the dark section + responsive rules in the media queries.

## Interaction patterns (reuse these)

1. **Sticky story** (About/Process pattern): tall track (300-340vh) +
   `position: sticky` viewport + absolutely-stacked slides crossfaded by
   scroll progress (`floor(progress × n)`), progress dots, per-slide
   `ActiveFx`. Gate fx by track visibility (IntersectionObserver).
2. **Expander cards** (Services pattern): equal compact cards; hover
   (mouse) or first-tap (touch, `preventDefault`) expands via
   `flex-grow`, revealing `ActiveFx` + body + pill CTA; second tap
   navigates. Keyboard: focus expands (keydown-Tab heuristic — see
   Services in App.tsx). Collapse + release GPU when offscreen.
3. **Obvious link-cards** (Sectors pattern): pill CTA "اكتشف …" + arrow,
   hover lift + green border + shader reveal; touch gets `InViewFx`.
4. **Marquee logo wall**: mono grey (hover = brand color) / white
   silhouettes or dedicated white art in dark. See MARQUEE_BRANDS.
5. **Contact panel**: `.contact-panel` gradient + `ContactFx`.

## Bilingual (Arabic RTL / English LTR) — MANDATORY

The site ships in BOTH languages; the header's ع/EN button toggles at
runtime (persisted in localStorage `salesup-lang`, `<html dir>` and
`lang` switch automatically).

- Every string you add MUST be bilingual via `useLang()`:
  `const { lang, L } = useLang(); L('العربية', 'English')`. Components
  above the shell (page files) pass `{ ar, en }` pairs instead (see
  `PagePlaceholder`). Write proper marketing English, not literal
  translations; pull Arabic from Figma verbatim.
- Layout mirrors automatically through `dir` (flexbox/logical props).
  For PHYSICAL CSS you add (left/right offsets, `text-align: right`,
  arrow directions), add `html[dir='ltr']` overrides — see the
  "English (LTR) adjustments" block in styles.css. Forward arrows point
  LEFT in Arabic and RIGHT in English (`scaleX(-1)` + flipped nudge).
- Inline CTA rows that mix icon+text use `dir={lang === 'ar' ? 'rtl' : 'ltr'}`
  (see sector/expander CTAs).
- Keep permanent `dir="ltr"` islands (stats, marquee, process stage,
  sector grid) as-is in both languages; scope language CSS to
  `html[dir=…]` so islands don't false-match.
- aria-labels and placeholders are localized too.

## Hard rules

- RTL-first (`dir="rtl"` default); use `dir="ltr"` islands only where
  the design demands LTR ordering.
- Full dark-mode support for every new element (`[data-theme='dark']`).
- Mobile is a first-class deliverable, not an afterthought: design the
  375px layout intentionally for every new section (stacking, type
  scale, tap targets ≥44px, touch behavior via `?coarse`) and include
  it in the responsive blocks at 1240/980/700.
- GPU budget: never mount many `<Shader>` roots permanently — use
  CardFx/ActiveFx/InViewFx lifecycles or an in-view gate (each root
  holds its own WebGPU device; browsers cap them).
- No white edge fades on marquees (client explicitly hates them).
- No invented copy: pull text from Figma (`get_design_context`).
- Counters: default 3600ms.
- Verify before claiming done: `npx tsc --noEmit`, console error sweep,
  and the screenshot matrix — Arabic AND English, light AND dark,
  desktop 1440 AND mobile 375. Minimum eight inspected states per
  screen: AR/EN × light/dark on desktop, plus AR/EN × (one theme) on
  mobile — and always exercise touch flows with `?coarse`.

## Figma access (Dev Mode MCP over HTTP)

The Figma desktop app must be running with the file open (Dev Mode MCP
server enabled). Then:

```
python tools/figma_mcp.py get_metadata      "5:1675" out.txt   # structure/ids/sizes
python tools/figma_mcp.py get_design_context "5:1675" out.txt  # exact code/text/styles
python tools/figma_mcp.py get_screenshot    "5:1675" out.txt   # visual reference
```

Assets are served at `http://localhost:3845/assets/<hash>.png` — download
into `src/assets/` with semantic names. If the server is down, ask the
user to open Figma. `get_design_context` output is authoritative for
copy and spacing.

## Screen inventory (Ui section 18:4604)

| Screen | Route | Figma frames | Status |
|---|---|---|---|
| Landing | `/` | 5:962 (variant 55:879 unchecked) | ✅ built |
| Services index | `/services` | 5:1675, 5:1755, 5:1835, 5:3609 | handoff |
| Marketers | `/marketers` | 5:2379, 5:2494 + states 5:2618…5:3350 | handoff |
| Sectors ×4 | `/sectors/:slug` | 5:1530, 5:1944, 5:2089, 5:2234 | handoff |
| Blog index | `/blog` | 5:1392 | handoff |
| Blog article | `/blog/:slug` | 5:1467 | handoff |
| Platform | `/platform` | 5:3414 | handoff |
| Jobs | `/jobs` | 5:3470 | handoff |
| Header specs | — | 5:3526…5:3538 (reference only; our header is better) | n/a |

## Session process — worktrees, ports, and the hub merge

Screen sessions run ISOLATED: each works in its own git worktree on its
own branch and runs its own dev server on its own port. The hub session
(the coordinator that wrote these handoffs) merges every branch back
into `master` at the end and runs the final audit. Never build a screen
directly on `master`.

### Assignments

| Screen | Branch | Worktree | Dev port |
|---|---|---|---|
| (hub / master) | `master` | main checkout | 5173 |
| Services | `screen/services` | `../salesup-worktrees/services` | 5174 |
| Marketers | `screen/marketers` | `../salesup-worktrees/marketers` | 5175 |
| Sectors | `screen/sectors` | `../salesup-worktrees/sectors` | 5176 |
| Blog index | `screen/blog` | `../salesup-worktrees/blog` | 5177 |
| Blog article | `screen/blog-article` | `../salesup-worktrees/blog-article` | 5178 |
| Platform | `screen/platform` | `../salesup-worktrees/platform` | 5179 |
| Jobs | `screen/jobs` | `../salesup-worktrees/jobs` | 5180 |

### Screen session steps

1. Read this handbook + your `docs/handoffs/screen-*.md`.
2. Create your isolated workspace (the baseline must already be
   committed on `master` — if it isn't, the hub commits it first):
   ```
   git worktree add ../salesup-worktrees/<screen> -b screen/<screen> master
   cd ../salesup-worktrees/<screen>
   npm install
   ```
3. Point your dev server at YOUR port: edit `.claude/launch.json` in
   your worktree to `"port": <your port>` and add
   `"runtimeArgs": ["run", "dev", "--", "--port", "<your port>"]`, then
   open it with the Browser pane's preview (never Bash). Do NOT commit
   the launch.json port change.
4. Fetch your frames from Figma (metadata → screenshot → design context).
5. Build the page body in YOUR page file under `src/pages/` (the shell
   is already wired; replace the `PagePlaceholder`).
6. **Conflict rules** (the hub merges seven branches — make it clean):
   - Touch ONLY: your page file, new asset files, your handback doc.
   - ALL your CSS goes in ONE delimited block appended at the END of
     `styles.css` — `/* ===== screen:<name> ===== */` … including your
     own `@media` and `[data-theme='dark']` rules inside that block.
     Never edit existing shared blocks.
   - Do not modify `src/shared/*`, `src/App.tsx`, other pages, or
     shared assets. If truly unavoidable, keep it minimal and list
     every shared-file change prominently in your handback.
7. Verify per the matrix (tsc, AR/EN × light/dark × desktop/mobile,
   console, `?coarse`).
8. Commit your work on your branch (leave launch.json out) and write
   `docs/handbacks/screen-<name>.md` (template in
   `docs/handoffs/HANDBACK-TEMPLATE.md`), including your branch name and
   final commit. Be honest about gaps.
9. STOP after your screen — the client reviews before the next session.

### Hub merge (final phase)

The hub, in the MAIN checkout on `master` (port 5173):
1. Reads every handback; re-verifies claims per screen (checkout or
   preview each worktree if needed).
2. Merges one branch at a time: `git merge screen/<name>` → resolve
   conflicts (styles.css appended blocks should merge trivially;
   shared-file edits flagged in handbacks get extra scrutiny) →
   `npx tsc --noEmit` → spot-verify in the browser → next branch.
3. After all merges: run `docs/handoffs/audit-final.md` end to end on
   the merged site.
4. Cleanup: `git worktree remove ../salesup-worktrees/<name>` and
   delete merged `screen/*` branches.
