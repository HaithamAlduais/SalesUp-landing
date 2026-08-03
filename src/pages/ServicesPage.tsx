import { CSSProperties, FormEvent, useEffect, useRef, useState } from 'react'
import { PageShell } from '../shared/PageShell'
import { useLang } from '../shared/i18n'
import { usePageTheme } from '../shared/theme'
import { Select } from '../shared/Select'
import { ActiveFx, ContactFx } from '../components/CardFx'
import { EMAIL_PATTERN, leadFromForm, submitLead } from '../components/leads'

import iconInsideSales from '../assets/icon-inside-sales.webp'
import iconOutsideSales from '../assets/icon-outside-sales.webp'
import iconMarketers from '../assets/icon-marketers.webp'
import badgeStar from '../assets/badge-star.svg'

/*
 * الخدمات — services index + service detail + request-success state.
 * Figma: 5:1675 index (6 cards), 5:1755 card-hover state (استكشف الخدمة
 * CTA reveal), 5:1835 detail (title + desc + request-form panel + FAQ),
 * 5:3609 success panel. `/services` renders the index;
 * `/services/:slug` renders the detail (the shared router forwards both
 * here; the slug is parsed from the URL).
 *
 * FAQ answers are NOT in Figma (only the questions, collapsed) — the
 * answers below are authored and flagged in the handback for client
 * review. FAQs exist only for outside-sales in Figma, so other services
 * hide the FAQ section.
 */

type Faq = { qAr: string; qEn: string; aAr: string; aEn: string }
type Line = { ar: string; en: string }

type Service = {
  slug: string
  ar: string
  en: string
  latin?: boolean
  badge?: boolean
  icon: string
  fx: number
  href?: string
  descAr: string
  descEn: string
  detailAr?: string
  detailEn?: string
  /** long-form body on the service page (client deck, Arabic verbatim) */
  intro?: Line[]
  includes?: Line[]
  suitedFor?: Line[]
  faqs?: Faq[]
}

