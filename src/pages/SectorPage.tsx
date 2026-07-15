import { PageShell } from '../shared/PageShell'
import { PagePlaceholder } from '../shared/ui'

/*
 * القطاعات — sector detail pages (one template, four sectors).
 * Figma frames: 5:1530, 5:1944, 5:2089, 5:2234 (1440×1693 each).
 * Build per docs/handoffs/screen-sectors.md.
 */
export const SECTORS: Record<string, { ar: string; en: string }> = {
  fintech: { ar: 'فنتك', en: 'Fintech' },
  saas: { ar: 'SaaS', en: 'SaaS' },
  agencies: { ar: 'الوكالات الإعلانية', en: 'Ad Agencies' },
  technology: { ar: 'تقنية المعلومات', en: 'Information Technology' },
}

export default function SectorPage({ slug }: { slug: string }) {
  const sector = SECTORS[slug] ?? SECTORS.technology
  return (
    <PageShell active="home">
      <PagePlaceholder
        eyebrow={{ ar: 'القطاعات', en: 'Sectors' }}
        title={{ ar: `قطاع ${sector.ar} — قيد الإنشاء`, en: `${sector.en} sector — under construction` }}
        desc={{ ar: 'حلول مبيعات مخصصة لطبيعة نشاطك وسوقك — قريباً', en: 'Sales solutions tailored to your business and market — coming soon' }}
      />
    </PageShell>
  )
}
