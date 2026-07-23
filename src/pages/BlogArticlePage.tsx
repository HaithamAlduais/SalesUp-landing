import { useEffect, useState } from 'react'
import { PageShell } from '../shared/PageShell'
import { useLang } from '../shared/i18n'
import { fetchPost, fetchPosts, formatDate, readMins, WpPost } from '../data/wp'

/*
 * المدونة — article page (design per Figma frame 5:1467, content live
 * from WordPress). The body is the post's rendered HTML from wp-admin,
 * styled by .article-body--wp; slugs are Arabic (percent-encoded in
 * URLs). Unknown slugs fall back to a graceful not-found state.
 */

/* thin green bar under the header tracking document scroll progress */
function ReadingProgress() {
  const [progress, setProgress] = useState(0)
  useEffect(() => {
    const onScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight
      setProgress(total > 0 ? Math.min(1, window.scrollY / total) : 0)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])
  return (
    <div className="article-progress" aria-hidden="true">
      <div className="article-progress-bar" style={{ transform: `scaleX(${progress})` }} />
    </div>
  )
}

function RelatedCard({ post }: { post: WpPost }) {
  const { L } = useLang()
  return (
    <a className="related-card" href={`/blog/${encodeURIComponent(post.slug)}`}>
      {post.image ? <img className="related-photo" src={post.image} alt="" loading="lazy" /> : null}
      <h3 dir="auto" dangerouslySetInnerHTML={{ __html: post.title }} />
      <span className="related-cta">
        {L('اقرأ المقال', 'Read Article')}
        <svg className="cta-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M19 12H5m0 0 6-6m-6 6 6 6" />
        </svg>
      </span>
    </a>
  )
}

function ArticleBody({ post }: { post: WpPost }) {
  const { lang, L } = useLang()
  const [related, setRelated] = useState<WpPost[]>([])

  useEffect(() => {
    let alive = true
    fetchPosts()
      .then((all) => {
        if (alive) setRelated(all.filter((p) => p.id !== post.id).slice(0, 3))
      })
      .catch(() => {
        /* related is decorative — the article still reads fine */
      })
    return () => {
      alive = false
    }
  }, [post.id])

  return (
    <article className="article-page">
      <header className="article-head">
        <p className="eyebrow">{L('المدونة', 'Blog')}</p>
        <div className="article-title-row">
          <h1 dir="auto" dangerouslySetInnerHTML={{ __html: post.title }} />
          <a className="article-back" href="/blog" aria-label={L('العودة إلى المدونة', 'Back to the blog')}>
            <svg className="cta-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M19 12H5m0 0 6-6m-6 6 6 6" />
            </svg>
            <span>{L('كل المقالات', 'All Articles')}</span>
          </a>
        </div>
        <div className="blog-meta article-meta">
          <span className="blog-chip">{post.category ?? L('مقالة', 'Article')}</span>
          <span className="blog-read">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 3" />
            </svg>
            {post.content
              ? L(`${readMins(post.content)} دقائق قراءة`, `${readMins(post.content)} min read`)
              : formatDate(post.date, lang)}
          </span>
          <span className="blog-read">{formatDate(post.date, lang)}</span>
        </div>
      </header>

      {post.image ? (
        <div className="article-hero">
          <img src={post.image} alt="" />
        </div>
      ) : null}

      {/* WordPress-rendered HTML: our own CMS content, styled by the
          --wp rules; always RTL Arabic regardless of UI language */}
      <div
        className="article-body article-body--wp"
        dir="rtl"
        lang="ar"
        dangerouslySetInnerHTML={{ __html: post.content ?? '' }}
      />

      {related.length > 0 ? (
        <section className="related-section" aria-label={L('مقالات أخرى', 'More articles')}>
          <h2 className="related-heading">{L('مقالات أخرى', 'More Articles')}</h2>
          <div className="related-grid">
            {related.map((p) => (
              <RelatedCard post={p} key={p.id} />
            ))}
          </div>
        </section>
      ) : null}
    </article>
  )
}

function NotFound() {
  const { L } = useLang()
  return (
    <section className="placeholder-section">
      <div className="section-heading">
        <p className="eyebrow">{L('المدونة', 'Blog')}</p>
        <div className="heading-group">
          <h2>{L('المقال غير موجود', 'Article not found')}</h2>
          <p className="heading-desc">
            {L('يبدو أن الرابط غير صحيح — تصفح مقالاتنا من صفحة المدونة', 'That link doesn’t look right — browse our articles from the blog page')}
          </p>
        </div>
      </div>
      <div className="center-action">
        <a className="button button--dark" href="/blog">{L('إلى المدونة', 'Go to the Blog')}</a>
      </div>
    </section>
  )
}

function Loading() {
  const { L } = useLang()
  return (
    <section className="placeholder-section" aria-busy="true">
      <p className="blog-empty" role="status">{L('جاري تحميل المقال…', 'Loading the article…')}</p>
    </section>
  )
}

export default function BlogArticlePage({ slug }: { slug: string }) {
  const [state, setState] = useState<'loading' | 'ready' | 'missing'>('loading')
  const [post, setPost] = useState<WpPost | null>(null)

  useEffect(() => {
    let alive = true
    let decoded = slug
    try {
      decoded = decodeURIComponent(slug)
    } catch {
      /* keep as is */
    }
    fetchPost(decoded)
      .then((p) => {
        if (!alive) return
        setPost(p)
        setState(p ? 'ready' : 'missing')
      })
      .catch(() => {
        if (alive) setState('missing')
      })
    return () => {
      alive = false
    }
  }, [slug])

  return (
    <PageShell active="blog">
      {state === 'loading' ? (
        <Loading />
      ) : state === 'ready' && post ? (
        <>
          <ReadingProgress />
          <ArticleBody post={post} />
        </>
      ) : (
        <NotFound />
      )}
    </PageShell>
  )
}
