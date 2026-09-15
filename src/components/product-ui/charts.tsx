/**
 * SalesUp product UI — vendored read-only from the real product.
 * Source: apps/web/components/shared/charts.tsx
 * See docs/PRODUCT_UI_PROVENANCE.md for the adapter boundary.
 */
"use client"

import * as React from "react"

import { cn } from "./utils"

/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  ORDER #7 · THE ONE CHART ENGINE — monotone cubic, plot insets, zero deps  ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 *
 * Every series in the product is drawn by this file. Inline SVG, no chart
 * library, no runtime dependency, and no second engine — a fork here is how two
 * screens end up disagreeing about the same numbers.
 *
 * THE TWO CORRECTIONS ORDER #7 MADE, both implemented here:
 *
 *  1  MONOTONE CUBIC, not Catmull-Rom. A plain smoothing spline OVERSHOOTS: feed
 *     it 0, 0, 40, 0 and the curve dips BELOW zero between the points, drawing
 *     negative clicks that never happened. Fritsch–Carlson (`monotonePath`)
 *     clamps the tangent wherever the data changes direction, so the curve can
 *     never leave the interval its own points define. A chart that invents a
 *     value is worse than a chart that looks angular.
 *
 *  2  PLOT INSETS. Without them a stroke at the maximum is sliced in half by the
 *     viewBox edge and the tallest day silently looks shorter than it is. Every
 *     plot here reserves `INSET` units on each side, so the extremes are drawn
 *     whole.
 *
 * SCALING: the viewBox is a fixed coordinate space stretched to the container
 * (`preserveAspectRatio="none"`), which is what lets a sparkline be fluid at
 * 375 px. Non-uniform scaling would smear the stroke, so every stroked element
 * carries `vector-effect="non-scaling-stroke"` — the line stays 1.5 px wide at
 * any container width.
 *
 * ZERO DATA IS A REAL STATE, not an error: an all-zero series draws a flat line
 * on the baseline (`span || 1` guards the divide), because "nothing happened" is
 * a true and useful shape. An EMPTY series renders nothing but keeps its box, so
 * the layout does not jump when data arrives.
 *
 * COLOUR comes from the caller through `currentColor` / the token classes, never
 * from a hard-coded hex — light and dark both work with no second palette.
 */

const VB_W = 300
const INSET = 3
/**
 * report 0d25f7b7 · the fewest day-slots a bar plot is laid out over. A series
 * shorter than this fills part of the space rather than stretching to fill it —
 * see `BarSeries`. Seven, because a week is the shortest span this product's
 * charts have ever drawn and the shape a reader already knows.
 */
const MIN_SLOTS = 7

// ── the maths ───────────────────────────────────────────────────────────────

interface Pt {
  x: number
  y: number
}

/**
 * Fritsch–Carlson monotone cubic Hermite, emitted as cubic béziers.
 * The tangent at an interior point is zeroed whenever the neighbouring secants
 * disagree in sign — that single clamp is what makes overshoot impossible.
 */
export function monotonePath(pts: Pt[]): string {
  const n = pts.length
  if (n === 0) return ""
  const first = pts[0]!
  if (n === 1) return `M ${r(first.x)} ${r(first.y)}`
  if (n === 2) {
    const b = pts[1]!
    return `M ${r(first.x)} ${r(first.y)} L ${r(b.x)} ${r(b.y)}`
  }

  const dx: number[] = []
  const secant: number[] = []
  for (let i = 0; i < n - 1; i += 1) {
    const a = pts[i]!
    const b = pts[i + 1]!
    const h = b.x - a.x || 1e-6
    dx.push(h)
    secant.push((b.y - a.y) / h)
  }

  const m: number[] = new Array<number>(n).fill(0)
  m[0] = secant[0]!
  m[n - 1] = secant[n - 2]!
  for (let i = 1; i < n - 1; i += 1) {
    const s0 = secant[i - 1]!
    const s1 = secant[i]!
    if (s0 * s1 <= 0) {
      m[i] = 0
      continue
    }
    const w1 = 2 * dx[i]! + dx[i - 1]!
    const w2 = dx[i]! + 2 * dx[i - 1]!
    m[i] = (w1 + w2) / (w1 / s0 + w2 / s1)
  }

  let d = `M ${r(first.x)} ${r(first.y)}`
  for (let i = 0; i < n - 1; i += 1) {
    const a = pts[i]!
    const b = pts[i + 1]!
    const h = dx[i]!
    const c1x = a.x + h / 3
    const c1y = a.y + (m[i]! * h) / 3
    const c2x = b.x - h / 3
    const c2y = b.y - (m[i + 1]! * h) / 3
    d += ` C ${r(c1x)} ${r(c1y)} ${r(c2x)} ${r(c2y)} ${r(b.x)} ${r(b.y)}`
  }
  return d
}

