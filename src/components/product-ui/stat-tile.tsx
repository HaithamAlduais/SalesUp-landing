/**
 * SalesUp product UI — vendored read-only from the real product.
 * Source: apps/web/components/shared/stat-tile.tsx
 * See docs/PRODUCT_UI_PROVENANCE.md for the adapter boundary.
 */
import * as React from "react"

import { cn } from "./utils"

import { StatDoor } from "./stat-door"

/**
 * StatTile — a StatDoor, and nothing else.
 *
 * PROMOTED FROM THREE IDENTICAL LOCAL COPIES (the anti-duplication rule §1.8 of
 * the simplification order working exactly as written): W6 forked it twice —
 * the brand offers-landing strip and the analytics account strip — and W4's
 * admin queue-strip forked it a third time while formally requesting this
 * promotion instead of silently forking a fourth. This is that request landed,
 * by the hub, as the serialized shared change the ownership matrix prescribes.
 *
 * ⚠ W6-helpdots · THE `help` SLOT IS GONE, AND ON PURPOSE IT CANNOT COME BACK.
 * This was the widest fan-out of the `?` in the product: one optional prop on
 * the one tile every dashboard uses, which is how a copy diet that "moved
 * paragraphs one hover away" ended with a dot on nearly every figure. Figma's
 * card is a label and a number; so is this one. A tile that genuinely needs a
 * sentence gets a `caption` under the figure or an empty-state line beside the
 * grid — visible text, which a reader who never hovers still reads. Restoring
 * the slot means restoring its call sites with it; see
 * `docs/roadmap/REMOVED_FEATURES.md` ## 80.
 *
 * The wrapper stays `relative min-w-0` so a long label can never blow the grid
 * column open — that was never the dot's doing.
 */
export function StatTile({ className, ...door }: React.ComponentProps<typeof StatDoor>) {
  return (
    <div className="relative min-w-0">
      <StatDoor {...door} className={cn("h-full", className)} />
    </div>
  )
}


