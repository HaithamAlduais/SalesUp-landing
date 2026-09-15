/**
 * SalesUp product UI — vendored read-only from the real product.
 * Source: apps/web/components/shared/table-scroll.tsx
 * See docs/PRODUCT_UI_PROVENANCE.md for the adapter boundary.
 */
"use client"

import * as React from "react"

import { cn } from "./utils"

/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  TABLES THAT CANNOT BREAK THE PHONE — rule-phone-first                     ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 *
 * Two rules, both enforced by the components rather than by reviewer memory:
 *
 *  1  A WIDE TABLE SCROLLS INSIDE ITS OWN BOX. `TableScroll` owns the
 *     `overflow-x-auto`, so a seven-column ledger can never widen the page. The
 *     v1 money screen is the counter-example this exists to prevent: at 375 px
 *     its invoice table pushed the body sideways and left `Pay (TEST)` — the one
 *     control that mattered — unreachable off the right edge.
 *
 *  2  BELOW `sm` A ROW IS A CARD. `ResponsiveRows` renders the card list and the
 *     table from the SAME data and swaps them with CSS breakpoints only. No
 *     `window.innerWidth`, no resize listener, no `useEffect` — so the server
 *     paint and the client paint are identical and there is no hydration flash.
 *     The cost is that both forms exist in the DOM; the benefit is that neither
 *     can silently drift from the other, because the caller writes them side by
 *     side in one place.
 *
 * Cells stay bilingual-safe: `Num`-style figures are the caller's job, but `Td`
 * accepts `numeric` to pin a column to `dir="ltr" tabular-nums` so a money
 * column still aligns in an Arabic layout.
 *
 * ── A NUMERIC COLUMN IS PHYSICALLY RIGHT-ALIGNED, HEADER AND BODY ALIKE ─────
 * (report 4a543ebc — «as you see the names of columns arent in thier correct
 * places».) `Td numeric` pins itself to `dir="ltr"` and then asks for `text-end`,
 * which inside that pin means the RIGHT edge. `Th numeric` carried the same
 * `text-end` with NO pin, so it inherited the page's `dir="rtl"` and `text-end`
 * meant the LEFT edge — the header and its own values walked to OPPOSITE ends of
 * the same column. On the Arabic admin tables that is «العمولة» sitting a
 * hundred-odd pixels away from every figure beneath it, and «البرامج» /
 * «المسوّقون» reading over the wrong numbers on the companies list.
 *
 * It was invisible in English, where `rtl` never applies and both ends were the
 * same end — which is exactly why it survived: the defect only exists in the
 * locale the product is actually used in.
 *
 * So a numeric column now states a PHYSICAL edge (`text-right`) in both cells.
 * That is the same edge `text-end` already resolved to inside the body's LTR
 * pin, so nothing moves in either locale except the header, which finally lands
 * over its own figures. Non-numeric columns keep `text-start` — a label column
 * must follow the reading direction, and both cells inherit the same one.
 */

export function TableScroll({
  children,
  className,
  label,
  maxHeight,
}: {
  children: React.ReactNode
  className?: string
  /** the table's accessible name — a table with no name is a wall of numbers */
  label: string
  /**
   * ── REPORT 07693000 · «this should be a table can be scrolled» ────────────
   * A CSS length. Set it and the box scrolls VERTICALLY as well as sideways,
   * and the header row sticks to the top of that box so a reader ten rows down
   * still knows which column is the amount.
   *
   * WHY IT IS OPT-IN. Rule 1 above is about a wide table never widening the
   * PAGE; this is a different question — how tall a LONG table is allowed to
   * grow inside a screen that has other things under it. Most of this
   * product's tables are the last thing on their page and should simply be as
   * tall as they are; the ones that sit mid-page, above money tiles and a
   * chart, are the ones that need a ceiling. So the caller decides, and
   * nothing changes for a table that does not ask.
   */
  maxHeight?: string
}) {
  return (
    /* ⚠ `px-1` IS GONE AND `-mx-1` MUST NOT FOLLOW IT BACK: the ring gutter is
       `px-4` on the cells, and that margin gave the DOCUMENT 4px of sideways
       scroll at 768 and at 1280 (measured, /admin/offers). */
    <div
      /* the handle a framed `Section` strips this edge by, so neither component
         has to know about the other and no call site passes a flag */
      data-slot="table-scroll"
      className={cn(
        // ⚠ THE FRAME IS THE POINT (owner: «tables in the app needs to look the
        // same everywhere as ui»). Twenty-two of twenty-three sites drew it BARE.
        "su-scroll overflow-x-auto rounded-xl border border-border/70 bg-card shadow-panel",
        maxHeight && "overflow-y-auto",
        className
      )}
      style={maxHeight ? { maxHeight } : undefined}
    >
      <table
        className={cn(
          "w-full min-w-[32rem] border-collapse text-sm",
          // The sticky header needs a painted background of its own, or the
          // rows scroll THROUGH it. `Th` paints it unconditionally now (see the
          // band there), so this rule only has to make the cells STICK.
          maxHeight && "[&_thead_th]:sticky [&_thead_th]:top-0 [&_thead_th]:z-10"
        )}
      >
        <caption className="sr-only">{label}</caption>
        {children}
      </table>
    </div>
  )
}

