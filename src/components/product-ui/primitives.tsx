/**
 * SalesUp product UI — vendored read-only from the real product.
 * Source: apps/web/components/shared/primitives.tsx
 * See docs/PRODUCT_UI_PROVENANCE.md for the adapter boundary.
 */
import * as React from "react"
import { cn } from "./utils"

export function Card({
  className,
  tone = "default",
  children,
  ...props
}: React.ComponentProps<"section"> & {
  tone?: "default" | "attention" | "muted"
}) {
  return (
    <section
      className={cn(
        "rounded-xl border border-border/70 bg-card p-3 shadow-panel sm:p-4",
        tone === "attention" && "border-primary/35 bg-primary/[0.045]",
        tone === "muted" && "border-transparent bg-muted/60 shadow-none",
        className
      )}
      {...props}
    >
      {children}
    </section>
  )
}

export function CardTitle({
  children,
  className,
  end,
}: {
  children: React.ReactNode
  className?: string
  end?: React.ReactNode
}) {
  return (
    <div className={cn("flex items-center justify-between gap-2", className)}>
      {/* at plain `text-sm` a title sat at the body's own step */}
      <h3 className="text-[0.9rem] font-semibold tracking-tight text-foreground">{children}</h3>
      {end}
    </div>
  )
}

/** A section heading in a panel. ⚠ no uppercase/tracking — Arabic has neither
 *  (section-label/contract.ts); the brand tick replaces them. */
export function SectionLabel({
  children,
  end,
  className,
}: {
  children: React.ReactNode
  end?: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-2 px-1 pt-4 pb-2",
        className
      )}
    >
      {/* ⚠ THE TICK IS GONE, AND SO IS THIS COMPONENT'S SECOND JOB (owner,
          2026-09-10: «these sections separators across all the app is bothering
          me, it still look like a markdown file»). Twenty-eight of its
          thirty-eight call sites were naming a PAGE SECTION, and a 2px brand
          tick in front of a word is precisely the ornament a Markdown renderer
          reaches for. Those twenty-eight moved to `SectionHead`, which has a
          sign, a name and a line under it. What is left here is what this was
          always good at and what its own doc line says: a small label over a
          FORM FIELD or a list group — nine call sites — and a label over a
          field has never needed a decoration to be understood. */}
      <span className="min-w-0 truncate text-[0.72rem] font-semibold text-muted-foreground">
        {children}
      </span>
      {end}
    </div>
  )
}

/**
 * ONE chip. rule-simplicity caps what a row may wear: a bubble shows at most one
 * chip, a figure at most one. The cap is enforced by the callers, and this
 * component stays deliberately plain so nobody is tempted to stack variants.
 *
 * It forwards the REST of the span's own props, which matters for two reasons a
 * closed prop list got wrong: a numeric chip needs an `aria-label`, because "5"
 * on its own tells a screen reader nothing about what five means; and `data-*`
 * hooks silently VANISHED before — TypeScript permits unknown hyphenated JSX
 * attributes on a component, so `data-unread={n}` type-checked, rendered
 * nothing, and made a passing probe look like a failing feature.
 */
export function Chip({
  children,
  tone = "muted",
  className,
  ...rest
}: React.ComponentProps<"span"> & {
  tone?: "muted" | "primary" | "warn"
}) {
  return (
    <span
      {...rest}
      className={cn(
        "inline-flex h-5 shrink-0 items-center whitespace-nowrap rounded-full px-1.5 text-[0.68rem] font-medium",
        tone === "muted" && "bg-muted text-muted-foreground",
        tone === "primary" && "bg-primary/12 text-primary",
        tone === "warn" && "bg-destructive/10 text-destructive",
        className
      )}
    >
      {children}
    </span>
  )
}

/**
 * Numerals, durations and money stay LTR even in an RTL layout — an Arabic
 * paragraph must not reorder "12:04" or "$96.00". `tabular-nums` is what makes
 * a column of figures line up across rows.
 */
export function Num({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <span dir="ltr" className={cn("tabular-nums", className)}>
      {children}
    </span>
  )
}

/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  A VALUE THE PRODUCT DID NOT WRITE, SET INSIDE A SENTENCE IT DID          ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 *
 * `Num` above isolates a FIGURE and forces it LTR. This isolates a value whose
 * direction is not known in advance — an offer name, a brand name, a handle, an
 * e-mail, a slug, a URL — and lets the value's own first strong character decide
 * which way it reads. That is the difference between `dir="ltr"` and
 * `dir="auto"`, and it is why one component cannot be both: a brand called
 * «مقهى» forced LTR is as wrong as "Summer 2026 (v2)" left to an RTL paragraph.
 *
 * WHAT IT FIXES, CONCRETELY. Inside an Arabic sentence an un-isolated Latin
 * value drags the neutral characters at its edges with it: the brackets in
 * "Summer 2026 (v2)" swap sides, and a trailing «؟» can migrate to the head of
 * the line. The reader sees a sentence that is not the sentence that was
 * written. `dir` on an element gets `unicode-bidi: isolate` from the UA
 * stylesheet, so wrapping is the whole fix — there is no CSS to add.
 *
 * PREFER THIS OVER THE CONTROL CHARACTERS (`isolate()` in `lib/i18n/bidi.ts`)
 * wherever JSX is available. It is visible in the DOM, a reviewer can see it,
 * and — the deciding reason — the message-body sanitiser strips U+2066–U+2069
 * on purpose, so a character-based isolate silently disappears from anything
 * rendered through it. An element does not.
 *
 * NO `lang`. The offers module's `BidiLine` sets `lang={locale}`, which is right
 * for a line of product copy and wrong here: this wraps a value that is very
 * often NOT in the page's language, and claiming otherwise mis-hyphenates it and
 * hands a screen reader the wrong voice. Absent beats guessed.
 *
 * Renders a plain inline span with no styling of its own, so it can go anywhere
 * — inside a `<p>`, a button label, a table cell — without changing the layout.
 */
export function Bidi({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <span dir="auto" className={className}>
      {children}
    </span>
  )
}
