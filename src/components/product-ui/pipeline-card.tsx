/**
 * SalesUp's real PipelineCard, read-only presentation adapter.
 * Source: apps/web/components/modules/leads/pipeline-card.tsx.
 * Original identity / money / dates hierarchy and utility classes.
 * Menu, drag, contact actions and business writes are intentionally absent.
 */
import { CalendarPlus } from 'lucide-react'
import { Chip, Num } from './primitives'
import { p, useUiPrefs } from './locale'
import { cn } from './utils'

export interface PipelineCardLead {
  name: string
  /** Bare formatted money. The currency is named once by the column header. */
  value?: string | null
  commission?: string | null
  commissionConfirmed?: boolean
  /** Numeric dates already formatted as DD/MM/YY. */
  addedOn?: string | null
  expectedCloseOn?: string | null
  inReview?: boolean
  agentName?: string
}

// Exact name treatment from the original card / shared pipeline behaviour.
function initials(text: string): string {
  const words = text.trim().split(/\s+/).filter(Boolean)
  const first = words[0]?.[0] ?? ''
  const second = words[1]?.[0] ?? ''
  return `${first}${second}`.toLocaleUpperCase()
}

function twoWords(text: string): string {
  return text.trim().split(/\s+/).slice(0, 2).join(' ')
}

export function PipelineCard({ lead, className }: { lead: PipelineCardLead; className?: string }) {
  const { locale } = useUiPrefs()
  const inReview = Boolean(lead.inReview)
  // Copy pairs below are reproduced from packages/core/src/copy/leads.ts.
  const valueUnknown = p(locale, 'No price on the product', 'المنتج ما له سعر محدد')
  const commissionUnknown = p(locale, 'Commission not set yet', 'العمولة ما تحددت بعد')
  const commissionLabel = lead.commissionConfirmed
    ? p(locale, 'Confirmed commission', 'العمولة المؤكدة')
    : p(locale, 'Expected commission', 'العمولة المتوقعة')
  const needsCloseDate = p(locale, 'Add an expected close date', 'حط تاريخ الإغلاق المتوقع')

  return (
    <div
      data-card-body
      data-in-review={inReview || undefined}
      title={inReview ? p(locale, 'Sent to Commissions — waiting for the company and the desk.', 'انرسلت للعمولات — بانتظار الشركة والإدارة.') : undefined}
      className={cn(
        'group relative flex select-none flex-col gap-1.5 rounded-lg border bg-card p-2.5 text-start shadow-panel',
        inReview && 'border-dashed bg-muted/60 text-muted-foreground',
        className
      )}
    >
      <div className="flex min-w-0 items-start gap-1.5">
        <span
          role="presentation"
          className="relative flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-[0.66rem] font-semibold text-foreground/80"
        >
          <span>{initials(lead.name)}</span>
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-1.5">
            <span dir="auto" data-card-name className="min-w-0 truncate text-sm font-medium">
              {twoWords(lead.name)}
            </span>
            {lead.agentName && (
              <Chip tone="muted" data-agent-chip dir="auto" className="max-w-[9rem] truncate">
                {lead.agentName}
              </Chip>
            )}
            {inReview && (
              <Chip tone="muted" data-review-chip className="shrink-0">
                {p(locale, 'In review', 'قيد المراجعة')}
              </Chip>
            )}
          </div>
        </div>
      </div>

      <div className="flex min-w-0 items-baseline gap-2 text-[0.78rem]" data-card-money>
        {lead.value ? (
          <Num className="font-semibold text-foreground">{lead.value}</Num>
        ) : (
          <span className="text-muted-foreground" data-money="value-unknown" title={valueUnknown} aria-label={valueUnknown}>—</span>
        )}
        <span aria-hidden className="text-muted-foreground/50">·</span>
        {lead.commission ? (
          <span data-money={lead.commissionConfirmed ? 'confirmed' : 'forecast'} title={commissionLabel}>
            <Num className={lead.commissionConfirmed ? 'font-semibold text-primary' : 'text-muted-foreground'}>
              {lead.commission}
            </Num>
          </span>
        ) : (
          <span className="text-muted-foreground" data-money="commission-unknown" title={commissionUnknown} aria-label={commissionUnknown}>—</span>
        )}
      </div>

      <div className="flex min-w-0 items-baseline gap-2 text-[0.7rem] text-muted-foreground" data-card-dates>
        <span title={p(locale, 'Added', 'أُضيف')}><Num>{lead.addedOn ?? '—'}</Num></span>
        <span aria-hidden className="text-muted-foreground/50">·</span>
        {lead.expectedCloseOn ? (
          <span data-close-date title={p(locale, 'Expected closing date', 'تاريخ الإغلاق المتوقع')}><Num>{lead.expectedCloseOn}</Num></span>
        ) : (
          <span
            data-close-date="none"
            title={needsCloseDate}
            aria-label={needsCloseDate}
            className="inline-flex min-w-0 items-center gap-1 text-brand-link"
          >
            <CalendarPlus className="size-3 shrink-0" aria-hidden />
            <span className="truncate">{needsCloseDate}</span>
          </span>
        )}
      </div>
    </div>
  )
}
