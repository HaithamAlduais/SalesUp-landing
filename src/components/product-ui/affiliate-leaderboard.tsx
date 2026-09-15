/**
 * Read-only adapter of SalesUp's AffiliateLeaderboard.
 * Source: apps/web/components/modules/leaderboard/leaderboard-screen.tsx.
 * Original framed section, period pill, levels and ranked rows are preserved.
 * The URL/server read boundary becomes explicit per-window demonstration props.
 */
import * as React from "react"
import { CalendarDays, CalendarRange, Infinity } from "lucide-react"
import { Section } from "./section"
import { LevelBadge } from "./level-badge"
import { Bidi, Chip, Num } from "./primitives"
import { useUiPrefs } from "./locale"
import { lc, lcN } from "./leaderboard-copy"

export type LeaderboardWindow = "month" | "year" | "all"

export interface LeaderboardPreviewRow {
  rank: number
  /** Use generic demonstration labels, never a captured person's name. */
  label: string
  level: number | null
  points: number
  /** Formatted money and counted deal label supplied by the demo fixture. */
  money: string
  dealsLabel: string
  badges?: number
  isMe?: boolean
}

export interface LeaderboardPreviewWindow {
  periodKey?: string
  rows: LeaderboardPreviewRow[]
  banded?: boolean
  anonFloor?: number
}

function EmptyLine({ children }: { children: React.ReactNode }) {
  return <p className="rounded-xl border border-dashed border-border bg-muted/40 px-4 py-7 text-center text-[0.8rem] text-muted-foreground">{children}</p>
}

