# Product UI provenance

The landing page promotes the SalesUp product, so its product previews use the real product's presentational components rather than an invented dashboard skin.

## Source snapshot

- Source checkout: `C:\Users\Public\dev\SalesUp`
- Source revision inspected: `960b42b6fd4d2381e528ce81725af2d4a5370988`
- Port date: 2026-09-15
- Portable destination: `src/components/product-ui/`
- The source checkout was read only. This port does not change the running product.

## Components copied

Paths below are relative to the source checkout.

| Landing file | Source | Preserved |
| --- | --- | --- |
| `primitives.tsx` | `apps/web/components/shared/primitives.tsx` | `Card`, `CardTitle`, `SectionLabel`, `Chip`, `Num`, `Bidi` element hierarchy, utility classes, tone variants and bidirectional isolation |
| `stat-door.tsx` | `apps/web/components/shared/stat-door.tsx` | Original statistic tile anatomy, sizing, three tones, label/value hierarchy, numeric isolation, delta, optional link and supporting figures |
| `stat-tile.tsx` | `apps/web/components/shared/stat-tile.tsx` | Original wrapper around `StatDoor` |
| `offer-stat-cards.tsx` | `apps/web/components/modules/products/offer-stat-cards.tsx` | Original pair/trio responsive statistic grid and numeric/caption typography |
| `product-card.tsx` | `apps/web/components/modules/products/offer-card.tsx`, `GridCard` renderer | Original square product tile, cover top third, company-logo seam, product/company title, commission, optional caption, category line, image failure fallbacks and utility classes |
| `pipeline-card.tsx` | `apps/web/components/modules/leads/pipeline-card.tsx` | Original compact CRM identity, bare value/commission, numeric added/expected-close dates, review state, initials and utility classes; title/caption copy comes directly from `packages/core/src/copy/leads.ts` |
| `affiliate-leaderboard.tsx` | `apps/web/components/modules/leaderboard/leaderboard-screen.tsx`, `AffiliateLeaderboard` | Original framed section, three-window segmented control, rank rows, current-agent highlight, champion chip, level badge and points/money/deals detail line |
| `section.tsx`, `level-badge.tsx`, `leaderboard-copy.ts` | `packages/ui/src/components/section.tsx`, `apps/web/components/shared/level-badge.tsx`, `packages/core/src/copy/leaderboard.ts` | Source dependencies for the leaderboard: exact section frames, numeric level badge and bilingual labels |
| `materials-card.tsx` | `apps/web/components/modules/products/materials/materials-tab.tsx`, `FileListCard` / `MaterialRow` / `FactsLine`; `apps/web/components/shared/creatives-rail.tsx`, `fileSize` | Original material file-list wrapper, file-row layout, icon mapping, metadata order and bidirectional isolation; no invented universal materials tab bar |
| `charts.tsx` | `apps/web/components/shared/charts.tsx` | Original pure SVG `Sparkline`, `BarSeries`, `LineBarChart`, plus `StackBar`, curve math, scales, accessibility labels and RTL-compatible geometry |
| `table-scroll.tsx` | `apps/web/components/shared/table-scroll.tsx` | Original table frame, header/cell alignment, numeric direction, row hover, small-screen row cards and `ResponsiveRows` breakpoint swap |
| `utils.ts` | `packages/ui/src/lib/utils.ts` | Original `cn` using `clsx` and `tailwind-merge` |

## Deliberate read-only adapters

- `next/link` becomes a native anchor. A preview with no destination omits the anchor; no fake route is introduced.
- The app-wide `useUiPrefs` dependency is replaced by a tiny locale-only `ProductUiProvider`. Authentication, account state, router state and live settings do not cross this boundary.
- `StatDoor` receives an optional `texture` React node instead of importing the product's `next/dynamic` shader loader. Without a texture, it retains the exact original brand fill. The port does not create its own GPU context.
- `ProductCard` accepts presentation-ready image URLs, reward text, category labels and optional status content. Product pricing, commission calculation and permissions are not reimplemented in the marketing site.
- The product tile's edit/upload branches, file input, upload state, API functions and router refresh are intentionally removed. Image loading/error fallbacks remain.
- `ProductCard.updatedLabel` is already formatted. The product's API-dependent formatting and relative-date plumbing are not imported.
- `PipelineCard` receives formatted demonstration values and dates. Drag cues, stage menus, contact controls, review mutations, contract requests and release actions are omitted; the data/body does not pretend to be a working CRM. Its original presentation hierarchy is unchanged. The original optional contact row is absent, matching the product's no-`onTouch` rendering case.
- `AffiliateLeaderboard` receives a separate demonstration payload for each of the original month/year/all windows. Its real URL links become local buttons selecting those payloads. Points, level, rank, badge and current-agent semantics are preserved; money and the counted deal label are formatted by the caller. No authenticated rankings are copied.
- `MaterialsCard` preserves the source's deliberately untitled file list. Rows take explicit file metadata; optional links must be real public asset URLs. No signed URL reads, product menus, upload/select/drag controls, or mutations are carried over. A row without a real URL is text, not a fake file-opening action.
- Unused product primitives with locale/count/router dependencies are not copied. The table components, original SVG chart engine and stat-grid renderer remain pure presentation.
- All displayed preview rows and figures must be clearly identified as demonstration data. Do not publish customer names, live amounts or authenticated product records.

The dependencies added for these original components are `lucide-react`, `clsx` and `tailwind-merge`. React was already present. There is no Next.js, Supabase or application-session dependency in this directory.

## Styling boundary

The source uses Tailwind v4 utility classes. Keep those original classes and generate their utilities in an isolated product-preview stylesheet. Do not load the product's global preflight into the marketing shell.

The actual source visual system is defined by:

- `packages/ui/src/tokens/tokens.json`: token authority.
- `packages/ui/src/tokens/generated/web/tokens.css`: generated light/dark properties and theme mapping.
- `packages/ui/src/styles/globals.css`: elevation tokens, layout/touch rules and Arabic font selection.
- `apps/web/app/globals.css`: 15px product body size.
- `apps/web/app/layout.tsx`: Inter, IBM Plex Sans Arabic (400/500/600/700), Geist Mono.

Use the real product's neutral page ground, white or charcoal cards and green accent. Dark green glass panels, glowing bar charts and fictional profit totals are not the source UI.

## Product language and money meaning

`packages/core/src/copy/voice.ts` is the product's vocabulary authority. In particular: `المنتجات`, `إدارة العملاء`, `لوحة الصدارة`, and `مسوّق` name the actual product concepts. Agent billing is `العمولات`; company billing is `الفوترة`.

The actual agent dashboard (`apps/web/components/modules/dashboard/affiliate-dashboard.tsx`) labels paid lifetime money `عمولاتي`, money not yet transferred `تحت الإجراء`, held amounts `موقوفة` only when a hold exists, and joined count `منتجات انضممت لها`. A preview must not relabel paid money as every accrued commission or imply an invented growth percentage.

## Validation

The portable kit typechecks in the landing project. Integration, scoped styling, responsive layouts and live browser verification are performed by the landing-page implementation, outside this read-only port.
