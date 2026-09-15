/** Vendored exact copy pairs from packages/core/src/copy/leaderboard.ts. */
/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  LEADERBOARD · MODULE-OWNED COPY (EN + AR) — ONE DICTIONARY, BOTH LEGS     ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 *
 * The module owns its strings, exactly as every other bucket does. Same
 * convention: `p(locale, en, ar)` at a call site, or `lc(locale,
 * "leaderboard.<key>")` for the chrome below. rule-rtl: EN and AR are authored
 * together; a key with an empty `ar` is a defect.
 *
 * ── BORN HERE, WITH ONE HOME (2026-09-04, Wave 4) ──────────────────────────
 * Money's dictionary never had a leg copy and neither does this one. Both legs'
 * `lib/modules/leaderboard/copy.ts` are one-line re-exports of THIS file from
 * birth, and `check:parity-keys` P2 fails the build the day a key is defined
 * here AND on a leg.
 *
 * ── TWENTY ROWS · FIFTEEN MOVED, FIVE ARE COPIES ─────────────────────────
 * All twenty stood in `lib/modules/dashboard/copy.ts` as `rw.*` (the rewards
 * unit) or `act.*`, and every SENTENCE below is byte-identical to the one
 * analytics shipped. What changed is the KEY: `rw.boardMonth` is
 * `leaderboard.boardMonth`. A dictionary in `lib/modules/leaderboard/` keyed
 * `rw.*` is the same lie the verb ids were, and it is the lie that let the
 * board live inside analytics. Nothing anywhere STORES a copy key — they exist
 * only as string literals in this repository, checked against
 * `LeaderboardCopyKey` by both typecheckers — so the rename cannot orphan
 * anything and a missed call site is a compile error, not a blank label.
 *
 * FIFTEEN ARE DELETED from both legs' analytics dictionaries in this same
 * change (`boardAll` · `boardBanded` · `boardBandedNone` · `boardEmpty` ·
 * `boardGap` · `boardMonth` · `boardNote` · `boardYou` · `badges` ·
 * `kindChampion` · `name` · `nameField` · `nameHidden` · `nameNote` ·
 * `nameShow`): their only readers were the three screens that moved into
 * `components/modules/leaderboard/**`, so `UNION_FLOOR.analytics` drops by
 * exactly fifteen.
 *
 * FIVE ARE COPIED and analytics keeps its own, because a screen that STAYS
 * still reads the analytics key:
 *   · `board`       — the phone's `analytics/level-sheet.tsx` titles its board
 *                     link with it.
 *   · `pointsWord`  — the desk's `analytics/admin-settlement.tsx` prints it.
 *   · `rowPoints`   — the phone's `analytics/settlement-desk.tsx` prints it.
 *   · `confirm`     — `analytics/parts/actions.tsx` on the desk and the phone's
 *                     settlement desk both label their confirm with `act.confirm`.
 *   · `retry`       — `act.retry`, read by a dozen analytics cards; the board's
 *                     own failed read offers it too.
 * Two dictionaries in two namespaces holding the same sentence is not the drift
 * `check:parity-keys` P2 refuses (that is ONE key with two homes); it is the
 * cost of carving a bucket out, and it is paid down when the last reader on the
 * analytics side leaves.
 *
 * ⚠ `rw.prizeSalesUp` AND `rw.prizeMonthlySalesUp` STAY IN ANALYTICS, unmoved
 * and unread by anything on either leg. They are the settlement's award labels;
 * an unread row is not a retired one, and a floor is a ratchet, not a census.
 * They leave the day somebody rules them dead, not the day a carve walks past.
 *
 * ⚠ ZERO DEPENDENCIES IS THE LAW OF packages/core, AND THIS FILE IMPORTS
 * NOTHING AT ALL. `Locale` and `Bi` are DECLARED below for the reason
 * `copy/team.ts` gives at length: the two apps' i18n entry points do not agree
 * on what they publish, so one seam import would compile on the phone and FAIL
 * on the desk. The ternary in `lc` IS both legs' `p()`.
 */

/* `Locale` HAS ONE HOME since 2026-09-06 — packages/core/src/i18n/locale.ts — so it is
   imported here rather than restated. Type-only, and RELATIVE, so C1's «no
   outside edge» is untouched.
   `Bi` is still declared rather than exported, for the reason the two names
   shared: adding either to this file's public surface would change what the two
   leg paths re-export, and `Bi` already has ONE home at `../errors/auth-errors`.
*/
import type { ProductLocale as Locale } from "./locale"
interface Bi {
  en: string
  ar: string
}

