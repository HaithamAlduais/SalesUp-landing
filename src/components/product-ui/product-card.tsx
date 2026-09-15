/**
 * The product's OfferCard grid body, read-only port.
 * Source: SalesUp/apps/web/components/modules/products/offer-card.tsx (GridCard).
 * Original element hierarchy, utility classes, card anatomy and image fallbacks.
 * Only the data/runtime boundary changed; see docs/PRODUCT_UI_PROVENANCE.md.
 */
import * as React from "react"
import { Store } from "lucide-react"
import { cn } from "./utils"
import { p, useUiPrefs } from "./locale"

export interface ProductCardOffer {
  name: string
  brandName?: string
  /** Local/public presentation assets, not Supabase storage object keys. */
  coverUrl?: string | null
  brandLogoUrl?: string | null
  /** Omit to render a non-interactive preview instead of a dead link. */
  href?: string
  /** Already formatted, using the product's exact commission wording. */
  reward: string
  rewardCaption?: string | null
  /** Already-localized sector / company type / product type, in that order. */
  types?: string[]
  joined?: boolean
  updatedLabel?: string
}

export function ProductCard({
  offer,
  chips,
  end,
  className,
}: {
  offer: ProductCardOffer
  chips?: React.ReactNode
  end?: React.ReactNode
  className?: string
}) {
  const { locale } = useUiPrefs()
  const [coverBroken, setCoverBroken] = React.useState(false)
  const [logoBroken, setLogoBroken] = React.useState(false)
  const coverUrl = coverBroken ? null : offer.coverUrl
  const logoUrl = logoBroken ? null : offer.brandLogoUrl
  const mine = Boolean(offer.joined)
  const reward = offer.reward
  const rewardCaption = offer.rewardCaption
  const types = offer.types ?? []
  return (
    <div
      className={cn(
        
        "group relative flex aspect-square min-w-0 flex-col overflow-hidden rounded-xl border border-border/70 bg-card shadow-panel",
        "transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-px hover:border-primary/40 hover:shadow-panel-hover",
        "has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-ring",
        className
      )}
    >
      
      {offer.href && <a
        href={offer.href}
        aria-label={offer.name}
        className="absolute inset-0 rounded-xl outline-none"
      />}

      <div className="pointer-events-none relative h-1/3 w-full shrink-0 overflow-hidden bg-primary/10">
        {coverUrl ? (

          <img
            src={coverUrl}
            alt=""
            loading="lazy"
            onError={() => setCoverBroken(true)}
            className="size-full object-cover"
          />
        ) : (
          <span
            aria-hidden
            className="flex size-full items-center justify-center text-2xl font-semibold tracking-wide text-primary/45 uppercase"
          >
            {initialsOf(offer.brandName ?? offer.name)}
          </span>
        )}

        {chips ? (
          <span className="absolute end-2 top-2 max-w-[calc(100%-1rem)]">
            {chips}
          </span>
        ) : null}
      </div>

      <div className="pointer-events-none relative -mt-6 flex min-w-0 shrink-0 items-end justify-between gap-2 px-3">
        <span
          className={cn(
            "grid size-12 shrink-0 place-items-center overflow-hidden rounded-full",

            "border border-primary/25 bg-background ring-2 ring-background"
          )}
        >
          {logoUrl ? (

            <img
              src={logoUrl}
              alt=""
              loading="lazy"
              onError={() => setLogoBroken(true)}
              className="size-full object-cover"
            />
          ) : (

            <Store className="size-5 text-primary/50" aria-hidden />
          )}
        </span>
        {end ? (
          <span className="pointer-events-auto flex shrink-0 items-center pb-1">
            {end}
          </span>
        ) : null}
      </div>

      <div className="pointer-events-none relative flex min-h-0 flex-1 flex-col gap-1 overflow-hidden px-3 pt-1.5 pb-3">

        <span className="line-clamp-2 min-w-0 break-words text-sm leading-snug font-semibold text-foreground">
          <bdi>{offer.name}</bdi>
          {offer.brandName ? (
            <span className="font-normal text-muted-foreground">
              {" / "}
              <bdi>{offer.brandName}</bdi>
            </span>
          ) : null}
        </span>

        {offer.updatedLabel && (
          <span
            dir="auto"
            className="min-w-0 truncate text-[0.7rem] text-muted-foreground"
            data-testid="offer-updated"
          >
            {offer.updatedLabel}
          </span>
        )}

        <span className="flex min-w-0 items-center gap-1.5 text-[0.72rem] text-muted-foreground">
          <span className="min-w-0 truncate">
            {mine ? `${p(locale, "Your commission", "عمولتك")} · ${reward}` : reward}
          </span>
        </span>
        
        {rewardCaption && (
          <span className="min-w-0 truncate text-[0.68rem] text-muted-foreground/80">
            {rewardCaption}
          </span>
        )}

        {!mine && types.length > 0 && (
          <span className="min-w-0 truncate text-[0.72rem] text-muted-foreground">
            {types.map((t, i) => (
              <React.Fragment key={i}>
                {i > 0 ? " · " : null}
                <bdi>{t}</bdi>
              </React.Fragment>
            ))}
          </span>
        )}
      </div>

    </div>
  )
}

function initialsOf(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return "··"
  if (words.length === 1) return words[0]!.slice(0, 2).toUpperCase()
  return `${words[0]![0]!}${words[1]![0]!}`.toUpperCase()
}