function r(n: number): string {
  return (Math.round(n * 100) / 100).toString()
}

/** Map a series into the inset plot box. `max` may be forced so two series share a scale. */
function project(
  values: number[],
  height: number,
  forcedMax?: number
): { pts: Pt[]; max: number; min: number } {
  const n = values.length
  const min = Math.min(0, ...values)
  const max = forcedMax ?? Math.max(...values, 0)
  const span = max - min || 1
  const w = VB_W - INSET * 2
  const h = height - INSET * 2
  const pts = values.map((v, i) => ({
    x: INSET + (n === 1 ? w / 2 : (i / (n - 1)) * w),
    y: INSET + h - ((v - min) / span) * h,
  }))
  return { pts, max, min }
}

// ── the components ──────────────────────────────────────────────────────────

export interface SeriesProps {
  values: number[]
  /** describes the series for a screen reader — REQUIRED, a chart is content */
  ariaLabel: string
  height?: number
  className?: string
  /** paint an area under the line (the cumulative shapes) */
  area?: boolean
  /** muted paint — the "paused" tail, a dead domain, an inactive row */
  dim?: boolean
  /** share a y-scale with a sibling series so the two are comparable */
  forcedMax?: number
}

/**
 * The inline trend line — an offer row's pulse, an asset's `trend` array, a
 * domain's `failure_spark`. Small by default (28 px) and fluid in width.
 */
export function Sparkline({
  values,
  ariaLabel,
  height = 28,
  className,
  area = false,
  dim = false,
  forcedMax,
}: SeriesProps) {
  /* One gradient per instance, or two charts on a page share an id and the
     second one inherits the first's stops. */
  const fillId = React.useId()
  const d = React.useMemo(() => {
    if (values.length === 0) return { line: "", fill: "" }
    const { pts } = project(values, height, forcedMax)
    const line = monotonePath(pts)
    const firstPt = pts[0]!
    const lastPt = pts[pts.length - 1]!
    const base = height - INSET
    return {
      line,
      fill: `${line} L ${r(lastPt.x)} ${r(base)} L ${r(firstPt.x)} ${r(base)} Z`,
    }
  }, [values, height, forcedMax])

  return (
    <svg
      role="img"
      aria-label={ariaLabel}
      viewBox={`0 0 ${VB_W} ${height}`}
      preserveAspectRatio="none"
      className={cn(
        "block h-full w-full",
        dim ? "text-muted-foreground/50" : "text-primary",
        className
      )}
      style={{ height }}
    >
      {/* ── THE AREA IS A GRADIENT, NOT A SLAB (report 9633eab6, second round) ─
          A flat 12 % wash under a 30-day line paints a rectangle of green with
          a wiggle on top: the operator's Activity card was a single block of
          colour filling a third of the screen and saying nothing. A fade from
          the curve down to the baseline gives the plot a horizon, so the eye
          reads the LINE — which is the data — instead of the block under it.
          `currentColor` still supplies the hue, so both themes and every
          caller's tone survive untouched. */}
      {area && d.fill && (
        <>
          <defs>
            <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="currentColor" stopOpacity={0.3} />
              <stop offset="100%" stopColor="currentColor" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <path d={d.fill} fill={`url(#${fillId})`} />
        </>
      )}
      {d.line && (
        <path
          d={d.line}
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      )}
    </svg>
  )
}

/**
 * Discrete bars — one per day. Used wherever the quantity is a COUNT OF EVENTS
 * rather than a level: actions per day, rewards per day, failures per day. A
 * count is not continuous, so drawing it as a curve would imply values between
 * the days that do not exist.
 */
