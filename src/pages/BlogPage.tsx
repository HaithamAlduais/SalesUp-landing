import { useState } from 'react'
import { PageShell } from '../shared/PageShell'
import { useLang } from '../shared/i18n'
import { CardFx, COARSE_POINTER, InViewFx } from '../components/CardFx'
import { BLOG_POSTS } from '../data/blog'

/*
 * المدونة — blog index (Figma frame 5:1392).
 * Heading + live search + post cards with the site's hover-reveal
 * language. Built per docs/handoffs/screen-blog.md.
 */
function BlogIndex() {
  const { lang, L } = useLang()
  const [query, setQuery] = useState('')

  const q = query.trim().toLowerCase()
  const posts = BLOG_POSTS.filter((p) =>
    q === '' ? true : (lang === 'ar' ? p.titleAr : p.titleEn).toLowerCase().includes(q)
  )

  return (
    <section className="blog-index" id="blog">
      <div className="section-heading">
        <p className="eyebrow">{L('المدونة', 'Blog')}</p>
        <div className="heading-group">
          <h2>{L('أفكار تساعدك تفهم المبيعات والنمو بشكل أوضح', 'Ideas that help you understand sales and growth more clearly')}</h2>
          <p className="heading-desc">{L('محتوى مختصر وعملي عن المبيعات، التسويق، توليد العملاء، وتحسين النمو للشركات', 'Practical, to-the-point content on sales, marketing, lead generation, and growing your company')}</p>
        </div>
      </div>

      <form className="blog-search" role="search" onSubmit={(e) => e.preventDefault()}>
        <svg className="blog-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.8-3.8" />
        </svg>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={L('ابحث هنا عن مقال معين', 'Search for a specific article')}
          aria-label={L('البحث في المدونة', 'Search the blog')}
        />
      </form>

      {posts.length === 0 ? (
        <p className="blog-empty" role="status">
          {L('لا توجد مقالات تطابق بحثك', 'No articles match your search')}
        </p>
      ) : (
        <div className="blog-grid">
          {posts.map((p) => (
            <a className="blog-card" href={`/blog/${p.slug}`} key={p.slug}>
              {COARSE_POINTER ? <InViewFx variant={p.fx} /> : <CardFx variant={p.fx} />}
              <div className="blog-card-inner">
                <img className="blog-card-icon" src={p.icon} alt="" loading="lazy" />
                <h3>{lang === 'ar' ? p.titleAr : p.titleEn}</h3>
                <span className="sector-cta" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                  {L('اقرأ المقال', 'Read Article')}
                  <svg className="cta-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M19 12H5m0 0 6-6m-6 6 6 6" />
                  </svg>
                </span>
              </div>
            </a>
          ))}
        </div>
      )}
    </section>
  )
}

export default function BlogPage() {
  return (
    <PageShell active="blog">
      <BlogIndex />
    </PageShell>
  )
}
