# Handback — Final audit session (hub, 2026-07-16)

## Scope executed
All seven screen branches were merged into `master` prior to this
session (styles.css blocks reassembled verbatim from branches after a
union-splice repair — commit 16901e7). This session ran the release
audit per `docs/handoffs/audit-final.md` and closed out the worktrees.

## 1. Full-site pass
- 17 routes probed (iframe sweep, Arabic): all render, correct
  headings, footer on every page, no error overlays. Fallbacks work:
  unknown blog slug → "المقال غير موجود"; unknown route → landing.
- 8 routes re-probed in English: LTR direction, translated headings,
  correct active-nav on every page.
- Landing anchor targets (#about/#sectors/#process/#contact/#footer/#top)
  all resolve — footer links are sound.
- `npx tsc --noEmit` clean; postcss parse of styles.css clean;
  `npm run build` passes.
- **Code-splitting shipped (post-audit follow-up)**: initial JS is now
  ~63KB gzip (was 270KB). The shaders engine lives in a lazy `fxScenes`
  chunk (184KB gzip) loaded the first time a scene mounts in-view;
  every page is its own route chunk (0.8–7KB gzip); sector data moved
  to `src/data/sectors.ts` so the landing/router don't pull page code.
  All routes re-verified rendering after the split.

## 2. Adversarial review (28-agent workflow) — confirmed & fixed
| Severity | Finding | Fix (commit 69f1580) |
|---|---|---|
| high | Services deck kept all 6 ActiveFx GPU devices mounted (initial state `true`, sticky panels never stop intersecting) | Deck scroll progress drives an active±1 mount window; nothing mounts offscreen |
| medium | Services request form shipped a bare native `<select>` (missed in the Select migration) | Migrated to `shared/Select` |
| medium | NEW badge / index numeral overlap on the deck's Marketers panel | Badge pinned physically right (numeral is `dir="ltr"`, always physically left); verified live in AR + EN — note: the reported RTL overlap was partly the *first* fix attempt's regression; final state verified collision-free |
| medium | 2 of 3 blog cards advertised reading times but led to "coming soon" bodies | Index now shows "المقال قريباً" for body-less articles |
| low | Sector accordion `replaceState` dropped query string/hash (`?coarse`, utm) | Search + hash preserved |
| low | Fintech sector description was creative/design-industry copy | Rewritten as real fintech copy (AR+EN) — **verify against Figma when the bridge is up**; also feeds the landing sector cards |
| low | Forms show a success receipt but transmit nothing | NOT fixed — no backend exists (known baseline; see risks) |
Rejected as not-real after verification: IntersectionObserver `entries[0]`
idiom (no concrete failure), deck CTA clipping on landscape phones
(box math showed the CTA stays tappable).
Also fixed from the route sweep: sector pages marked "من نحن" active →
now "الرئيسية".

## 3. Deferred / pending items
- **Figma landing-variant diff (55:879 vs 5:962): DONE** (bridge
  restored 2026-07-16). Structural diff of both trees (282 nodes each,
  ids stripped, coords normalized): identical except ONE node — the
  partners marquee instance (5:962: Frame 41124876, 3013×130 strip;
  55:879: Frame 41124875, 1811×221 single-row variant). Screenshots
  confirm. No action taken: the client already commissioned a full
  marquee redesign (mono logo wall) that supersedes both variants.
- Fintech sector copy + authored FAQ answers + authored EN copy still
  need client sign-off (flagged in the per-screen handbacks).
- EN-mobile screenshot pass on marketers (left by its session).
- **Pixel screenshots were not retaken this session** — the Browser
  pane renderer freezes while occluded by other windows (documented by
  every screen session). All checks above are DOM/computed-style
  probes, which the occlusion does not affect.

## 4. Residual risks for the client
- **Forms are front-end only.** Landing contact, services request, and
  marketers apply all show success states without sending data
  anywhere. Wire a backend/endpoint (or a forms service) before launch.
- ~~Bundle size~~ Resolved: route + engine code-splitting shipped;
  initial JS ~63KB gzip.
- ~~WebGPU-less browsers lose the shader identity~~ Resolved
  (2026-07-16, commits ffb8bc8 + cc4ed7d): three render tiers now serve
  every device. `webgpu` = vendor engine (capable desktops, guarded by
  a render watchdog — the engine's silent init failures downgrade after
  4s and are remembered for 3 days); `webgl` = our GLSL ES 3.00 ports
  of all four scenes in `glScenes.tsx`/`glRuntime.tsx` (~9KB gzip; the
  DEFAULT on coarse-pointer devices, so all phones get real shaders
  instantly — WebGPU only exists on iOS 26+); `css` = animated brand
  gradients (`html.no-webgpu`) for relics without WebGL2. Debug:
  `?fx=webgpu|webgl|css` forces a tier, `?fxdead` exercises the
  watchdog, `?nogpu` = css; `<html data-gpu="mode:reason">` reports the
  decision. Verified in the prod build (`salesup-preview` launch config,
  port 4173): all five paths + light/dark + mobile, console clean.

## 5. Cleanup
Worktrees removed (`../salesup-worktrees/*`) and all seven `screen/*`
branches deleted after merge. Repo pushed to
https://github.com/HaithamAlduais/SalesUp-landing.git (master).