export function AffiliateLeaderboard({
  boards,
  initialWindow = "month",
  className,
}: {
  boards: Record<LeaderboardWindow, LeaderboardPreviewWindow>
  initialWindow?: LeaderboardWindow
  className?: string
}) {
  const { locale } = useUiPrefs()
  const [boardWindow, setBoardWindow] = React.useState<LeaderboardWindow>(initialWindow)
  const selected = boards[boardWindow]
  const board = {
    data: {
      ...selected,
      banded: selected.banded ?? false,
      anonFloor: selected.anonFloor ?? 5,
      rows: selected.rows.map(row => ({ ...row, badges: row.badges ?? 0 })),
    },
  }
  /* THE PILL NAMES ITS MONTH (walk-29 feedback: the running board sat right
     above July's settled card and the owner had to ask which month he was
     ranking — «هذا الشهر» alone was not saying it). The key rides only when
     the payload carries it; a failed read keeps the plain word. */
  const periodKey = board.data.periodKey ?? null
  const windows: { w: LeaderboardWindow; label: string; icon: React.ReactNode }[] = [
    { w: "month", label: lc(locale, "leaderboard.boardMonth"), icon: <CalendarDays className="size-3.5" aria-hidden /> },
    { w: "year", label: lc(locale, "leaderboard.boardYear"), icon: <CalendarRange className="size-3.5" aria-hidden /> },
    { w: "all", label: lc(locale, "leaderboard.boardAll"), icon: <Infinity className="size-3.5" aria-hidden /> },
  ]


  /* ⚠ THE SWITCHER IS THE MARKUP THE OWNER PASTED: the pipeline scope's
     segmented pill — one rounded-full border, `h-8` segments, icon + word, the
     chosen one filled green. The product uses URL links; this read-only
     adapter uses buttons to select supplied demonstration windows. The period rides
     on the CHOSEN segment, in the slot the scope pill puts its count in, so
     «which month» is answered without a second row. */
  return (
    <Section
      frame
      className={className ? `min-w-0 ${className}` : "min-w-0"}
      title={lc(locale, "leaderboard.board")}
      /* the ONE line, and only while it is true — see the header */
      description={
        board.data.banded
          ? lcN(locale, "leaderboard.boardBanded", board.data.anonFloor)
          : undefined
      }
      action={
        <div
          role="group"
          aria-label={lc(locale, "leaderboard.board")}
          data-board-switcher={boardWindow}
          className="flex shrink-0 overflow-hidden rounded-full border"
        >
          {windows.map(({ w, label, icon }) => (
            <button
              key={w}
              type="button"
              onClick={() => setBoardWindow(w)}
              data-board-window={w}
              aria-pressed={w === boardWindow}
              className={
                "inline-flex h-8 items-center gap-1 px-2 text-[0.72rem] font-medium whitespace-nowrap transition-colors sm:gap-1.5 sm:px-2.5 " +
                (w === boardWindow
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted")
              }
            >
              {icon}
              <span>{label}</span>
              {w === boardWindow && periodKey ? (
                <span
                  dir="ltr"
                  className="inline-flex h-5 items-center justify-center rounded-full bg-primary-foreground/15 px-1.5 text-[0.66rem] tabular-nums"
                >
                  <Num>{periodKey}</Num>
                </span>
              ) : null}
            </button>
          ))}
        </div>
      }
      bodyClassName="p-2 sm:p-3"
    >
      <>
        {board.data.rows.length === 0 ? (
          <EmptyLine>
            {board.data.banded
              ? lcN(locale, "leaderboard.boardBandedNone", board.data.anonFloor)
              : lc(locale, "leaderboard.boardEmpty")}
          </EmptyLine>
        ) : (
          <div className="flex min-w-0 flex-col">
            {board.data.rows.map((r, i) => {
              const prev = i > 0 ? board.data.rows[i - 1] : undefined
              const gap = prev !== undefined && r.rank - prev.rank > 1
              const chip =
                r.rank === 1 && boardWindow === "month"
                  ? lc(locale, "leaderboard.kindChampion")
                  : r.isMe
                    ? lc(locale, "leaderboard.boardYou")
                    : null

              return (
                <React.Fragment key={`${r.rank}-${r.label}`}>
                  {gap ? (
                    <p className="px-2 py-1 text-[0.68rem] text-muted-foreground">
                      {lc(locale, "leaderboard.boardGap")}
                    </p>
                  ) : null}
                  <div
                    data-board-me={r.isMe ? "true" : undefined}
                    className={
                      "flex min-h-11 w-full items-start gap-2 rounded-lg px-2 py-2 text-sm " +
                      (r.isMe ? "bg-primary/5" : "")
                    }
                  >
                    <Num className="w-7 shrink-0 pt-0.5 text-[0.75rem] font-semibold text-muted-foreground">
                      {`#${r.rank}`}
                    </Num>
                    <div className="min-w-0 flex-1">
                      <div className="flex min-w-0 items-center gap-2">
                        <LevelBadge level={r.level} locale={locale} />
                        <span
                          className={
                            "min-w-0 flex-1 truncate " + (r.isMe ? "font-semibold" : "")
                          }
                        >
                          <Bidi>{r.label}</Bidi>
                        </span>
                        {/* the وسام count rides as a quiet mark, one glyph */}
                        {r.badges > 0 ? (
                          <span
                            dir="ltr"
                            className="shrink-0 text-[0.7rem] text-muted-foreground tabular-nums"
                            title={lc(locale, "leaderboard.badges")}
                          >
                            🏅{r.badges > 1 ? `×${r.badges}` : ""}
                          </span>
                        ) : null}
                        {chip ? <Chip tone="primary">{chip}</Chip> : null}
                      </div>
                      {/* one quiet sentence: points · money · deals. The
                          DIGITS are the LTR island — never the Arabic word
                          beside them: wrapping «9235 نقطة» whole in an LTR
                          span scrambled the pair (walk-29 feedback). */}
                      <p className="min-w-0 truncate text-[0.72rem] text-muted-foreground">
                        <Num>{r.points.toLocaleString("en-US")}</Num>{" "}
                        {lc(locale, "leaderboard.pointsWord")}
                        {" · "}
                        <Num>{r.money}</Num>
                        {" · "}
                        {r.dealsLabel}
                      </p>
                    </div>
                  </div>
                </React.Fragment>
              )
            })}
          </div>
        )}

      </>
    </Section>
  )
}
