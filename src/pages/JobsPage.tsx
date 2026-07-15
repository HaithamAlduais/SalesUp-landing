import { PageShell } from '../shared/PageShell'
import { PagePlaceholder } from '../shared/ui'

/*
 * الوظائف — jobs page.
 * Figma frame: 5:3470 (1440×1470). Build per docs/handoffs/screen-jobs.md.
 */
export default function JobsPage() {
  return (
    <PageShell active="jobs">
      <PagePlaceholder
        eyebrow={{ ar: 'الوظائف', en: 'Careers' }}
        title={{ ar: 'صفحة الوظائف قيد الإنشاء', en: 'The careers page is under construction' }}
        desc={{ ar: 'انضم لفريق سيلز أب — الفرص المتاحة بتكون هنا قريباً', en: 'Join the SalesUp team — open roles will appear here soon' }}
      />
    </PageShell>
  )
}
