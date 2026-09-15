/**
 * SalesUp product UI — vendored read-only from the real product.
 * Source: apps/web/components/shared/stat-door.tsx
 * See docs/PRODUCT_UI_PROVENANCE.md for the adapter boundary.
 */
"use client"

import type * as React from "react"
import { TrendingDown, TrendingUp } from "lucide-react"

import { cn } from "./utils"

import { useUiPrefs } from "./locale"
import { p } from "./locale"

import { Chip, Num } from "./primitives"

/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  rule-numbers-are-doors — THE primitive that makes the rule uncheatable    ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 *
 * `href` names the screen that owns a number, and every brief figure, KPI and
 * count goes through here so the rule is enforced in one place rather than
 * reviewed in a hundred.
 *
 * IT BECAME OPTIONAL ON 2026-08-07, and the rule survived the change. The
 * per-offer dashboard is a LEAF — the owner's words for it were "nothing here,
 * nothing to see actually" — so its tiles have nowhere deeper to go, and the
 * old contract forced them to link to the page the reader was already standing
 * on. A door onto yourself is not a door; it is a dead link that satisfies a
 * type. Omitting `href` now renders the same tile without the link, without the
 * hover affordance that promises one, and `data-figure` still marks it — so the
 * external audit can enumerate every figure and assert a landing only for the
 * ones that CLAIM a door.
 *
 * The whole tile is the target (not just the digits): at 375 px a number is a
 * small tap area, and the label is part of what you are aiming at.
 *
 * Numerals sit in `dir="ltr"` `tabular-nums` so an Arabic layout shows
 * `$96.00` and `12,480` unmirrored and vertically aligned across rows.
 *
 * GATE 6 promoted this out of `components/modules/dashboard/` (R1 forbids analytics
 * importing home's components) and added two props the analytics hubs need:
 *
 * ⚠ `window` IS GONE (owner, 2026-09-10: «no need for that, remove them»), and
 *   what it was for is worth keeping in words. rule-analytics-is-numbers has a
 *   twin obligation — a figure must say WHICH WINDOW it measures — and the
 *   operator's KPI strip really does put a month-to-date figure beside a
 *   right-now one. The caption was what stopped that row reading as one span.
 *   It is the OWNER'S call that the noise cost more than the ambiguity; if the
 *   ambiguity ever bites, the honest place for the answer is the section head's
 *   `description`, said ONCE for the row, not eight times under it.
 *   `sub`    — the one supporting figure a tile may carry (B8's Spend tile shows
 *              the platform fee underneath). Still ONE chip, still one door.
 */

export interface StatDelta {
  value: string
  trend: "up" | "down" | "flat"
}

export function StatDoor({
  label,
  value,
  href,
  delta,
  chip,
  sub,
  lines,
  tone = "default",
  icon,
  figureId,
  texture,
  className,
}: {
  label: string
  value: string
  /**
   * The screen that owns this number. OPTIONAL since 2026-08-07: a tile on a
   * LEAF dashboard has nowhere deeper to go — the per-offer dashboard is the
   * bottom of the tree ("nothing here, nothing to see actually") — and a link
   * back to the page you are standing on is a dead door, not a door. Omitted,
   * the tile renders as a plain figure with identical chrome; `data-figure`
   * still marks it, and only tiles that CLAIM a door are asserted to land one.
   */
  href?: string
  delta?: StatDelta
  chip?: string
  /** ONE supporting figure, already formatted (e.g. «fee $50.00») */
  sub?: string
  /**
   * FURTHER value lines of the SAME rank as `value` — one per currency on the
   * org money tiles (v2m1: mixed currencies never merge, so a consolidated tile
   * renders one line per currency instead of one summed number). Not a `sub`:
   * a second currency is not a supporting figure, it is a peer.
   */
  lines?: string[]
  /**
   * ── `helpGutter` IS GONE (W6-helpdots) ─────────────────────────────────────
   * It existed for exactly one reason: `StatTile` floated a HelpDot at the
   * tile's top inline-end, and the gutter kept the label from sliding under it
   * (`pe-7` on the LABEL, never on the box — 28 px off the figure four lines
   * below is what once broke «-SAR 1,266.74» after its MINUS SIGN and printed a
   * loss as a dash above a positive-looking number; report 9633eab6). This road
   * deleted `StatTile.help` and every one of its call sites, so the prop had no
   * dot to make room for and no caller left. A slot nobody wants is a way back
   * in, not a budget line — the same reasoning that took `PictureCard.help`,
   * `ScreenHeader.help`, `OfferStatCard.help` and `KanbanBoard.noteHelp`. The
   * measurement above is kept in words so a future dot cannot re-learn it the
   * hard way. Mirrored in `apps/mobile/src/components/shared/stat-door.tsx`.
   */
  /**
   * ── THE ONE FIGURE THAT MAY REFUSE THE ORDINARY INK (2026-08-21) ───────────
   * The operator's home prints a SalesUp margin that this product refuses to
   * hide, and on a loss-making window it read «-SAR 1,266.74» in the same black
   * as every other number on the screen — a fact the page stated and the eye
   * walked past. `attention` draws the value in the destructive ink and gives
   * the tile a warmed edge.
   *
   * IT IS THE CALL SITE'S DECISION, never this component's. A tile does not
   * know whether its own minus sign is bad news — a negative REFUND is good
   * news — and sniffing the formatted string for a "-" would also have to be
   * right about Arabic digits and every currency prefix. The one screen that
   * knows says so; everything else stays `default`.
   */
  /**
   * `brand` fills ONE tile per face with the product green and inverts its
   * ink, so a grid of equals gets a first sentence. Tokens only, so it follows
   * dark mode; `primary-foreground` is near-black because white on #04CB79 is
   * 2.14:1 and prohibited (Order #16). ⚠ One per face, or there is no lead.
   */
  tone?: "default" | "attention" | "brand"
  /**
   * A landmark for recognition on RETURN, on the LABEL line so nothing
   * competes with the figure. ⚠ An ELEMENT (`icon={<Wallet />}`), never a
   * component reference: most callers are SERVER components and a function
   * cannot cross that boundary — «Only plain objects can be passed to Client
   * Components». The tile sizes and inks it from here; lucide strokes with
   * `currentColor`, so the colour is inherited, not passed.
   * ⚠ REVERSES the standing «our StatTile, no icon tiles» verdict
   * (FIGMA_ALIGNMENT_2026-08-22), on the owner's 2026-09-09 mockup.
   */
  icon?: React.ReactNode
  /**
   * The figure's stable id, emitted as `data-figure`. It exists so that
   * "every number is a door" can be AUDITED FROM OUTSIDE the app: a
   * verification script enumerates `[data-figure]`, reads each one's `href`
   * and asserts it lands — which is a claim no amount of internal typing can
   * make on its own. Presentation is unaffected.
   */
  figureId?: string
  /** Optional existing landing shader; never opens a product API or GPU context itself. */
  texture?: React.ReactNode
  className?: string
}) {
  const { locale } = useUiPrefs()
  const Trend = delta?.trend === "down" ? TrendingDown : TrendingUp

  // `next/link` types `href` as required, so the two cases are rendered
  // explicitly rather than through one dynamic tag: a cast would buy brevity by
  // giving up the very check this component exists to enforce.
  /**
   * ── THE TILE, REDRAWN TWICE ────────────────────────────────────────────────
   * Report 9633eab6 («we do not like how the screen LOOKS») fixed three things,
   * all of them the same mistake — no contrast anywhere: the tile painted itself
   * `bg-background` ON the page's own colour, so a grid of figures read as a
   * wireframe of empty rectangles; the figure was `text-lg` over a 0.7rem label,
   * a ratio of 1.6, which is two sizes of small and not a hierarchy; and hover
   * repainted the whole box grey, which on a grid of doors flickers a block on
   * and off. `bg-card`, a 1.375rem value and an EDGE that takes the brand green
   * answered all three.
   *
   * ⚠ AND THE «NO SHADOW, deliberately» CLAUSE THAT FOLLOWED IS DEAD (2026-09-10)
   * — both halves of it. `--border`'s comment no longer carries that rule, and
   * the tile wears `shadow-panel`, the ONE elevation scale every surface in the
   * product now reads. The owner's ruling is quoted at the scale itself.
   */
  /* One place decides the ink, so a new tone is one line here and not five
     ternaries down the body. */
  const brand = tone === "brand"
  const inkLabel = brand ? "text-primary-foreground/85" : "text-muted-foreground"
  const inkValue =
    tone === "attention" ? "text-destructive" : brand ? "text-primary-foreground" : "text-foreground"
  const inkSub = brand ? "text-primary-foreground/80" : "text-muted-foreground"
  const boxClass = cn(
    /* ⚠ `justify-center` AND A SHORTER FLOOR, because the caption row left
       (owner, 2026-09-10). `justify-between` over a 4.9rem floor was right when
       there were THREE rows to spread — label, figure, unit. With two it pushed
       the figure to the bottom edge and left a band of nothing under the label,
       which is the shape of a card that lost something rather than one designed
       without it. The floor is what keeps a row of tiles level. */
    "group flex min-h-[4.35rem] min-w-0 flex-col justify-center gap-1 rounded-xl border border-border/70 bg-card p-3.5 shadow-panel",
    /* ⚠ NOT `transition-colors` — it answers on shadow and position too. */
    "outline-none transition-[color,background-color,border-color,box-shadow,transform] duration-200",
    tone === "attention" && "border-destructive/35 bg-destructive/[0.03]",
    /* keeps the 1px edge the grid shares, or this tile sits 2px short.
       `relative isolate overflow-hidden` is what lets the skin below paint over
       the fill and under the figure. */
    brand && "relative isolate overflow-hidden border-primary bg-primary text-primary-foreground shadow-brand",
    href &&
      (brand
        ? /* a filled tile has no edge left to answer with, so ink deepens */
          "hover:-translate-y-px hover:bg-primary/92 focus-visible:ring-2 focus-visible:ring-ring"
        : "hover:-translate-y-px hover:border-primary/45 hover:shadow-panel-hover focus-visible:ring-2 focus-visible:ring-ring"),
    className
  )
  const ariaLabel = p(
    locale,
    `${label}: ${[value, ...(lines ?? [])].join(", ")}`,
    `${label}: ${[value, ...(lines ?? [])].join("، ")}`
  )

  const body = (
    <>
      {/* ── THE ONE TEXTURED SURFACE ON A PAGE OF FIGURES (owner, 2026-09-10:
             «make all cards look prettier, use shaders like this») ──────────
          It rides the BRAND tile and nowhere else, for the reason written at
          `shader-skin.tsx`: each canvas is a live GPU context, and moving light
          under tabular Arabic costs the figure its legibility. The filled tile
          is the one card on the face that carries no competing detail, so it is
          where a texture is a gift rather than a tax. `soft-light` keeps the
          green the token green — the noise moves the LIGHT, not the hue. */}
      {brand && texture}
      {/* The icon PAIRS with the label — the two are one object at the tile's
          start, not a label and a mark at opposite edges. `min-w-0` on the
          label ellipsizes a long Arabic string instead of shoving the icon
          out of the tile. */}
      <span className="flex items-center gap-1.5">
        <span
          className={cn(
            "min-w-0 truncate text-[0.7rem] font-medium tracking-[0.01em]",
            inkLabel
          )}
        >
          {label}
        </span>
        {icon && (
          <span
            className={cn(
              "inline-flex shrink-0 items-center [&>svg]:size-3.5",
              brand
                ? "text-primary-foreground/75"
                : "text-muted-foreground"
            )}
            aria-hidden
          >
            {icon}
          </span>
        )}
      </span>
      <span className="flex items-end justify-between gap-1.5">
        {/* ⚠ 1.2rem BELOW `sm`, AND THAT NUMBER IS MEASURED, NOT TASTE. At 390 px
            these tiles sit two to a row, which leaves 151 px of inner width; a
            tabular figure runs about 0.6 em per glyph, so «-SAR 1,266.74» — the
            longest thing this screen prints, thirteen glyphs — needs the type
            at or under 19.4 px. Set flat at 1.375 rem it wrapped, and what
            wrapped was the MINUS SIGN onto a line of its own: a loss printed as
            a dash above a positive-looking number. No `whitespace-nowrap` on
            top of it: if some future value is longer still, wrapping is ugly
            and clipping is a lie. */}
        <Num
          className={cn(
            "text-[1.2rem] leading-none font-semibold tracking-tight sm:text-[1.375rem]",
            inkValue
          )}
        >
          {value}
        </Num>
        {delta && (
          <span
            dir="ltr"
            className={cn(
              "inline-flex items-center gap-0.5 text-[0.7rem] font-medium tabular-nums",
              delta.trend === "up"
                ? "text-primary"
                : delta.trend === "down"
                  ? "text-destructive"
                  : "text-muted-foreground"
            )}
          >
            {delta.trend !== "flat" && <Trend className="size-3" aria-hidden />}
            {delta.value}
          </span>
        )}
      </span>
      {/* peer value lines — one per additional currency, same rank as `value` */}
      {lines?.map((line) => (
        <Num
          key={line}
          className={cn(
            "text-[1.2rem] leading-tight font-semibold tracking-tight sm:text-[1.375rem]",
            inkValue
          )}
        >
          {line}
        </Num>
      ))}
      {sub && (
        <Num className={cn("text-[0.7rem] leading-snug", inkSub)}>{sub}</Num>
      )}
      {/* ONE chip, never two — rule-simplicity. */}
      {chip && <Chip className="mt-0.5 self-start">{chip}</Chip>}
    </>
  )

  if (!href) {
    return (
      <div data-figure={figureId} className={boxClass} aria-label={ariaLabel}>
        {body}
      </div>
    )
  }

  return (
    <a
      href={href}
      data-figure={figureId}
      className={boxClass}
      aria-label={ariaLabel}
    >
      {body}
    </a>
  )
}