/* index order per Figma 5:1675 (RTL grid: outside first) */
const SERVICES: Service[] = [
  {
    slug: 'outside-sales',
    ar: 'المبيعات الخارجية',
    en: 'Outside Sales',
    icon: iconOutsideSales,
    fx: 5,
    descAr: 'نوصل لعملاء جدد ، ونساعدك توسّع حضورك في أسواق أو مناطق جديدة',
    descEn: 'We reach new customers and help you expand into new markets and regions',
    detailAr: 'نستقطب العميل المناسب بشكل مباشر واستهداف مناطق جديدة للتوسع من خلال الزيارات الميدانية المباشرة .',
    detailEn: 'We attract the right customers directly and target new regions for expansion through direct field visits.',
    intro: [
      {
        ar: 'إذا كانت عملية البيع تحتاج زيارات ميدانية ومقابلة مباشرة للعملاء، فريق المبيعات الخارجية في سيلزأب يتولى هذي المهمة عنك ويمثل علامتك التجارية باحترافية.',
        en: "If your sale needs field visits and meeting customers face to face, SalesUp's outside sales team takes that on for you and represents your brand professionally.",
      },
      {
        ar: 'نروح زيارات ميدانية، نقدم عروض ونبني علاقات قوية مع العملاء ونشتغل على إغلاق الصفقات وتحقيق أهدافك في المبيعات.',
        en: 'We make the visits, present your offer, build strong customer relationships, and work to close deals and hit your sales targets.',
      },
    ],
    includes: [
      {
        ar: 'الزيارات الميدانية والاجتماعات مع العملاء.',
        en: 'Field visits and meetings with customers.',
      },
      { ar: 'التعريف بعلامتك التجارية وخدماتك.', en: 'Introducing your brand and your services.' },
      {
        ar: 'تقديم العروض والإجابة على استفسارات العملاء.',
        en: 'Presenting offers and answering customer questions.',
      },
      { ar: 'التفاوض وإدارة جميع مراحل البيع.', en: 'Negotiating and managing every stage of the sale.' },
      {
        ar: 'متابعة فرص البيع حتى توقيع الاتفاقيات.',
        en: 'Following opportunities through to signed agreements.',
      },
      {
        ar: 'تقارير دورية عن الزيارات والنتائج المحققة.',
        en: 'Regular reports on visits and the results achieved.',
      },
    ],
    suitedFor: [
      { ar: 'توصل لعملائك بشكل مباشر.', en: 'Reach your customers directly.' },
      {
        ar: 'تزيد مبيعاتك من خلال الزيارات الميدانية.',
        en: 'Grow your sales through field visits.',
      },
      { ar: 'تتوسع في أسواق ومناطق جديدة.', en: 'Expand into new markets and regions.' },
      {
        ar: 'يكون عندك فريق يمثل علامتك التجارية باحترافية.',
        en: 'Have a team that represents your brand professionally.',
      },
    ],
    faqs: [
      {
        qAr: 'وش المقصود بخدمة المبيعات الخارجية؟',
        qEn: 'What is the Outside Sales service?',
        aAr: 'فريق ميداني يمثّلك، يزور عملاءك المحتملين مباشرة ويعرض خدمتك وجهًا لوجه.',
        aEn: 'A field team that represents you — visiting your prospects directly and presenting your service face to face.',
      },
      {
        qAr: 'كيف تحددون العملاء والمناطق المستهدفة؟',
        qEn: 'How do you define target customers and regions?',
        aAr: 'نتفق معك على الشريحة والمناطق حسب أهدافك، ونبني قائمة زيارات واضحة قبل البدء.',
        aEn: 'We agree with you on the segment and regions based on your goals, and build a clear visit list before starting.',
      },
      {
        qAr: 'وش تشمل الخدمة؟',
        qEn: 'What does the service include?',
        aAr: 'التخطيط، الزيارات الميدانية، عروض الخدمة، والمتابعة حتى إغلاق الفرصة.',
        aEn: 'Planning, field visits, service presentations, and follow-up until the opportunity closes.',
      },
      {
        qAr: 'كيف أتابع نتائج الزيارات؟',
        qEn: 'How do I track visit results?',
        aAr: 'تقارير دورية واضحة لكل زيارة: النتيجة، الخطوة التالية، وفرص البيع المفتوحة.',
        aEn: 'Clear periodic reports for every visit: the outcome, the next step, and open sales opportunities.',
      },
      {
        qAr: 'هل الخدمة مناسبة لجميع الأنشطة؟',
        qEn: 'Is the service right for every business?',
        aAr: 'تناسب أغلب الأنشطة اللي تحتاج وصول مباشر للعميل — نأكد لك الملاءمة في أول استشارة.',
        aEn: 'It fits most businesses that need direct customer reach — we confirm the fit in your first consultation.',
      },
    ],
  },
  {
    slug: 'inside-sales',
    ar: 'المبيعات الداخلية',
    en: 'Inside Sales',
    icon: iconInsideSales,
    fx: 3,
    descAr: 'نتابع التواصل مع العملاء المهتمين، ونحوّل اهتمامهم لفرص مبيعات أوضح',
    descEn: 'We follow up with interested customers and turn their interest into clearer sales opportunities',
    intro: [
      {
        ar: 'فريق المبيعات الداخلية في سيلزأب يتواصل مع عملائك عن بُعد عبر الهاتف أو الرسائل، ويتابعهم من أول تواصل حتى إتمام عملية البيع.',
        en: "SalesUp's inside sales team reaches your customers remotely by phone or message, and follows them from the first contact through to the closed sale.",
      },
      {
        ar: 'ما نكتفي بالتواصل بس، نرد على الاستفسارات و نفهم احتياج كل عميل و نقدم له الحل المناسب، مع المتابعة المستمرة عشان نزيد فرص إغلاق الصفقات، وكل تفاصيل الأداء تقدم لك في تقارير دورية تخليك مطلع على سير العمل.',
        en: 'We do more than make contact: we answer questions, understand what each customer needs and offer the right solution, with continuous follow-up to raise your close rate — and every detail of performance reaches you in regular reports that keep you across the work.',
      },
    ],
    includes: [
      { ar: 'التواصل مع العملاء المحتملين.', en: 'Reaching out to potential customers.' },
      { ar: 'المتابعة والرد على الاستفسارات.', en: 'Following up and answering enquiries.' },
      { ar: 'متابعة العملاء حتى إتمام البيع.', en: 'Following customers through to the closed sale.' },
      { ar: 'إغلاق الصفقات ورفع نسبة التحويل.', en: 'Closing deals and lifting the conversion rate.' },
      { ar: 'تحديث بيانات العملاء.', en: 'Keeping customer records up to date.' },
      {
        ar: 'تواصل مستمر مع فريقك لضمان جودة وسلاسة سير العمل.',
        en: 'Continuous contact with your team to keep the work smooth and consistent.',
      },
      { ar: 'تقارير دورية توضح الأداء والنتائج.', en: 'Regular reports showing performance and results.' },
    ],
    suitedFor: [
      {
        ar: 'تزيد مبيعاتك بدون ما توظف فريق مبيعات داخلي.',
        en: 'Grow your sales without hiring an in-house sales team.',
      },
      { ar: 'تضمن سرعة الرد على جميع العملاء.', en: 'Guarantee a fast response to every customer.' },
      { ar: 'ترفع نسبة التحويل.', en: 'Raise your conversion rate.' },
      {
        ar: 'تخفف تكاليف توظيف وتدريب فريق مبيعات خاص فيك.',
        en: 'Cut the cost of hiring and training your own sales team.',
      },
      {
        ar: 'يكون عندك فريق مبيعات احترافي يحقق أهدافك.',
        en: 'Have a professional sales team working to your targets.',
      },
    ],
  },
  {
    slug: 'sales-development',
    ar: 'تطوير المبيعات',
    en: 'Sales Development',
    icon: iconOutsideSales,
    fx: 0,
    descAr: 'نراجع طريقة البيع الحالية، ونطوّر خطوات المتابعة، والإغلاق بشكل أوضح',
    descEn: 'We review how you sell today and structure clearer follow-up and closing steps',
  },
  {
    slug: 'lead-generation',
    ar: 'توليد العملاء المحتملين',
    en: 'Lead Generation',
    icon: iconInsideSales,
    fx: 2,
    descAr: 'نساعدك تستهدف الجمهور الأنسب لخدمتك، وتجيب فرص مبيعات قابلة للمتابعة',
    descEn: 'We help you target the right audience for your service and bring in opportunities you can act on',
  },
  {
    slug: 'ai-sales',
    ar: 'أدوات الذكاء الاصطناعي',
    en: 'AI for Sales',
    icon: iconOutsideSales,
    fx: 6,
    descAr: 'نستخدم التحليل والأدوات الذكية لفهم الأداء، كشف الفرص، وتحسين قرارات البيع',
    descEn: 'We use analytics and smart tools to understand performance, uncover opportunities, and sharpen sales decisions',
  },
  {
    slug: 'marketers',
    ar: 'التسويق',
    en: 'Marketing',
    badge: true,
    icon: iconMarketers,
    fx: 1,
    href: '/marketers',
    descAr: 'ندير لك حملاتك الإعلانية ونحسن ظهورك في محركات البحث من خلال الـ SEO',
    descEn: 'We run your digital marketing from Google to social media, with a clear monthly plan',
  },
]