/**
 * ── WHERE DAY `i` STANDS, AS A PERCENTAGE OF THE PLOT ───────────────────────
 * The centre of day `i`'s slot, so a caller can hang a LABEL under the column
 * it names. Exported for one reason: a date axis computed from its own idea of
 * the geometry is an axis that drifts the moment `MIN_SLOTS`, `INSET` or the
 * 0.62 day-width changes here — and a tick sitting under the wrong column is
 * worse than no tick, because it is believed.
 *
 * ⚠ IT FOLLOWS `BarSeries`, NOT `Sparkline`. The two lay their x-axes out
 * differently on purpose (a curve spans edge to edge, columns sit in slots), so
 * an axis drawn from this helper names the BAR series' days. On a card that
 * draws both, the bars are the primary series — that is already how `DayChart`
 * picks its total and its peak.
 */
export function slotCenterPct(i: number, n: number): number {
  const w = VB_W - INSET * 2
  const slot = w / Math.max(n, MIN_SLOTS)
  return ((INSET + i * slot + slot / 2) / VB_W) * 100
}

export function BarSeries({
  values,
  ariaLabel,
  height = 28,
  className,
  dim = false,
  forcedMax,
  group,
}: Omit<SeriesProps, "area"> & {
  /**
   * ── TWO SERIES, ONE DAY, SIDE BY SIDE (stakeholder, 2026-09-06) ───────────
   * Absent, a series owns the whole slot and draws exactly as it always has —
   * every existing caller is untouched. Given `{ i, of }` the slot is divided
   * `of` ways and this series takes the `i`-th sub-column, so two `BarSeries`
   * over the same day list interleave into grouped columns instead of hiding
   * each other.
   *
   * ⚠ EACH SERIES STILL SCALES ITSELF. Money and a deal count share no unit, so
   * sharing an axis would be a lie about both; the columns share the DAY, never
   * the height. That is the same two-scale honesty the line-over-bars shape had
   * — the only thing that changed is the mark, because a count drawn as a curve
   * implies values between the days (this file's own rule, at `BarSeries`).
   */
  group?: { i: number; of: number }
}) {
  const fillId = React.useId()
  const bars = React.useMemo(() => {
    const n = values.length
    if (n === 0) return []
    const max = forcedMax ?? Math.max(...values, 0)
    const span = max || 1
    const w = VB_W - INSET * 2
    const h = height - INSET * 2
    /* ── report 0d25f7b7 · A SHORT SERIES IS NOT A WIDE ONE ────────────────────
       `slot = w / n` is right for the thirty- and seven-day series this chart
       was built for, and it degenerates below that: at n = 1 the single column
       is 62 % of the card — a green slab, not a chart — and at n = 2 or 3 the
       columns read as blocks. Nothing could reach that state until the operator
       Dashboard's period filter learned to say «اليوم», and then «how did we do
       today» drew a rectangle.

       The plot is a WEEK-SHAPED SPACE that a short series fills partly. The
       slot is sized as if there were at least `MIN_SLOTS` days and the bars are
       laid from the start edge, so one day is one ordinary column standing in
       an otherwise empty week, three days are three ordinary columns, and every
       series of seven or more draws exactly as it always did. */
    const slot = w / Math.max(n, MIN_SLOTS)
    /* the drawn width of a day, and then this series' share of it */
    const dayW = Math.max(1, slot * 0.62)
    const of = Math.max(1, group?.of ?? 1)
    const bw = Math.max(0.6, dayW / of)
    const mine = Math.min(group?.i ?? 0, of - 1)
    return values.map((v, i) => {
      const bh = Math.max(v > 0 ? 1 : 0, (v / span) * h)
      return {
        x: INSET + i * slot + (slot - dayW) / 2 + mine * bw,
        y: INSET + h - bh,
        w: bw,
        h: bh,
      }
    })
  }, [values, height, forcedMax, group?.i, group?.of])

  return (
    <svg
      role="img"
      aria-label={ariaLabel}
      viewBox={`0 0 ${VB_W} ${height}`}
      preserveAspectRatio="none"
      className={cn(
        "block h-full w-full",
        dim ? "text-muted-foreground/50" : "text-primary",
        className
      )}
      style={{ height }}
    >
      {/* ── A COLUMN IS NOT A FLAT SLAB EITHER ────────────────────────────────
          Thirty rectangles at a uniform 55 % read as a grey-green comb. The
          same top-down fade the area uses gives each column a body and a foot,
          which is what lets the tall days stand out from the short ones at a
          glance — the whole reason this chart is on the page.

          ⚠ NO ROUNDED TOPS, and that is not an oversight. `preserveAspectRatio
          ="none"` stretches the viewBox non-uniformly, so an `rx` in viewBox
          units renders as an ellipse whose eccentricity changes with the
          container width. Square tops are the honest shape here. */}
      <defs>
        <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity={0.85} />
          <stop offset="100%" stopColor="currentColor" stopOpacity={0.4} />
        </linearGradient>
      </defs>
      {bars.map((b, i) => (
        <rect
          key={i}
          x={r(b.x)}
          y={r(b.y)}
          width={r(b.w)}
          height={r(b.h)}
          fill={`url(#${fillId})`}
        />
      ))}
    </svg>
  )
}

