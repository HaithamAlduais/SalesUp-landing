/** Source: apps/web/components/shared/level-badge.tsx; original LevelBadge render. */
import { cn } from "./utils"
import { p, type ProductLocale as Locale } from "./locale"

export function LevelBadge({
  level,
  locale,
  size = "sm",
  className,
}: {
  /** 1 → 100, or null when the read failed. NEVER defaulted to 1. */
  level: number | null
  locale: Locale
  /** `sm` rides a 64px picture or a list row; `lg` heads its own card. */
  size?: "sm" | "lg"
  className?: string
}) {
  const known = level !== null
  return (
    <span
      data-level={known ? String(level) : "unknown"}
      aria-label={
        known
          ? `${p(locale, "Level", "المستوى")} ${level}`
          : p(locale, "Level unknown", "المستوى مو معروف")
      }
      className={cn(
        "grid shrink-0 place-items-center rounded-full border-2 border-primary bg-card font-bold text-primary shadow-sm",
        // `tabular-nums` so 1 and 100 sit on the same optical centre, and the
        // circle does not jump width when somebody levels up.
        "tabular-nums",
        size === "sm" ? "size-6 text-[0.65rem]" : "size-11 text-base",
        className
      )}
    >
      {/* LTR on the digits: the same discipline `<Num>` and `counted()` keep —
          «12» reads as twelve in an Arabic page, never as twenty-one. */}
      <span dir="ltr">{known ? level : "–"}</span>
    </span>
  )
}