function ServicePanel({ service, index, fxActive }: { service: Service; index: number; fxActive: boolean }) {
  const { lang, L } = useLang()

  return (
    <article className="svc-panel" style={{ '--i': index } as CSSProperties}>
      {/* GPU budget: the deck's sticky panels all keep intersecting once
          pinned, so visibility is driven by deck scroll progress
          (active ± 1) instead of per-panel observers */}
      <ActiveFx variant={service.fx} active={fxActive} />
      {service.badge ? (
        <span className="featured-badge">
          {L('جديـــــــد', 'NEW')}
          <img className="badge-star" src={badgeStar} alt="" />
        </span>
      ) : null}
      <span className="svc-panel-index" dir="ltr" aria-hidden="true">{`0${index + 1}`}</span>
      <div className="svc-panel-copy">
        <img className="svc-icon" src={service.icon} alt="" width={104} height={104} />
        <h3 lang={service.latin ? 'en' : undefined}>{L(service.ar, service.en)}</h3>
        <p>{L(service.descAr, service.descEn)}</p>
        <a className="svc-cta" href={service.href ?? `/services/${service.slug}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
          {L('استكشف الخدمة', 'Explore Service')}
          <svg className="cta-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M19 12H5m0 0 6-6m-6 6 6 6" />
          </svg>
        </a>
      </div>
    </article>
  )
}

function ServicesIndex() {
  const { L } = useLang()

  /* deck scroll progress → which panel is in focus; only active ± 1
     hold a live GPU scene, and none while the deck is offscreen */
  const deckRef = useRef<HTMLDivElement>(null)
  const [activeIdx, setActiveIdx] = useState(0)
  const [deckVisible, setDeckVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      const el = deckRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const total = el.offsetHeight - window.innerHeight
      if (total <= 0) return
      const progress = Math.min(0.999, Math.max(0, -rect.top / total))
      setActiveIdx(Math.floor(progress * SERVICES.length))
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  useEffect(() => {
    const el = deckRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => setDeckVisible(entries[0].isIntersecting),
      { rootMargin: '120px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  /* card deck: each panel pins under the header while the next slides
     up over it (pure position: sticky — native on mobile, no libs) */
  return (
    <section className="svc-section svc-section--deck">
      <div className="section-heading">
        <p className="eyebrow">{L('الخدمات', 'Services')}</p>
        <div className="heading-group">
          <h2>{L('حلول تساعدك تزيد مبيعاتك وتفتح فرص نمو أكبر', 'Solutions that grow your sales and open bigger opportunities')}</h2>
          <p className="heading-desc">{L('نشتغل معك حسب احتياجك، سواء كنت تحتاج فريق مبيعات يساعدك في توليد العملاء المحتملين، إدارة عملية البيع وقياس وتحسين الأداء، أو فريق تسويق يدير حملاتك الإعلانية ويحسّن ظهورك في محركات البحث من خلال الـ SEO', 'We work around your needs — a sales team to generate leads, run your sales process and measure and improve performance, or a marketing team to run your ad campaigns and grow your search visibility through SEO')}</p>
        </div>
      </div>
      <div className="svc-deck" ref={deckRef}>
        {SERVICES.map((s, i) => (
          <ServicePanel service={s} index={i} fxActive={deckVisible && Math.abs(i - activeIdx) <= 1} key={s.slug} />
        ))}
      </div>
    </section>
  )
}

function RequestForm({ service }: { service: Service }) {
  const { dark } = usePageTheme()
  const { L } = useLang()
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (status === 'sending') return
    const payload = leadFromForm(event.currentTarget, { form: 'service-request' })
    setStatus('sending')
    const ok = await submitLead(payload)
    setStatus(ok ? 'sent' : 'error')
    if (ok) window.scrollTo({ top: 0 })
  }

  if (status === 'sent') {
    /* success state per Figma 5:3609 */
    return (
      <div className="contact-panel svc-success" role="status">
        <ContactFx dark={dark} />
        <div className="svc-success-inner">
          <svg className="svc-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m4.5 12.5 5 5 10-11" />
          </svg>
          <h2>{L('تم استلام طلبك بنجاح', 'Your request has been received')}</h2>
          <p>{L('وصلنا طلبك، وراح يراجعه فريق SalesUp ويتواصل معك قريبًا لمناقشة احتياجك واقتراح الأنسب لك', 'We got your request — the SalesUp team will review it and contact you soon to discuss your needs and suggest the best fit.')}</p>
          <a className="button button--submit" href="/">{L('العودة الى الرئيسية', 'Back to Home')}</a>
        </div>
      </div>
    )
  }

  return (
    <div className="contact-panel svc-request">
      <ContactFx dark={dark} />
      <div className="contact-inner">
        <p className="svc-form-intro">{L('عبّ النموذج، وتأكد من التفاصيل و يتم التواصل معك لمراجعة احتياجك واقتراح الأنسب', "Fill in the form and confirm the details — we'll contact you to review your needs and suggest the best fit")}</p>
        <form className="contact-form" onSubmit={handleSubmit}>
          <div className="field-row">
            <input className="field" name="name" type="text" placeholder={L('الاسم*', 'Name*')} aria-label={L('الاسم', 'Name')} autoComplete="name" required />
            <input className="field" name="phone" type="tel" placeholder={L('رقم الجوال*', 'Phone*')} aria-label={L('رقم الجوال', 'Phone')} autoComplete="tel" required />
          </div>
          <div className="field-row">
            <input className="field" name="email" type="email" pattern={EMAIL_PATTERN} title={L('اكتب بريدًا كاملاً مثل name@example.com', 'Enter a complete email, e.g. name@example.com')} placeholder={L('الايميل', 'Email')} aria-label={L('الايميل', 'Email')} autoComplete="email" />
            <Select
              name="service"
              ariaLabel={L('الخدمة', 'Service')}
              placeholder={L('اختر الخدمة*', 'Choose a service*')}
              options={SERVICES.filter((s) => !s.href).map((s) => ({ value: s.slug, label: L(s.ar, s.en) }))}
              defaultValue={service.slug}
              required
            />
          </div>
          <div className="field-row">
            <input className="field" name="org" type="text" placeholder={L('اسم الجهة', 'Company name')} aria-label={L('اسم الجهة', 'Company name')} autoComplete="organization" />
            <input className="field" name="notes" type="text" placeholder={L('ملاحظات', 'Notes')} aria-label={L('ملاحظات', 'Notes')} />
          </div>
          <input className="hp-field" name="website" type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" />
          <div className="form-action">
            <button className="button button--submit" type="submit" disabled={status === 'sending'}>
              {status === 'sending' ? L('جارٍ الإرسال…', 'Sending…') : L('ارسل طلبك', 'Send Request')}
            </button>
            {status === 'error' ? <p className="form-status form-status--error" role="alert">{L('تعذّر إرسال الطلب. حاول مرة أخرى، أو راسلنا مباشرة على hi@salesup.sa', "Couldn't send your request. Please try again, or email us directly at hi@salesup.sa")}</p> : null}
          </div>
        </form>
      </div>
    </div>
  )
}

function Faqs({ faqs }: { faqs: Faq[] }) {
  const { L } = useLang()
  const [open, setOpen] = useState(0)
  return (
    <div className="svc-faq">
      <p className="eyebrow">{L('أسئلة شائعة', 'FAQ')}</p>
      <h2>{L('الأسئلة الشائعة', 'Frequently Asked Questions')}</h2>
      <div className="svc-faq-list">
        {faqs.map((f, i) => {
          const isOpen = i === open
          return (
            <div className={`svc-faq-item${isOpen ? ' is-open' : ''}`} key={f.qAr}>
              <button
                type="button"
                className="svc-faq-head"
                aria-expanded={isOpen}
                aria-controls={`faq-${i}`}
                onClick={() => setOpen(isOpen ? -1 : i)}
              >
                <span>{L(f.qAr, f.qEn)}</span>
                <svg className="svc-faq-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>
              <div className="svc-faq-body" id={`faq-${i}`}>
                <p>{L(f.aAr, f.aEn)}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* checklist card: what the service includes / who it suits */
function DetailList({ title, items }: { title: string; items: Line[] }) {
  const { L } = useLang()
  return (
    <article className="svc-detail-card">
      <h3>{title}</h3>
      <ul className="svc-detail-list">
        {items.map((item) => (
          <li key={item.ar}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m5 12.5 4.5 4.5L19 7.5" />
            </svg>
            <span>{L(item.ar, item.en)}</span>
          </li>
        ))}
      </ul>
    </article>
  )
}

function ServiceDetail({ service }: { service: Service }) {
  const { L } = useLang()
  const name = L(service.ar, service.en)
  return (
    <section className="svc-section svc-section--detail">
      <div className="svc-detail-heading">
        <p className="eyebrow">{L('الخدمات', 'Services')}</p>
        <h2>{name}</h2>
        <p className="svc-detail-desc">{L(service.detailAr ?? service.descAr, service.detailEn ?? service.descEn)}</p>
      </div>

      {service.intro ? (
        <div className="svc-detail-body">
          {service.intro.map((p) => (
            <p key={p.ar}>{L(p.ar, p.en)}</p>
          ))}
        </div>
      ) : null}

      {service.includes || service.suitedFor ? (
        <div className="svc-detail-cards">
          {service.includes ? (
            <DetailList
              title={L(`تشمل خدمة ${service.ar}:`, `What ${service.en} includes:`)}
              items={service.includes}
            />
          ) : null}
          {service.suitedFor ? (
            <DetailList
              title={L(
                `خدمة ${service.ar} مناسبة لك إذا كنت تبغى:`,
                `${service.en} is right for you if you want to:`
              )}
              items={service.suitedFor}
            />
          ) : null}
        </div>
      ) : null}

      <RequestForm service={service} />
      {service.faqs ? <Faqs faqs={service.faqs} /> : null}
    </section>
  )
}

export default function ServicesPage() {
  const path = window.location.pathname.replace(/\/+$/, '')
  const slug = path.match(/^\/services\/([^/]+)$/)?.[1]
  const service = slug ? SERVICES.find((s) => s.slug === slug && !s.href) : undefined

  return (
    <PageShell active="services">
      {service ? <ServiceDetail service={service} /> : <ServicesIndex />}
    </PageShell>
  )
}
