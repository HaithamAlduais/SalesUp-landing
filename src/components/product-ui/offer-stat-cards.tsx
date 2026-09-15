/**
 * SalesUp product UI — vendored read-only from the real product.
 * Source: apps/web/components/modules/products/offer-stat-cards.tsx
 * See docs/PRODUCT_UI_PROVENANCE.md for the adapter boundary.
 */
"use client"

import { cn } from "./utils"

import { Num } from "./primitives"

/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  M5 · THE STAT CARD SLOTS — the owner's figures, as a SHAPE (§4 · §5)     ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 *
 * §4 puts three cards on the brand's offers list: money earned so far · money
 * SalesUp is asking for · total clicks. §5 gives the affiliate her own three
 * on Joined and a motivating PAIR on Available. This component is those cards'
 * GEOMETRY — equal columns, one label, one figure — and deliberately not their
 * numbers:
 *
 * THE VALUES ARRIVE AS PROPS, ALWAYS. The money and click reads belong to the
 * analytics seam, which `check:boundaries` R1 forbids this module importing —
 * the same wall the W6 strip respected. So the PAGE reads (or, today, does
 * not read) and hands the figures in; this component cannot disagree with the
 * database because it cannot ask it anything.
 *
 * TODAY'S VALUES ARE ZEROS AND TODAY THEY ARE TRUE: the accounts were purged
 * (owner, 2026-08-11) and no click or riyal exists yet. The analytics wiring
 * is M2-adjacent and recorded in M5_HANDOVER.md — when it lands, only the
 * pages change.
 *
 * `<Num>` wraps every figure so Latin digits stay LTR inside the Arabic page,
 * the same discipline every KPI surface keeps.
 *
 * ── EVERY MONEY CARD MUST BE ABLE TO EXPLAIN ITSELF (feedback 609fa6b1) ─────
 * A tester read the brand's two money cards and could not tell whether the
 * figure was profit or a bill — a fair question, because a bare label and a
 * riyal amount say nothing about which direction the money is travelling. The
 * §4 copy diet answered it with a `?`; W6-helpdots answers it with `caption`,
 * which is the same sentence with nothing between it and the reader.
 *
 * ⚠ W6-helpdots · `help` IS GONE FROM THIS SHAPE. By the time this order ran no
 * caller passed one — the agent's `ProgramSummary` builds three cards and gives
 * the Commission card a visible `caption` instead — so the field was an empty
 * slot on the component that draws Figma's own summary row, which carries no
 * `?` on any frame. A card here is a label, a number and, when the number needs
 * one, a line under it that is READ rather than found.
 */
export interface OfferStatCard {
  key: string
  label: string
  value: string
  /**
   * ── A1 · ONE QUIET LINE UNDER THE FIGURE (report 77b07acb) ────────────────
   *
   * The agent's Commission card prints her share and captions it with the
   * PRICE, because a percentage means nothing until you know what it is a
   * percentage of — report 7c23c5ee's finding, carried whole out of the facts
   * grid this road deleted.
   *
   * OPTIONAL: a card without one renders exactly as it always did, so nothing
   * on the brand's or the operator's strips moves.
   */
  caption?: string
}

export function OfferStatCards({
  cards,
  className,
}: {
  cards: OfferStatCard[]
  className?: string
}) {
  if (cards.length === 0) return null
  return (
    <div
      className={cn(
        "grid min-w-0 gap-2",
        // a PAIR sits two-up even on a phone; a TRIO stacks at 375 and rows
        // from `sm` — three 125px columns would wrap every label
        cards.length === 2 ? "grid-cols-2" : "grid-cols-1 sm:grid-cols-3",
        className
      )}
    >
      {cards.map((card) => (
        <div
          key={card.key}
          className="flex min-w-0 flex-col gap-0.5 rounded-xl border border-border/70 bg-card p-3 shadow-panel"
        >
          <span className="flex min-w-0 items-center gap-1 text-[0.7rem] text-muted-foreground">
            <span className="truncate">{card.label}</span>
          </span>
          <span className="text-base font-semibold text-foreground">
            <Num>{card.value}</Num>
          </span>
          {card.caption && (
            <span className="truncate text-[0.68rem] text-muted-foreground">
              <Num>{card.caption}</Num>
            </span>
          )}
        </div>
      ))}
    </div>
  )
}


