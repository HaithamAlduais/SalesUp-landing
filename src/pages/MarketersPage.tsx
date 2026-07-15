import { PageShell } from '../shared/PageShell'
import { PagePlaceholder } from '../shared/ui'

/*
 * خدمة ماركتيرز — the Marketers service funnel.
 * Figma frames: 5:2379, 5:2494 (1440×4220 variants) + state frames
 * 5:2618, 5:2699, 5:2781, 5:2863, 5:2945, 5:3104, 5:3186, 5:3268
 * (1440×1617 each) and 5:3350 (1440×1543).
 * Build per docs/handoffs/screen-marketers.md.
 */
export default function MarketersPage({ apply = false }: { apply?: boolean }) {
  return (
    <PageShell active="services">
      <PagePlaceholder
        eyebrow={{ ar: 'Marketers', en: 'Marketers' }}
        title={apply
          ? { ar: 'طلب خدمة Marketers قيد الإنشاء', en: 'The Marketers application is under construction' }
          : { ar: 'صفحة Marketers قيد الإنشاء', en: 'The Marketers page is under construction' }}
        desc={{ ar: 'نرتّب لك تسويقك الرقمي بخطة شهرية واضحة — قريباً', en: 'We run your digital marketing with a clear monthly plan — coming soon' }}
      />
    </PageShell>
  )
}
