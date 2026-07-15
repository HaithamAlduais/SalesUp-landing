import { PageShell } from '../shared/PageShell'
import { useLang } from '../shared/i18n'
import { InViewFx } from '../components/CardFx'

/*
 * الوظائف — jobs page (Figma frame 5:3470, 1440×1470).
 * The design is an empty state: exact Figma copy (title + return-home
 * button per node 5:3498) staged on a soft shader panel, plus an
 * approved-personality sub-line and a "خلّينا نتواصل" contact CTA
 * (per docs/handoffs/screen-jobs.md).
 */
function JobsBody() {
  const { L } = useLang()
  return (
    <section className="jobs-empty">
      <div className="jobs-panel">
        <InViewFx variant={2} />
        <div className="jobs-panel-inner">
          <p className="jobs-eyebrow">{L('الوظائف', 'Careers')}</p>
          <h1 className="jobs-title">{L('لا يوجد وظائف متاحة', 'No open roles right now')}</h1>
          <p className="jobs-sub">
            {L(
              'ما عندنا شواغر حالياً، بس فريقنا يكبر باستمرار — خلّنا نتعرف عليك',
              "We don't have openings at the moment, but our team keeps growing — we'd love to hear from you"
            )}
          </p>
          <div className="jobs-actions">
            <a className="button jobs-home-btn" href="/">
              {L('العودة للصفحة الرئيسية', 'Back to Home')}
            </a>
            <a className="jobs-contact-btn" href="/#contact">
              {L('خلّينا نتواصل', "Let's Talk")}
              <svg className="cta-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M19 12H5m0 0 6-6m-6 6 6 6" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

export default function JobsPage() {
  return (
    <PageShell active="jobs">
      <JobsBody />
    </PageShell>
  )
}