const dict = {
  // ── the board (back 2026-08-25 — the motivation system) ──────────────────
  // The week window did not return: the board ranks POINTS — closed deals and
  // money — and a week of deal-paced work is noise dressed as a race.
  "leaderboard.board": { en: "Leaderboard", ar: "لوحة الصدارة" },
  "leaderboard.boardMonth": { en: "This month", ar: "الشهر هذا" },
  /* the third segment, owner 2026-09-10: «this month / this year / all the
     time». Two words, because it sits inside a pill beside two others. */
  "leaderboard.boardYear": { en: "This year", ar: "السنة هذي" },
  "leaderboard.boardAll": { en: "All time", ar: "من البداية" },
  "leaderboard.boardYou": { en: "You", ar: "أنت" },
  "leaderboard.boardNote": {
    en: "Ranked on points — closed deals and money earned, after refunds. Only agents who asked to be named appear by name.",
    ar: "الترتيب حسب النقاط — الصفقات المُقفلة والمال المكتسب بعد الاسترجاعات. وما يظهر بالاسم إلا من طلب ذلك.",
  },
  "leaderboard.boardGap": {
    // The caller's row is APPENDED when she ranks below the top 20, so the last
    // entry can jump from 20 to 137. The gap gets a sentence instead of a lie.
    en: "Your row is shown wherever you rank, so the numbers jump here.",
    ar: "يظهر صفّك مهما كان ترتيبك، عشان كذا تقفز الأرقام هنا.",
  },
  "leaderboard.boardEmpty": {
    en: "Nobody has earned points in this window yet. The board fills as deals close.",
    ar: "ما كسب أحد نقاط في الفترة هذي بعد. واللوحة تمتلئ مع إقفال الصفقات.",
  },

  // ── M13 · the board, below the floor ─────────────────────────────────────
  //
  // A pseudonym is only a pseudonym in a crowd. «Affiliate #7 · SAR 12,400»
  // read by the only other earner is a name.
  "leaderboard.boardBanded": {
    en: "The board names people only once {n} agents are earning in this window, so that a number cannot point at a person. Until then you see your own row.",
    ar: "ما تعرض اللوحة أسماء إلا لما يكسب {n} مسوّقين في الفترة هذي، عشان ما يشير رقم لشخص. ولين ذاك الحين تشوف صفّك أنت.",
  },
  "leaderboard.boardBandedNone": {
    en: "Nobody has earned in this window yet, including you. The board opens once {n} agents have.",
    ar: "ما كسب أحد في الفترة هذي بعد، وأنت منهم. واللوحة تفتح لما يكسب {n} مسوّقين.",
  },

  // ── one row's quiet sentence: points · money · deals ─────────────────────
  // The phone fills the whole phrase; the desk prints the digits as their own
  // LTR island and this word beside it — filling «{n} نقطة» whole into an LTR
  // span scrambled the pair (walk-29). Two shapes, one fact, and BOTH legs
  // carry both rows because the analytics twins did.
  "leaderboard.rowPoints": { en: "{n} points", ar: "{n} نقطة" },
  "leaderboard.pointsWord": { en: "points", ar: "نقطة" },

  // ── her name on the board ────────────────────────────────────────────────
  "leaderboard.name": { en: "Name on the leaderboard", ar: "الاسم على لوحة الصدارة" },
  "leaderboard.nameShow": { en: "Show my name", ar: "أظهر اسمي" },
  "leaderboard.nameField": { en: "The name to show", ar: "الاسم اللي يظهر" },
  "leaderboard.nameHidden": {
    en: "Others see Agent #N",
    ar: "الآخرون يشوفون «مسوّق رقم N»",
  },
  "leaderboard.nameNote": {
    en: "This is the one place your text reaches another agent's screen, so a new name is checked before others see it. You always see your own row named.",
    ar: "الموضع الوحيد اللي يوصل فيه نصّك لشاشة مسوّق ثاني، عشان كذا نراجع الاسم الجديد قبل لا يشوفه غيرك. وأنت تشوف صفّك باسمك دايم.",
  },

  // ── the champion chip ────────────────────────────────────────────────────
  "leaderboard.kindChampion": { en: "Agent of the month", ar: "مسوّق الشهر" },

  // ── the وسام ─────────────────────────────────────────────────────────────
  "leaderboard.badges": { en: "Badges", ar: "الأوسمة" },

  // ── the two chrome words this bucket presses ─────────────────────────────
  // `act.confirm` and `act.retry` in analytics. The phone's name sheet and the
  // board's own retry need their own copies: a component under
  // `components/modules/leaderboard/**` may not reach into analytics'
  // dictionary — `check:boundaries` R1 refuses it, correctly — and analytics
  // keeps its pair because a dozen of its own screens read them. Two words are
  // the honest price of a bucket owning its own words; team paid it twice for
  // `save` and `cancel`.
  "leaderboard.confirm": { en: "Confirm", ar: "أكّد" },
  "leaderboard.retry": { en: "Try again", ar: "حاول مرة ثانية" },
} as const satisfies Record<string, Bi>

export type LeaderboardCopyKey = keyof typeof dict

/** The module's copy reader — same shape as `ac`/`mc`/`tc`, module-owned. */
export function lc(locale: Locale, key: LeaderboardCopyKey): string {
  const row = dict[key]
  return locale === "ar" ? row.ar : row.en
}

/**
 * The same reader with one substitution — `{n}`. It replaces BOTH parents at
 * once: the desk's `acN(locale, key, n)` and the phone's
 * `acFill(locale, key, { n })`, which were two spellings of one substitution.
 * Every `{n}` this dictionary carries is a COUNT of agents or points, and the
 * numeral stays Western so it matches every other figure on the page.
 */
export function lcN(locale: Locale, key: LeaderboardCopyKey, n: number | string): string {
  return lc(locale, key).replaceAll("{n}", String(n))
}

/** The raw bilingual pair, for places that need both — the phone's HelpDot. */
export function lcBi(key: LeaderboardCopyKey): Bi {
  return dict[key]
}
