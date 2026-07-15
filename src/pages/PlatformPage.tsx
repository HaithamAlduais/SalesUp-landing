import { PageShell } from '../shared/PageShell'
import { PagePlaceholder } from '../shared/ui'

/*
 * اضافه المنصه — digital platform page.
 * Figma frame: 5:3414 (1440×1470). Build per docs/handoffs/screen-platform.md.
 */
export default function PlatformPage() {
  return (
    <PageShell active="platform">
      <PagePlaceholder
        eyebrow={{ ar: 'الحلول الرقمية', en: 'Digital Solutions' }}
        title={{ ar: 'منصة سيلز أب قيد الإنشاء', en: 'The SalesUp platform is under construction' }}
        desc={{ ar: 'حلول رقمية تساعدك تقيس وتحسّن أداء مبيعاتك — قريباً', en: 'Digital tools to measure and improve your sales performance — coming soon' }}
      />
    </PageShell>
  )
}
