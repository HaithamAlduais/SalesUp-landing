import { useEffect, useState } from 'react'
import { PageShell } from '../shared/PageShell'
import { useLang } from '../shared/i18n'
import { ARTICLES, BLOG_POSTS, BlogPost } from '../data/blog'

/*
 * المدونة — article page (Figma frame 5:1467).
 * Long-form bilingual article with a reading-progress bar, a framed
 * hero card, and related-posts navigation. Arabic copy is verbatim
 * from Figma; unknown slugs fall back to a graceful not-found state.
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

function RelatedCard({ post }: { post: BlogPost }) {
  const { L } = useLang()
  return (
    <a className="related-card" href={`/blog/${post.slug}`}>
      <img className="related-icon" src={post.image} alt="" loading="lazy" />
      <h3>{L(post.title.ar, post.title.en)}</h3>
      <span className="related-cta">
        {L('اقرأ المقال', 'Read Article')}
        <svg className="cta-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M19 12H5m0 0 6-6m-6 6 6 6" />
        </svg>
      </span>
    </a>
  )
}

function ArticleBody({ slug, post }: { slug: string; post: BlogPost }) {
  const { L } = useLang()
  const blocks = ARTICLES[slug]
  const related = BLOG_POSTS.filter((p) => p.slug !== slug)

  return (
    <article className="article-page">
      <header className="article-head">
        <p className="eyebrow">{L('المدونة', 'Blog')}</p>
        <div className="article-title-row">
          <h1>{L(post.title.ar, post.title.en)}</h1>
          <a className="article-back" href="/blog" aria-label={L('العودة إلى المدونة', 'Back to the blog')}>
            <svg className="cta-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M19 12H5m0 0 6-6m-6 6 6 6" />
            </svg>
            <span>{L('كل المقالات', 'All Articles')}</span>
          </a>
        </div>
      </header>

      <div className="article-hero">
        <img src={post.image} alt="" />
      </div>

      <div className="article-body">
        {blocks ? (
          blocks.map((b, i) => {
            if (b.type === 'heading') return <h2 key={i}>{L(b.text.ar, b.text.en)}</h2>
            if (b.type === 'list')
              return (
                <ul key={i} className={b.bold ? 'is-bold' : undefined}>
                  {b.items.map((item, j) => (
                    <li key={j}>{L(item.ar, item.en)}</li>
                  ))}
                </ul>
              )
            return (
              <p key={i} className={b.bold ? 'is-bold' : undefined}>
                {b.lines.map((line, j) => (
                  <span key={j}>
                    {L(line.ar, line.en)}
                    {j < b.lines.length - 1 ? <br /> : null}
                  </span>
                ))}
              </p>
            )
          })
        ) : (
          <p className="article-soon">
            {L('محتوى هذا المقال بيكون متاح قريباً.', 'The full article is coming soon.')}
          </p>
        )}
      </div>

      <section className="related-section" aria-label={L('مقالات أخرى', 'More articles')}>
        <h2 className="related-heading">{L('مقالات أخرى', 'More Articles')}</h2>
        <div className="related-grid">
          {related.map((p) => (
            <RelatedCard post={p} key={p.slug} />
          ))}
        </div>
      </section>
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

export default function BlogArticlePage({ slug }: { slug: string }) {
  const post = BLOG_POSTS.find((p) => p.slug === slug)
  return (
    <PageShell active="blog">
      {post ? (
        <>
          <ReadingProgress />
          <ArticleBody slug={slug} post={post} />
        </>
      ) : (
        <NotFound />
      )}
    </PageShell>
  )
}
