import { FormEvent, useEffect, useRef, useState } from 'react'
import { PageShell } from '../shared/PageShell'
import { useLang } from '../shared/i18n'
import { usePageTheme } from '../shared/theme'
import { Select } from '../shared/Select'
import { ContactFx, InViewFx } from '../components/CardFx'
import { EMAIL_PATTERN, leadFromForm, submitLead } from '../components/leads'
import { findJob, Job, JobTrack, JOBS, jobsInTrack, isNew, postedLabel, TRACKS } from '../data/jobs'
import contactGlow from '../assets/contact-glow.svg'

/*
 * انضم لنا — careers (Figma section "اضافه الوظائف").
 *   /jobs            hub, two tracks            (220:930)
 *   /jobs/students   co-op listings             (223:1250)
 *   /jobs/graduates  job listings               (223:1250)
 *   /jobs/<slug>     role detail                (208:838)
 *   /jobs/apply      application form + success (210:973 / 210:1087)
 * Copy is verbatim from Figma; roles live in src/data/jobs.ts.
 */

function Hub() {
  const { L } = useLang()
  return (
    <section className="jobs-hub">
      <div className="section-heading">
        <p className="eyebrow">{L('انضم لنا', 'Join Us')}</p>
        <div className="heading-group">
          <h1>{L('ابنِ مسارك المهني مع سيلز أب', 'Build your career with SalesUp')}</h1>
          <p className="heading-desc">
            {L(
              'اختر المسار المناسب لك — تدريب تعاوني للطلاب، أو فرص وظيفية للخريجين',
              'Pick the path that fits you — co-op training for students, or roles for graduates'
            )}
          </p>
        </div>
      </div>

      <div className="jobs-track-grid">
        {TRACKS.map((t, i) => (
          <a className="jobs-track-card" href={`/jobs/${t.key}`} key={t.key}>
            <InViewFx variant={2 + i} />
            <div className="jobs-track-inner">
              <span className="jobs-track-badge">{L(t.badge.ar, t.badge.en)}</span>
              <h2>{L(t.title.ar, t.title.en)}</h2>
              <p>{L(t.desc.ar, t.desc.en)}</p>
              <span className="jobs-track-cta">{L('تصفح الفرص', 'Browse openings')}</span>
            </div>
          </a>
        ))}
      </div>
    </section>
  )
}

function Listings({ track }: { track: JobTrack }) {
  const { lang, L } = useLang()
  const meta = TRACKS.find((t) => t.key === track)
  const jobs = jobsInTrack(track)

  return (
    <section className="jobs-list-section">
      <div className="section-heading">
        <p className="eyebrow">{L('انضم لنا', 'Join Us')}</p>
        <div className="heading-group">
          <h1>{meta ? L(meta.title.ar, meta.title.en) : L('الفرص', 'Openings')}</h1>
          <p className="heading-desc">{meta ? L(meta.desc.ar, meta.desc.en) : ''}</p>
        </div>
      </div>

      {jobs.length === 0 ? (
        <div className="jobs-panel jobs-panel--empty">
          <InViewFx variant={2} />
          <div className="jobs-panel-inner">
            <h2 className="jobs-title">{L('لا توجد فرص متاحة حالياً', 'No openings right now')}</h2>
            <p className="jobs-sub">
              {L(
                'ما عندنا شواغر في هذا المسار حالياً، بس فريقنا يكبر باستمرار — خلّنا نتعرف عليك',
                "Nothing open on this track at the moment, but our team keeps growing — we'd love to hear from you"
              )}
            </p>
            <div className="jobs-actions">
              <a className="button jobs-home-btn" href="/jobs">
                {L('كل المسارات', 'All tracks')}
              </a>
              <a className="jobs-contact-btn" href="/#contact">
                {L('تواصل معنا', 'Contact Us')}
                <svg className="cta-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M19 12H5m0 0 6-6m-6 6 6 6" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      ) : (
        <>
          <p className="jobs-filter-chip">{L('الأحدث', 'Newest')}</p>
          <ol className="jobs-list" role="list">
            {jobs.map((job, i) => (
              <li className="jobs-row" key={job.slug}>
                <a className="jobs-row-link" href={`/jobs/${job.slug}`}>
                  <span className="jobs-row-index" aria-hidden="true">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="jobs-row-main">
                    <span className="jobs-row-title">{L(job.title.ar, job.title.en)}</span>
                    <span className="jobs-row-meta">
                      <span>{L(job.type.ar, job.type.en)}</span>
                      <span aria-hidden="true">•</span>
                      <span>{postedLabel(job.postedAt, lang)}</span>
                    </span>
                  </span>
                  <span className="jobs-row-cta" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                    {L('تصفح الفرصة', 'View role')}
                    <svg className="cta-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M19 12H5m0 0 6-6m-6 6 6 6" />
                    </svg>
                  </span>
                </a>
              </li>
            ))}
          </ol>
        </>
      )}
    </section>
  )
}