/**
 * The two-series day chart: a smooth LINE for the level (clicks, events) and
 * BARS for the discrete count (actions, rewards). One shared x, two independent
 * y-scales — the actions bars would be invisible against a clicks axis, and
 * forcing one scale is how a real signal gets flattened into the baseline.
 *
 * Because the scales differ, the legend states BOTH series and the caller is
 * expected to door each one separately (rule-numbers-are-doors): the line's
 * screen and the bars' screen are usually not the same tab.
 */
export function LineBarChart({
  line,
  bars,
  lineLabel,
  barLabel,
  lineAs = "curve",
  ariaLabel,
  height = 96,
  className,
  children,
}: {
  /**
   * THE LINE IS OPTIONAL SINCE 2026-08-19. Omit `line`/`lineLabel` and the card
   * draws a plain bar series — the honest shape once a second series is taken
   * away rather than merely missing, which is what happened to the affiliate's
   * charts when clicks left her face. The two props travel together: a legend
   * swatch with no curve behind it is a claim about a series that is not drawn.
   *
   * ⚠ AND THE BARS ARE OPTIONAL SINCE 2026-08-20, for the same reason read from
   * the other end. The operator's Activity card had only ONE series to draw and
   * the type made it pass a second, so it fed in `b: 0` for every day and gave
   * both swatches the same word: the legend said «Events  Events» under a chart
   * drawing events once. A required series is how a chart ends up claiming a
   * series that is not there. Now either may be omitted and the legend states
   * exactly what is drawn — but not BOTH: a chart with nothing to plot is not a
   * chart, and the caller gets an empty plot box rather than a silent lie.
   */
  line?: number[]
  bars?: number[]
  lineLabel?: string
  barLabel?: string
  /**
   * How the `line` series is DRAWN. `"curve"` is the historical shape and stays
   * the default, so no existing chart moves. `"columns"` groups it beside the
   * bars — asked for by the stakeholder on 2026-09-06 for the company's «money
   * over time», where the second series is a DEAL COUNT and this file already
   * says in `BarSeries` that a count drawn as a curve claims values between the
   * days it never measured.
   */
  lineAs?: "curve" | "columns"
  ariaLabel: string
  height?: number
  className?: string
  /** the caller's own footer (the day doors, the window label) */
  children?: React.ReactNode
}) {
  const hasLine = line !== undefined && lineLabel !== undefined
  const hasBars = bars !== undefined && barLabel !== undefined
  /* grouped only when BOTH are drawn: one series alone keeps the whole slot */
  const grouped = lineAs === "columns" && hasLine && hasBars
  return (
    <div className={cn("min-w-0", className)}>
      <div className="relative" style={{ height }}>
        {hasBars && (
          <div className="absolute inset-0">
            <BarSeries
              values={bars}
              ariaLabel={barLabel}
              height={height}
              group={grouped ? { i: 0, of: 2 } : undefined}
            />
          </div>
        )}
        {hasLine && (
          <div className="absolute inset-0">
            {lineAs === "columns" ? (
              /* dimmed, because the two series share a day and not a unit: one
                 colour for two meanings is the misread this separates */
              <BarSeries
                values={line}
                ariaLabel={lineLabel}
                height={height}
                dim
                group={grouped ? { i: 1, of: 2 } : undefined}
              />
            ) : (
              <Sparkline values={line} ariaLabel={lineLabel} height={height} area />
            )}
          </div>
        )}
      </div>
      <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.68rem] text-muted-foreground">
        {hasLine && (
          <span className="inline-flex items-center gap-1">
            {/* the swatch is the MARK, so a reader can find the series it names */}
            <span
              className={cn(
                "bg-primary",
                lineAs === "columns"
                  ? "h-2.5 w-1.5 rounded-[1px] bg-muted-foreground/50"
                  : "h-0.5 w-3 rounded-full"
              )}
              aria-hidden
            />
            {lineLabel}
          </span>
        )}
        {hasBars && (
          <span className="inline-flex items-center gap-1">
            <span className="h-2.5 w-1.5 rounded-[1px] bg-primary/55" aria-hidden />
            {barLabel}
          </span>
        )}
      </p>
      <span className="sr-only">{ariaLabel}</span>
      {children}
    </div>
  )
}

