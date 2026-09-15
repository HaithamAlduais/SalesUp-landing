/** Source-derived dependency of the real leaderboard. Source: packages/ui/src/components/section.tsx. */
import * as React from "react"

import { cn } from "./utils"

/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  ONE SECTION GRAMMAR — the answer to «it still look like a markdown file»  ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 *
 * THE OWNER, 2026-09-10, at a green tick beside «طلبات المسوّقين»: *«these
 * sections separators across all the app is bothering me, it still look like a
 * markdown file — fix them»*.
 *
 * He was right, and the tick was mine. The pass that put a medallion on the
 * three dashboards left every OTHER page's section heading as a text line with a
 * decoration in front of it — a 3px brand tick on five of them, a 2px one on the
 * twenty-six that call `SectionLabel`, and eleven further one-off `<h2>` recipes
 * besides. A rule or a tick in front of a heading is not a section; it is the
 * ornament a Markdown renderer puts there because it has nothing else to say.
 * Fourteen idioms for one thing is also why this could never be fixed in one
 * edit before. This is the one edit.
 *
 * ── WHAT MAKES A SECTION READ AS A SCREEN AND NOT A DOCUMENT ────────────────
 * A document heading is TEXT WITH SPACE AROUND IT: nothing binds it to what
 * follows, so the eye reads a stack of paragraphs. A screen's section has a NAME,
 * clear spacing, and — where there is one to give — a LINE saying what the block
 * answers. Section headings are text-only across the app. That is `SectionHead`, and it is a
 * drop-in for the `<h2>` it replaces: same place in the tree, same one child.
 *
 * `Section` is the stronger form, for when the content can live INSIDE the
 * name's own surface: the head becomes a band on a panel and there is no
 * floating heading on the page at all. Use it for a table, a list, or one block
 * of text. Do NOT use it over a grid of cards or a row of tiles — those carry
 * their own surfaces and a panel round them is a frame around frames, which is
 * what `HubSection` has refused since it was written.
 *
 * ⚠ A FRAMED SECTION STRIPS THE FRAME OFF A TABLE INSIDE IT. `TableScroll`
 * carries its own `rounded-xl border shadow-panel` and twenty-two of its
 * twenty-three call sites draw it bare on the page and NEED it. Inside this
 * panel that is a second edge 1px inside the first. The
 * `[&_[data-slot=table-scroll]]:…` rules take it off BY DESCENT, so neither
 * component knows about the other and no call site passes a flag.
 *
 * ⚠ EVERY PLACEMENT IS LOGICAL, NOT PHYSICAL. `justify-between` on a flex row,
 * `ring-inset`, `ps-`/`pe-` — nothing here names left or right, so the anatomy
 * mirrors under `dir="rtl"` for free. This product is Arabic first, and a
 * physical corner is how that quietly stops being true.
 */

export interface SectionHeadProps {
  /** put on the <h2>, so a card may be `aria-labelledby` its own head */
  id?: string
  title: React.ReactNode
  /** ONE line under the name saying what the block answers. Optional. */
  description?: React.ReactNode
  /** ONE control at the row's far side — a door, a filter, an export. */
  action?: React.ReactNode
  className?: string
}

export function SectionHead({
  id,
  title,
  description,
  action,
  className,
}: SectionHeadProps) {
  return (
    /* The title begins at the section edge. A decorative leading icon makes
       every heading look like an alert or an AI-generated status card. */
    <div className={cn("flex items-start justify-between gap-3", className)}>
      <div className="min-w-0">
        <h2 id={id} className="truncate text-[1.05rem] leading-6 font-semibold tracking-tight text-foreground">
          {title}
        </h2>
        {description ? (
          <p className="truncate text-[0.75rem] text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0 pt-0.5">{action}</div> : null}
    </div>
  )
}

export function Section({
  id,
  headId,
  testId,
  frame = false,
  bodyClassName,
  className,
  children,
  ...head
}: SectionHeadProps & {
  /** the anchor a door lands on — `#money`, `#recent-deals`, `#ledger` */
  id?: string
  /**
   * The HEAD's id — it names the region (`aria-labelledby`) as well as marking
   * the heading, so one prop does both. ⚠ It is NOT `SectionHeadProps.id`: this
   * function destructures `id` for the SECTION, so a head id passed there would
   * be eaten before `...head` ever sees it.
   */
  headId?: string
  /** what a walk script finds this block by — `data-testid` */
  testId?: string
  /** hold the content in the section's own panel, with the head as its band */
  frame?: boolean
  bodyClassName?: string
  children: React.ReactNode
}) {
  if (!frame)
    return (
      <section
        id={id}
        data-testid={testId}
        aria-labelledby={headId}
        className={cn("min-w-0 scroll-mt-16", className)}
      >
        <SectionHead {...head} id={headId} className="mb-3" />
        {/* ⚠ A SECTION WITH TWO BLOCKS NEEDS AIR BETWEEN THEM (owner,
            2026-08-12: «in money section, the divs are stuck to each other,
            there is no spacing»). `space-y` sets a top margin on every child
            AFTER the first, so a section rendering ONE child is untouched. */}
        <div className={cn("min-w-0 space-y-2.5", bodyClassName)}>{children}</div>
      </section>
    )

  return (
    <section
      id={id}
      data-testid={testId}
      aria-labelledby={headId}
      className={cn(
        "min-w-0 scroll-mt-16 overflow-hidden rounded-xl border border-border/70 bg-card shadow-panel",
        /* the double-frame strip — see the header */
        "[&_[data-slot=table-scroll]]:rounded-none [&_[data-slot=table-scroll]]:border-0 [&_[data-slot=table-scroll]]:shadow-none",
        className
      )}
    >
      <SectionHead
        {...head}
        id={headId}
        className="border-b border-border/70 bg-background px-4 py-3"
      />
      <div className={cn("min-w-0", bodyClassName)}>{children}</div>
    </section>
  )
}
