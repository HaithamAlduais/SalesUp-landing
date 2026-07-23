import { useEffect, useState } from 'react'
import { PageShell } from '../shared/PageShell'
import { useLang } from '../shared/i18n'
import { CardFx, COARSE_POINTER, InViewFx } from '../components/CardFx'
import { fetchPosts, formatDate, WpPost } from '../data/wp'

/*
 * المدونة — blog index (design per Figma frame 5:1392, content live
 * from WordPress). Posts are authored in salesup.sa/wp-admin and read
 * over the REST API — the same cards, search, and hover-reveal
 * language as before, now on the real editorial pipeline.
 */
function BlogIndex() {
  const { lang, L } = useLang()
  const [query, setQuery] = useState('')
  const [posts, setPosts] = useState<WpPost[] | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let alive = true
    fetchPosts()
      .then((list) => {
        if (alive) setPosts(list)
      })
      .catch(() => {
        if (alive) setFailed(true)
      })
    return () => {
      alive = false
    }
  }, [])

  const q = query.trim().toLowerCase()
  const shown = (posts ?? []).filter((p) =>
    q === '' ? true : (p.title + ' ' + p.excerpt).toLowerCase().includes(q)
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

      {failed ? (
        <p className="blog-empty" role="status">
          {L('تعذّر تحميل المقالات حالياً — حاول تحديث الصفحة', "Couldn't load articles right now — try refreshing the page")}
        </p>
      ) : posts === null ? (
        <div className="blog-grid" aria-busy="true">
          {[0, 1, 2].map((i) => (
            <div className="blog-card blog-card--skeleton" key={i}>
              <div className="blog-card-inner">
                <div className="blog-thumb blog-thumb--photo skeleton-box" />
                <div className="skeleton-line" style={{ width: '40%' }} />
                <div className="skeleton-line" />
                <div className="skeleton-line" style={{ width: '80%' }} />
              </div>
            </div>
          ))}
        </div>
      ) : shown.length === 0 ? (
        <p className="blog-empty" role="status">
          {L('لا توجد مقالات تطابق بحثك', 'No articles match your search')}
        </p>
      ) : (
        <div className="blog-grid">
          {shown.map((p) => (
            <a className="blog-card" href={`/blog/${encodeURIComponent(p.slug)}`} key={p.id}>
              {COARSE_POINTER ? <InViewFx variant={p.fx} /> : <CardFx variant={p.fx} />}
              <div className="blog-card-inner">
                <div className={`blog-thumb${p.image ? ' blog-thumb--photo' : ''}`}>
                  {p.image ? (
                    <img className="blog-photo" src={p.image} alt="" loading="lazy" />
                  ) : (
                    <span className="blog-thumb-mark" aria-hidden="true">S</span>
                  )}
                </div>
                <div className="blog-meta">
                  <span className="blog-chip">{p.category ?? L('مقالة', 'Article')}</span>
                  <span className="blog-read">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <circle cx="12" cy="12" r="9" />
                      <path d="M8 3h8m-4 0v4m-7 5a7 7 0 1 0 14 0 7 7 0 0 0-14 0Z" />
                    </svg>
                    {formatDate(p.date, lang)}
                  </span>
                </div>
                {/* titles come rendered from WordPress (entities included) */}
                <h3 dir="auto" dangerouslySetInnerHTML={{ __html: p.title }} />
                <p className="blog-excerpt" dir="auto">{p.excerpt}</p>
                <span className="sector-cta blog-cta" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
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
