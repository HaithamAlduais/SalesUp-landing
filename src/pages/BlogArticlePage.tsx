import { PageShell } from '../shared/PageShell'
import { PagePlaceholder } from '../shared/ui'

/*
 * المدونة — article page.
 * Figma frame: 5:1467 (1440×3622). Build per docs/handoffs/screen-blog-article.md.
 */
export default function BlogArticlePage({ slug }: { slug: string }) {
  void slug
  return (
    <PageShell active="blog">
      <PagePlaceholder
        eyebrow={{ ar: 'المدونة', en: 'Blog' }}
        title={{ ar: 'المقال قيد الإنشاء', en: 'This article is under construction' }}
        desc={{ ar: 'محتوى المقال بيكون متاح قريباً', en: 'The article content will be available soon' }}
      />
    </PageShell>
  )
}