function Detail({ job }: { job: Job }) {
  const { lang, L } = useLang()
  return (
    <article className="job-detail">
      <a className="job-apply-float" href={`/jobs/apply?job=${job.slug}`}>
        {L('قدّم على هذه الوظيفة', 'Apply for this role')}
      </a>

      <header className="job-head">
        <div className="job-head-badges">
          <span className="job-chip job-chip--cat">{L(job.category.ar, job.category.en)}</span>
          {isNew(job.postedAt) ? (
            <span className="job-chip job-chip--new">{L('جديد', 'New')}</span>
          ) : null}
        </div>
        <h1>{L(job.title.ar, job.title.en)}</h1>
        <p className="job-head-en">{L(job.titleEn, job.title.ar)}</p>
        <div className="job-meta-chips">
          <span>{L(job.location.ar, job.location.en)}</span>
          <span>{L(job.type.ar, job.type.en)}</span>
          <span>{L(job.experience.ar, job.experience.en)}</span>
          <span>{L(job.education.ar, job.education.en)}</span>
        </div>
        <p className="job-posted">{postedLabel(job.postedAt, lang)}</p>
      </header>

      <div className="job-body">
        <p className="job-titles-line">
          {L('بالعربي: ', 'Arabic: ')}
          {job.title.ar}
        </p>
        <p className="job-titles-line">
          {L('بالإنجليزي: ', 'English: ')}
          {job.titleEn}
        </p>

        <h2>{L('الدور الوظيفي:', 'The role:')}</h2>
        <p>{L(job.summary.ar, job.summary.en)}</p>

        <h2>{L('المهام والمسؤوليات:', 'Responsibilities:')}</h2>
        <ul className="job-tasks">
          {job.responsibilities.map((r) => (
            <li key={r.ar}>{L(r.ar, r.en)}</li>
          ))}
        </ul>

        <h2>{L('تصنيف الوظيفة:', 'Category:')}</h2>
        <p>{L(job.category.ar, job.category.en)}</p>

        <h2>{L('المهارات المطلوبة:', 'Skills required:')}</h2>
        <div className="job-skills">
          {job.skills.map((s) => (
            <span className="job-skill" key={s.ar}>
              {L(s.ar, s.en)}
            </span>
          ))}
        </div>
      </div>

      <div className="job-detail-actions">
        <a className="button button--submit" href={`/jobs/apply?job=${job.slug}`}>
          {L('قدّم على هذه الوظيفة', 'Apply for this role')}
        </a>
        <a className="jobs-contact-btn" href={`/jobs/${job.track}`}>
          {L('كل الفرص', 'All openings')}
          <svg className="cta-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M19 12H5m0 0 6-6m-6 6 6 6" />
          </svg>
        </a>
      </div>
    </article>
  )
}