export function Th({
  children,
  className,
  numeric = false,
  scope = "col",
}: {
  children: React.ReactNode
  className?: string
  numeric?: boolean
  scope?: "col" | "row"
}) {
  return (
    <th
      scope={scope}
      className={cn(
        // THE HEADER BAND — at `px-2 py-1.5`/0.7rem this was a caption. ⚠ NOT
        // `bg-muted`, a 2.68 % wash: --background IS the page ground, so in a
        // card it reads as a band. ⚠ No uppercase/tracking — Arabic has none.
        "border-b border-border/70 bg-background px-4 py-2.5 text-[0.76rem] font-semibold whitespace-nowrap text-muted-foreground",
        // `text-right`, NOT `text-end` — see the numeric-column note above.
        numeric ? "text-right" : "text-start",
        className
      )}
    >
      {children}
    </th>
  )
}

export function Td({
  children,
  className,
  numeric = false,
  muted = false,
  colSpan,
}: {
  children: React.ReactNode
  className?: string
  numeric?: boolean
  muted?: boolean
  colSpan?: number
}) {
  return (
    <td
      colSpan={colSpan}
      dir={numeric ? "ltr" : undefined}
      className={cn(
        "border-b border-border/50 px-4 py-3 align-middle",
        // Same physical edge the header now states. Under the `dir="ltr"` pin
        // this is where `text-end` already put it, so no figure moves.
        numeric ? "text-right tabular-nums" : "text-start",
        muted && "text-muted-foreground",
        className
      )}
    >
      {children}
    </td>
  )
}

export function Tr({
  children,
  className,
  ...rest
}: React.ComponentProps<"tr">) {
  return (
    <tr
      /* the transition is what makes a row highlight rather than FLICKER; the
         last row drops its rule so the frame's own edge is the table's end */
      className={cn("transition-colors last:[&>td]:border-0 hover:bg-accent/70", className)}
      {...rest}
    >
      {children}
    </tr>
  )
}

/**
 * The phone form of one row: a stacked card whose whole surface can be a door.
 *
 * `bg-card`, NOT `bg-background` (report 9633eab6, second round). This design
 * system paints the PAGE `#fdfdfd` and a CARD `#ffffff`, and this component was
 * painting itself the page colour — so on a phone, where these ARE the table,
 * every row was an outlined rectangle of nothing sitting on the paper it was
 * supposed to be raised off. Same one-token miss the stat tile had, same fix.
 */
export function RowCard({
  children,
  className,
  ...rest
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("rounded-xl border bg-card p-2.5 text-sm shadow-panel", className)}
      {...rest}
    >
      {children}
    </div>
  )
}

/** One `label · value` line inside a `RowCard`. */
export function RowCardLine({
  label,
  children,
  numeric = false,
}: {
  label: string
  children: React.ReactNode
  numeric?: boolean
}) {
  return (
    <div className="flex items-baseline justify-between gap-2 py-0.5">
      <span className="text-[0.7rem] text-muted-foreground">{label}</span>
      <span
        dir={numeric ? "ltr" : undefined}
        className={cn("text-[0.8rem]", numeric && "tabular-nums")}
      >
        {children}
      </span>
    </div>
  )
}

/**
 * The breakpoint swap. `cards` below `sm`, `table` from `sm` up — the same rows,
 * written once by the caller, rendered in the idiom the viewport can carry.
 */
export function ResponsiveRows({
  cards,
  table,
  className,
  before,
  maxHeight,
}: {
  cards: React.ReactNode
  table: React.ReactNode
  className?: string
  /**
   * REPORT 07693000 · a toolbar row above BOTH forms — an export button, a
   * count. It sits outside the scroll box on purpose: a control that scrolls
   * away with the rows is a control a reader has to hunt for.
   */
  before?: React.ReactNode
  /**
   * REPORT 07693000 · the height ceiling, applied to BOTH forms. The phone gets
   * it too, and that is the half that would have been forgotten: below `sm`
   * these rows ARE the table, so a card list that grows without bound is the
   * same defect the tester photographed, wearing the other layout.
   */
  maxHeight?: string
}) {
  return (
    <div className={cn("min-w-0", className)}>
      {before}
      <div
        className={cn("space-y-2 sm:hidden", maxHeight && "su-scroll overflow-y-auto")}
        style={maxHeight ? { maxHeight } : undefined}
      >
        {cards}
      </div>
      <div className="hidden sm:block">{table}</div>
    </div>
  )
}


