import { FormEvent, useState } from 'react'
import { PageShell } from '../shared/PageShell'
import { useLang } from '../shared/i18n'
import { usePageTheme } from '../shared/theme'
import { CardFx, COARSE_POINTER, ContactFx, InViewFx } from '../components/CardFx'

import iconInsideSales from '../assets/icon-inside-sales.png'
import iconOutsideSales from '../assets/icon-outside-sales.png'
import iconMarketers from '../assets/icon-marketers.png'
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
  },
  {
    slug: 'sales-development',
    ar: 'تطوير المبيعات',
    en: 'Sales Development',
    icon: iconOutsideSales,
    fx: 0,
    descAr: 'نراجع طريقة البيع الحالية، ونرتّب خطوات المتابعة، والإغلاق بشكل أوضح',
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
    ar: 'الـ AI للمبيعات',
    en: 'AI for Sales',
    icon: iconOutsideSales,
    fx: 6,
    descAr: 'نستخدم التحليل والأدوات الذكية لفهم الأداء، كشف الفرص، وتحسين قرارات البيع',
    descEn: 'We use analytics and smart tools to understand performance, uncover opportunities, and sharpen sales decisions',
  },
  {
    slug: 'marketers',
    ar: 'Marketers',
    en: 'Marketers',
    latin: true,
    badge: true,
    icon: iconMarketers,
    fx: 1,
    href: '/marketers',
    descAr: 'نرتّب لك تسويقك الرقمي من قوقل إلى السوشال، بخطة شهرية واضحة',
    descEn: 'We run your digital marketing from Google to social media, with a clear monthly plan',
  },
]

function ServicesIndex() {
  const { lang, L } = useLang()
  return (
    <section className="svc-section">
      <div className="section-heading">
        <p className="eyebrow">{L('الخدمات', 'Services')}</p>
        <div className="heading-group">
          <h2>{L('حلول تساعدك ترتّب المبيعات وتفتح فرص نمو أوضح', 'Solutions that organize your sales and open clearer growth opportunities')}</h2>
          <p className="heading-desc">{L('نشتغل معك حسب احتياجك، سواء كنت تحتاج فريق يدعم مبيعاتك، توليد عملاء محتملين، تطوير عملية البيع، أو حلول تساعدك تقيس وتحسّن الأداء', 'We work around your needs — a team to support your sales, lead generation, sales-process development, or tools to measure and improve performance')}</p>
        </div>
      </div>
      <div className="svc-grid">
        {SERVICES.map((s) => (
          <a className="svc-card" href={s.href ?? `/services/${s.slug}`} key={s.slug}>
            {COARSE_POINTER ? <InViewFx variant={s.fx} /> : <CardFx variant={s.fx} />}
            {s.badge ? (
              <span className="featured-badge">
                {L('جديـــــــد', 'NEW')}
                <img className="badge-star" src={badgeStar} alt="" />
              </span>
            ) : null}
            <div className="svc-card-inner">
              <img className="svc-icon" src={s.icon} alt="" width={96} height={96} />
              <h3 lang={s.latin ? 'en' : undefined}>{L(s.ar, s.en)}</h3>
              <p>{L(s.descAr, s.descEn)}</p>
              <span className="svc-cta" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                {L('استكشف الخدمة', 'Explore Service')}
                <svg className="cta-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M19 12H5m0 0 6-6m-6 6 6 6" />
                </svg>
              </span>
            </div>
          </a>
        ))}
      </div>
    </section>
  )
}

function RequestForm({ service }: { service: Service }) {
  const { dark } = usePageTheme()
  const { L } = useLang()
  const [sent, setSent] = useState(false)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSent(true)
    window.scrollTo({ top: 0 })
  }

  if (sent) {
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
            <input className="field" name="email" type="email" placeholder={L('الايميل', 'Email')} aria-label={L('الايميل', 'Email')} autoComplete="email" />
            <select className="field svc-select" name="service" aria-label={L('الخدمة', 'Service')} defaultValue={service.slug}>
              {SERVICES.filter((s) => !s.href).map((s) => (
                <option value={s.slug} key={s.slug}>{L(s.ar, s.en)}</option>
              ))}
            </select>
          </div>
          <div className="field-row">
            <input className="field" name="org" type="text" placeholder={L('اسم الجهة', 'Company name')} aria-label={L('اسم الجهة', 'Company name')} autoComplete="organization" />
            <input className="field" name="notes" type="text" placeholder={L('ملاحظات', 'Notes')} aria-label={L('ملاحظات', 'Notes')} />
          </div>
          <div className="form-action">
            <button className="button button--submit" type="submit">{L('ارسل طلبك', 'Send Request')}</button>
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

function ServiceDetail({ service }: { service: Service }) {
  const { L } = useLang()
  return (
    <section className="svc-section svc-section--detail">
      <div className="svc-detail-heading">
        <p className="eyebrow">{L('الخدمات', 'Services')}</p>
        <h2>{L(service.ar, service.en)}</h2>
        <p className="svc-detail-desc">{L(service.detailAr ?? service.descAr, service.detailEn ?? service.descEn)}</p>
      </div>
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