function ApplyForm() {
  const { dark } = usePageTheme()
  const { L } = useLang()
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const successRef = useRef<HTMLHeadingElement>(null)

  /* disabling the submit button drops focus to <body>; move it to the
     confirmation so screen readers announce it and keyboard users keep
     a place in the page */
  useEffect(() => {
    if (status === 'sent') successRef.current?.focus()
  }, [status])

  const params = new URLSearchParams(window.location.search)
  const preset = params.get('job') ?? ''

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (status === 'sending') return
    const payload = leadFromForm(event.currentTarget, { form: 'job-apply' })
    setStatus('sending')
    const ok = await submitLead(payload)
    setStatus(ok ? 'sent' : 'error')
    if (ok) window.scrollTo({ top: 0 })
  }

  if (status === 'sent') {
    /* success state per Figma 210:1087 */
    return (
      <section className="jobs-apply-section">
        <p className="contact-eyebrow">{L('التقديم على الوظيفة', 'Job application')}</p>
        <div className="contact-panel jobs-success" role="status">
          <ContactFx dark={dark} />
          <div className="jobs-success-inner">
            <span className="mk-check" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="m4.5 12.5 5 5 10-11" />
              </svg>
            </span>
            <h1 ref={successRef} tabIndex={-1}>{L('تم استلام طلبك بنجاح', 'Your application has been received')}</h1>
            <p>
              {L(
                'وصلنا طلبك، وراح يراجعه فريق SalesUp ويتواصل معك قريبًا',
                'We got your application — the SalesUp team will review it and reach out soon'
              )}
            </p>
            <a className="button button--submit" href="/">
              {L('العودة الى الرئيسية', 'Back to Home')}
            </a>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="jobs-apply-section">
      <p className="contact-eyebrow">{L('التقديم على الوظيفة', 'Job application')}</p>
      <h1 className="jobs-apply-title">{L('ابدأ طلبك برفع بياناتك', 'Start your application')}</h1>
      <div className="contact-panel jobs-apply-panel">
        <ContactFx dark={dark} />
        <img className="contact-glow" src={contactGlow} alt="" aria-hidden="true" />
        <div className="contact-inner">
          <p className="jobs-apply-lead">
            {L(
              'عبّ النموذج، وتأكد من بياناتك ويتم التواصل معك قريبًا',
              "Fill in the form and check your details — we'll be in touch soon"
            )}
          </p>
          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="field-row">
              <input className="field" name="name" type="text" placeholder={L('الاسم*', 'Name*')} aria-label={L('الاسم', 'Name')} autoComplete="name" required />
              <input className="field" name="phone" type="tel" placeholder={L('رقم الجوال*', 'Phone*')} aria-label={L('رقم الجوال', 'Phone')} autoComplete="tel" required />
            </div>
            <div className="field-row">
              <input className="field" name="email" type="email" pattern={EMAIL_PATTERN} title={L('اكتب بريدًا كاملاً مثل name@example.com', 'Enter a complete email, e.g. name@example.com')} placeholder={L('الايميل', 'Email')} aria-label={L('الايميل', 'Email')} autoComplete="email" />
              <Select
                name="job"
                ariaLabel={L('الوظيفة', 'Role')}
                placeholder={L('اختر الوظيفة*', 'Choose a role*')}
                options={JOBS.map((j) => ({ value: j.slug, label: L(j.title.ar, j.title.en) }))}
                defaultValue={JOBS.some((j) => j.slug === preset) ? preset : ''}
                required
              />
            </div>
            <div className="field-row">
              <input className="field" name="linkedin" type="url" placeholder={L('رابط لنكدان*', 'LinkedIn URL*')} aria-label={L('رابط لنكدان', 'LinkedIn URL')} required />
              <input className="field" name="cv" type="url" placeholder={L('رابط السيرة الذاتية*', 'CV link*')} aria-label={L('رابط السيرة الذاتية', 'CV link')} required />
            </div>
            <div className="field-row">
              <input className="field" name="about" type="text" placeholder={L('كلمنا عن نفسك*', 'Tell us about yourself*')} aria-label={L('كلمنا عن نفسك', 'Tell us about yourself')} required />
              <input className="field" name="portfolio" type="url" placeholder={L('رابط ملف أعمالك', 'Portfolio link')} aria-label={L('رابط ملف أعمالك', 'Portfolio link')} />
            </div>
            <input className="hp-field" name="website" type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" />
            <div className="form-action">
              <button className="button button--submit" type="submit" disabled={status === 'sending'}>
                {status === 'sending' ? L('جارٍ الإرسال…', 'Sending…') : L('ارسل طلبك', 'Send application')}
              </button>
              {status === 'error' ? (
                <p className="form-status form-status--error" role="alert">
                  {L('تعذّر إرسال الطلب. حاول مرة أخرى، أو راسلنا مباشرة على hi@salesup.sa', "Couldn't send your application. Please try again, or email us directly at hi@salesup.sa")}
                </p>
              ) : null}
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}

function NotFound() {
  const { L } = useLang()
  return (
    <section className="placeholder-section">
      <div className="section-heading">
        <p className="eyebrow">{L('انضم لنا', 'Join Us')}</p>
        <div className="heading-group">
          <h1>{L('الوظيفة غير موجودة', 'Role not found')}</h1>
          <p className="heading-desc">
            {L('يبدو أن الرابط غير صحيح — تصفح الفرص المتاحة', "That link doesn't look right — browse the open roles")}
          </p>
        </div>
      </div>
      <div className="center-action">
        <a className="button button--dark" href="/jobs">{L('كل الفرص', 'All openings')}</a>
      </div>
    </section>
  )
}

export default function JobsPage({ view = 'hub', slug }: { view?: 'hub' | 'track' | 'detail' | 'apply'; slug?: string }) {
  const job = view === 'detail' && slug ? findJob(slug) : undefined
  return (
    <PageShell active="jobs">
      {view === 'hub' ? <Hub /> : null}
      {view === 'track' ? <Listings track={(slug as JobTrack) ?? 'graduates'} /> : null}
      {view === 'apply' ? <ApplyForm /> : null}
      {view === 'detail' ? job ? <Detail job={job} /> : <NotFound /> : null}
    </PageShell>
  )
}
