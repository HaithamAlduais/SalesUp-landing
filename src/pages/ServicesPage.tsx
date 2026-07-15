import { PageShell } from '../shared/PageShell'
import { PagePlaceholder } from '../shared/ui'

/*
 * الخدمات — services index.
 * Figma frames: 5:1675, 5:1755 (1440×2249 variants), 5:1835 (1440×2385),
 * 5:3609 (1440×1543). Build per docs/handoffs/screen-services.md.
 */
export default function ServicesPage() {
  return (
    <PageShell active="services">
      <PagePlaceholder
        eyebrow={{ ar: 'الخدمات', en: 'Services' }}
        title={{ ar: 'صفحة الخدمات قيد الإنشاء', en: 'The Services page is under construction' }}
        desc={{ ar: 'نجهّز لك تفاصيل كل خدمة بشكل أوضح — قريباً', en: "We're preparing clearer details for every service — coming soon" }}
      />
    </PageShell>
  )
}
