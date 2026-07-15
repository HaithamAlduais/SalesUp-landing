import { PageShell } from '../shared/PageShell'
import { PagePlaceholder } from '../shared/ui'

/*
 * المدونة — blog index.
 * Figma frame: 5:1392 (1440×2358). Build per docs/handoffs/screen-blog.md.
 */
export default function BlogPage() {
  return (
    <PageShell active="blog">
      <PagePlaceholder
        eyebrow={{ ar: 'المدونة', en: 'Blog' }}
        title={{ ar: 'المدونة قيد الإنشاء', en: 'The blog is under construction' }}
        desc={{ ar: 'مقالات عن المبيعات والنمو — قريباً', en: 'Articles on sales and growth — coming soon' }}
      />
    </PageShell>
  )
}