/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  THE COMPOSITION BAR — one whole, cut into its parts                       ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 *
 * The twin of the phone leg's `StackTinyBar`, which shipped first and sat unused
 * because the web had no partner for it. Every series above answers "how did this
 * move over thirty days"; this one answers "what is this made of" — offers split
 * by status, a charge split into margin and the affiliates' share and the prizes,
 * events split into clicks and sales.
 *
 * ⚠ DIVS, NOT SVG, AND THAT IS THE WHOLE REASON THIS IS NOT A `<rect>` LOOP.
 * A stacked bar reads in the direction the page reads: in Arabic the first part
 * belongs on the RIGHT. Laid out in SVG the segments are pinned to x-coordinates
 * that know nothing about `dir`, so the phone's SVG version has to reverse its
 * own array at the call site to mirror. A flex row mirrors for free, because
 * flex lays out along the writing direction — one fewer thing every caller has
 * to remember, in the leg that has two locales on the same build.
 *
 * A PART WORTH SOMETHING IS NEVER INVISIBLE. A nonzero segment keeps a 2 px
 * floor — the same floor `BarSeries` gives a one-click day — so "one rejected
 * offer out of four hundred" is a hairline you can see rather than nothing at
 * all. That floor can push the row past 100 %, which is why the track clips.
 *
 * A TOTAL OF ZERO IS A REAL STATE: an empty track, not a hidden component. The
 * layout must not jump when the first offer arrives.
 */
export function StackBar({
  parts,
  ariaLabel,
  height = 10,
  className,
}: {
  /** drawn in order; `id` only has to be unique within the bar */
  parts: { id: string; value: number }[]
  ariaLabel: string
  height?: number
  className?: string
}) {
  const total = parts.reduce((n, part) => n + Math.max(0, part.value), 0)
  return (
    <span
      role="img"
      aria-label={ariaLabel}
      className={cn(
        "flex w-full overflow-hidden rounded-full bg-muted",
        className
      )}
      style={{ height }}
    >
      {total > 0 &&
        parts.map((part, i) => {
          const v = Math.max(0, part.value)
          if (v === 0) return null
          /* ── THE PARTS NEED AN EDGE BETWEEN THEM (report 9633eab6, second
             round). Four abutting weights of ONE hue is a gradient, not a
             partition: the four offer statuses read as a single green fading
             out, and the reader could not see where «live» ended. A 2 px rule
             in the CARD's own colour cuts each part from the next — a rule and
             not a shadow, because elevation separates SURFACES and a segment
             boundary is inside one — and it costs nothing in either theme: it is the surface the
             bar is already sitting on. The last part takes no rule: a divider
             at the end of the track is a segment boundary that is not there. */
          const last = i === parts.length - 1
          return (
            <span
              key={part.id}
              className={cn(
                "block h-full bg-primary",
                !last && "border-e-2 border-card"
              )}
              style={{
                width: `${(v / total) * 100}%`,
                minWidth: 2,
                opacity: shareShade(i),
              }}
            />
          )
        })}
    </span>
  )
}

/**
 * ONE HUE, MANY PARTS. A composition is read as "how much of the whole", so the
 * segments differ in weight rather than in colour: five categorical hues would
 * make «rejected» look like an alarm and «draft» like a different kind of thing,
 * when all four are simply states of the same population. It also survives both
 * themes and colour-blindness with no second palette, which a five-hue ramp does
 * not. Beyond the ladder every further part shares the lightest weight — a
 * composition with more than six parts has a legend problem, not a colour one.
 */
const SHARE_SHADES = [1, 0.72, 0.5, 0.34, 0.22, 0.14] as const

export function shareShade(index: number): number {
  return SHARE_SHADES[index] ?? 0.12
}


