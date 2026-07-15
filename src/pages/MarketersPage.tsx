import { FormEvent, useState } from 'react'
import { PageShell } from '../shared/PageShell'
import { useLang } from '../shared/i18n'
import { usePageTheme } from '../shared/theme'
import { Select } from '../shared/Select'
import { ContactFx } from '../components/CardFx'
import contactGlow from '../assets/contact-glow.svg'

/*
 * خدمة ماركتيرز — the Marketers funnel.
 * Figma: 5:2379 (services tab: SEO 3,000 + campaigns 3,900), 5:2494
 * (packages tab: basic 6,900 + professional 8,000), 5:2618…5:3268
 * (request form + select states, services/packages variants), 5:3350
 * (success). `/marketers` = main page with a services⇄packages toggle;
 * `/marketers/apply` = request form (mode + preselection via query
 * params, e.g. ?type=package&pick=pro); submit swaps to the success
 * panel per Figma. FAQ answers are authored (collapsed in Figma) —
 * flagged in the handback.
 */

type Bi = { ar: string; en: string }
type Faq = { q: Bi; a: Bi }
type Plan = {
  key: string
  kicker: Bi
  name: Bi
  price: string
  note: Bi
  features: Bi[]
  brief?: Bi
}

const T = {
  heroTitleA: { ar: 'خلّ حضورك الرقمي ', en: 'Take your digital presence ' },
  heroTitleB: { ar: 'يوصل أبعد', en: 'further' },
  heroDesc: {
    ar: 'من خلال الخدمات والباقات التسويقية راح نساعدك تفوّق ظهورك في محركات البحث، ونطلق حملات إعلانية أوضح تناسب هدفك ومرحلتك',
    en: 'With our marketing services and packages we lift your search visibility and run clearer ad campaigns that fit your goal and stage',
  },
  tabServices: { ar: 'الخدمات', en: 'Services' },
  tabPackages: { ar: 'الباقات', en: 'Packages' },
  currency: { ar: 'ريال / شهرياً', en: 'SAR / month' },
  order: { ar: 'اطلب الخدمة الآن', en: 'Order Now' },
  includes: { ar: 'تشمل :', en: 'Includes:' },
  brief: { ar: 'وصف مختصر :', en: 'In short:' },
  faqEyebrow: { ar: 'أسئلة شائعة', en: 'FAQ' },
  faqTitle: { ar: 'الأسئلة الشائعة', en: 'Frequently Asked Questions' },
  contactTitle: { ar: 'تواصل معنا الآن', en: 'Contact Us Now' },
  contactDesc: {
    ar: 'تقدر تحصل على استشارة مجانية أو مزيد من المعلومات حول خدماتنا ، و ترا فريقنا مستعد لمساعدتك دائــماً',
    en: 'Get a free consultation or more details about our services — our team is always ready to help',
  },
  contactBtn: { ar: 'اضغط هنا', en: 'Click Here' },
  applyEyebrow: { ar: 'طلب الخدمة', en: 'Service Request' },
  applyTitle: { ar: 'ابدأ طلبك بخطوة بسيطة', en: 'Start your request with one simple step' },
  applyLead: {
    ar: 'عبّ النموذج، وتأكد من التفاصيل و بيتم التواصل معك لمراجعة احتياجك واقتراح الأنسب',
    en: "Fill in the form and check the details — we'll contact you to review your needs and suggest what fits best",
  },
  fName: { ar: 'الاسم*', en: 'Name*' },
  fPhone: { ar: 'رقم الجوال*', en: 'Phone*' },
  fEmail: { ar: 'الايميل', en: 'Email' },
  fLink: { ar: 'رابط المنتج / الخدمة*', en: 'Product / service link*' },
  fNotes: { ar: 'ملاحظات', en: 'Notes' },
  fPickService: { ar: 'اختر الخدمة*', en: 'Choose a service*' },
  fPickPackage: { ar: 'اختر الباقة*', en: 'Choose a package*' },
  submit: { ar: 'ارسل طلبك', en: 'Send Request' },
  successTitle: { ar: 'تم استلام طلبك بنجاح', en: 'Your request has been received' },
  successDesc: {
    ar: 'وصلنا طلبك، وراح يراجعه فريق SalesUp ويتواصل معك قريبًا لمناقشة احتياجك واقتراح الأنسب لك',
    en: 'Your request is in — the SalesUp team will review it and reach out soon to discuss your needs and recommend what fits best',
  },
  backHome: { ar: 'العودة الى الرئيسية', en: 'Back to Home' },
}

const SERVICES: Plan[] = [
  {
    key: 'seo',
    kicker: { ar: 'الخدمة الأولى', en: 'First Service' },
    name: { ar: 'تحسين محركات البحث SEO', en: 'Search Engine Optimization (SEO)' },
    price: '3,000',
    note: { ar: 'عند الاشتراك لمدة 3 شهور', en: 'with a 3-month subscription' },
    features: [
      { ar: 'تحليل الموقع والمنافسين', en: 'Site and competitor analysis' },
      { ar: 'بحث الكلمات المفتاحية', en: 'Keyword research' },
      { ar: 'تحسين الصفحات والمحتوى', en: 'Page and content optimization' },
      { ar: 'تحسين الصور والروابط', en: 'Image and link optimization' },
      { ar: 'مقالات للمدونة', en: 'Blog articles' },
      { ar: 'مراجعة الأداء والسرعة', en: 'Performance and speed reviews' },
      { ar: 'تحديث Sitemap و robots.txt', en: 'Sitemap and robots.txt upkeep' },
    ],
  },
  {
    key: 'campaigns',
    kicker: { ar: 'الخدمة الثانية', en: 'Second Service' },
    name: { ar: 'إدارة الحملات الإعلانية', en: 'Ad Campaign Management' },
    price: '3,900',
    note: { ar: 'عند الاشتراك لمدة 3 شهور', en: 'with a 3-month subscription' },
    features: [
      { ar: 'تحليل الموقع والمنافسين', en: 'Site and competitor analysis' },
      { ar: 'استراتيجية إعلانية', en: 'Advertising strategy' },
      { ar: 'تجهيز وربط الحسابات', en: 'Account setup and linking' },
      { ar: 'ربط Pixel و Analytics', en: 'Pixel and Analytics integration' },
      { ar: 'تجهيز محتوى الإعلانات', en: 'Ad content production' },
      { ar: 'تشغيل وتحسين الحملات', en: 'Campaign launch and optimization' },
      { ar: 'تقارير يومية وشهرية', en: 'Daily and monthly reports' },
    ],
  },
]

const PACKAGES: Plan[] = [
  {
    key: 'basic',
    kicker: { ar: 'الباقة الأساسية', en: 'Basic Package' },
    name: { ar: 'الباقة الأساسية', en: 'Basic Package' },
    price: '6,900',
    note: { ar: 'عند الاشتراك لمدة 3 شهور', en: 'with a 3-month subscription' },
    features: [
      { ar: 'الـ SEO تحسين محركات البحث', en: 'SEO — search engine optimization' },
      { ar: 'إدارة الحملات الإعلانية', en: 'Ad campaign management' },
    ],
    brief: {
      ar: 'مناسب إذا تبغى تجمع بين تحسين ظهورك في قوقل وإدارة حملاتك الإعلانية ضمن خطة شهرية واضحة',
      en: 'Right if you want Google visibility and ad campaign management combined in one clear monthly plan',
    },
  },
  {
    key: 'pro',
    kicker: { ar: 'الباقة الاحترافية', en: 'Professional Package' },
    name: { ar: 'الباقة الاحترافية', en: 'Professional Package' },
    price: '8,000',
    note: { ar: 'عند الاشتراك لمدة 3 شهور', en: 'with a 3-month subscription' },
    features: [
      { ar: 'الـ SEO تحسين محركات البحث', en: 'SEO — search engine optimization' },
      { ar: 'إدارة الحملات الإعلانية', en: 'Ad campaign management' },
      { ar: 'إدارة الموقع الإلكتروني', en: 'Website management' },
    ],
    brief: {
      ar: 'باقة أوسع إذا تحتاج دعم تسويقي يشمل الظهور، الحملات، وإدارة الموقع الإلكتروني ضمن خطة واحدة',
      en: 'A wider package when you need marketing support covering visibility, campaigns, and website management in one plan',
    },
  },
]

/* FAQ questions are Figma-verbatim; answers are authored (collapsed in
   Figma) and flagged for client review in the handback. */
const FAQS_SERVICES: Faq[] = [
  {
    q: { ar: 'وش الفرق بين SEO وإدارة الحملات؟', en: 'What is the difference between SEO and campaign management?' },
    a: {
      ar: 'الـ SEO يحسّن ظهورك المجاني في نتائج البحث على المدى الطويل، بينما إدارة الحملات تجيب لك نتائج أسرع عبر إعلانات مدفوعة — والاثنين يكملون بعض.',
      en: 'SEO grows your organic search visibility over the long run, while campaign management brings faster results through paid ads — and the two complement each other.',
    },
  },
  {
    q: { ar: 'متى تظهر نتائج SEO؟', en: 'When do SEO results show?' },
    a: {
      ar: 'عادة تبدأ تلاحظ تحسن الظهور خلال ٢–٣ شهور، والنتائج الأوضح تجي بعد استمرارية ٦ شهور تقريباً حسب المنافسة في مجالك.',
      en: 'You typically notice visibility improving within 2–3 months, with clearer results around 6 months of consistency depending on competition in your field.',
    },
  },
  {
    q: { ar: 'هل السعر يشمل ميزانية الإعلانات؟', en: 'Does the price include the ad budget?' },
    a: {
      ar: 'لا — السعر يغطي الإدارة والتشغيل والتحسين، وميزانية الإعلانات تحددها أنت وتدفعها مباشرة للمنصات الإعلانية.',
      en: 'No — the price covers management, operation, and optimization; you set the ad budget and pay it directly to the ad platforms.',
    },
  },
  {
    q: { ar: 'هل أقدر أختار خدمة وحدة؟', en: 'Can I pick just one service?' },
    a: {
      ar: 'أكيد، تقدر تشترك في الـ SEO أو إدارة الحملات بشكل مستقل — وإذا احتجت الاثنين لاحقاً تقدر ترقّي لباقة.',
      en: 'Absolutely — you can subscribe to SEO or campaign management on its own, and upgrade to a package later if you need both.',
    },
  },
  {
    q: { ar: 'وش يصير بعد ما أطلب الخدمة؟', en: 'What happens after I place a request?' },
    a: {
      ar: 'يتواصل معك فريقنا خلال يوم عمل لمراجعة احتياجك، وبعدها نجهّز خطة البداية ونطلق الشغل خلال أيام.',
      en: 'Our team contacts you within one business day to review your needs, then we prepare the kickoff plan and start within days.',
    },
  },
]

const FAQS_PACKAGES: Faq[] = [
  {
    q: { ar: 'وش تشمل الباقة الأساسية؟', en: 'What does the Basic package include?' },
    a: {
      ar: 'الـ SEO وإدارة الحملات الإعلانية مع بعض في خطة شهرية وحدة — تحسين ظهورك في قوقل وتشغيل إعلاناتك بميزانية أوضح.',
      en: 'SEO and ad campaign management together in one monthly plan — improving your Google visibility and running your ads with a clearer budget.',
    },
  },
  {
    q: { ar: 'وش تشمل الباقة الاحترافية؟', en: 'What does the Professional package include?' },
    a: {
      ar: 'كل اللي في الأساسية، وإضافة إدارة الموقع الإلكتروني: تحديثات، تحسينات مستمرة، ومتابعة تقنية شاملة.',
      en: 'Everything in Basic, plus website management: updates, continuous improvements, and full technical upkeep.',
    },
  },
  {
    q: { ar: 'كم مدة الاشتراك؟', en: 'How long is the subscription?' },
    a: {
      ar: 'الأسعار الموضحة عند الاشتراك لمدة ٣ شهور — وهي المدة الأنسب لبناء نتائج واضحة وقابلة للقياس.',
      en: 'The listed prices apply to a 3-month subscription — the right window to build clear, measurable results.',
    },
  },
  {
    q: { ar: 'وش الفرق بين الباقة الأساسية والاحترافية؟', en: 'What is the difference between Basic and Professional?' },
    a: {
      ar: 'الاحترافية تضيف إدارة الموقع الإلكتروني فوق الـ SEO والحملات — الأنسب إذا تحتاج جهة وحدة تدير حضورك الرقمي كامل.',
      en: 'Professional adds website management on top of SEO and campaigns — best if you want one team running your entire digital presence.',
    },
  },
  {
    q: { ar: 'هل أقدر أختار خدمة بدل باقة؟', en: 'Can I pick a single service instead of a package?' },
    a: {
      ar: 'نعم — بدّل لتبويب الخدمات واشترك في الـ SEO أو إدارة الحملات بشكل مستقل حسب احتياجك.',
      en: 'Yes — switch to the Services tab and subscribe to SEO or campaign management independently, as your needs require.',
    },
  },
]

type Tab = 'services' | 'packages'

function PlanCard({ plan, tab }: { plan: Plan; tab: Tab }) {
  const { L } = useLang()
  return (
    <article className="mk-card">
      <div className="mk-card-head">
        <p className="mk-kicker">{L(plan.kicker.ar, plan.kicker.en)}</p>
        {tab === 'services' ? <h3>{L(plan.name.ar, plan.name.en)}</h3> : null}
        <p className="mk-price" dir="ltr">
          <strong>{plan.price}</strong>
          <span>{L(T.currency.ar, T.currency.en)}</span>
        </p>
        <p className="mk-note">{L(plan.note.ar, plan.note.en)}</p>
        <a className="mk-order" href={`/marketers/apply?type=${tab === 'services' ? 'service' : 'package'}&pick=${plan.key}`}>
          {L(T.order.ar, T.order.en)}
        </a>
      </div>
      <div className="mk-card-body">
        <p className="mk-list-label">{L(T.includes.ar, T.includes.en)}</p>
        <ul className="mk-features">
          {plan.features.map((f) => (
            <li key={f.ar}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="m5 12.5 4.5 4.5L19 7.5" />
              </svg>
              <span>{L(f.ar, f.en)}</span>
            </li>
          ))}
        </ul>
        {plan.brief ? (
          <>
            <p className="mk-list-label">{L(T.brief.ar, T.brief.en)}</p>
            <p className="mk-brief">{L(plan.brief.ar, plan.brief.en)}</p>
          </>
        ) : null}
      </div>
    </article>
  )
}

function FaqList({ faqs }: { faqs: Faq[] }) {
  const { L } = useLang()
  const [open, setOpen] = useState(0)
  return (
    <div className="mk-faq">
      <div className="mk-faq-heading">
        <p className="eyebrow">{L(T.faqEyebrow.ar, T.faqEyebrow.en)}</p>
        <h2>{L(T.faqTitle.ar, T.faqTitle.en)}</h2>
      </div>
      <div className="mk-faq-list">
        {faqs.map((f, i) => {
          const isOpen = i === open
          return (
            <div className={`mk-faq-item${isOpen ? ' is-open' : ''}`} key={f.q.ar}>
              <button
                type="button"
                className="mk-faq-q"
                aria-expanded={isOpen}
                onClick={() => setOpen(isOpen ? -1 : i)}
              >
                <span>{L(f.q.ar, f.q.en)}</span>
                <svg className="mk-faq-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>
              <div className="mk-faq-a">
                <div className="mk-faq-a-inner">
                  <p>{L(f.a.ar, f.a.en)}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function MarketersMain() {
  const { L } = useLang()
  const { dark } = usePageTheme()
  const [tab, setTab] = useState<Tab>('services')
  const plans = tab === 'services' ? SERVICES : PACKAGES

  return (
    <section className="mk-section">
      {/* hero panel with the services⇄packages switch (Figma 5:2379/5:2494) */}
      <div className="contact-panel mk-hero">
        <ContactFx dark={dark} />
        <img className="contact-glow" src={contactGlow} alt="" aria-hidden="true" />
        <div className="mk-hero-inner">
          <h1>
            {L(T.heroTitleA.ar, T.heroTitleA.en)}
            <em>{L(T.heroTitleB.ar, T.heroTitleB.en)}</em>
          </h1>
          <p>{L(T.heroDesc.ar, T.heroDesc.en)}</p>
          <div className="mk-tabs" role="tablist" aria-label={L('نوع الاشتراك', 'Subscription type')}>
            <span className={`mk-tabs-thumb${tab === 'packages' ? ' is-end' : ''}`} aria-hidden="true" />
            <button role="tab" type="button" aria-selected={tab === 'services'} className={tab === 'services' ? 'is-active' : ''} onClick={() => setTab('services')}>
              {L(T.tabServices.ar, T.tabServices.en)}
            </button>
            <button role="tab" type="button" aria-selected={tab === 'packages'} className={tab === 'packages' ? 'is-active' : ''} onClick={() => setTab('packages')}>
              {L(T.tabPackages.ar, T.tabPackages.en)}
            </button>
          </div>
        </div>
      </div>

      <div className="mk-cards" key={tab}>
        {plans.map((p) => (
          <PlanCard plan={p} tab={tab} key={p.key} />
        ))}
      </div>

      <FaqList faqs={tab === 'services' ? FAQS_SERVICES : FAQS_PACKAGES} key={`faq-${tab}`} />

      {/* closing contact banner (Figma تواصل معنا الآن) */}
      <div className="contact-panel mk-contact">
        <ContactFx dark={dark} />
        <div className="mk-contact-inner">
          <h2>{L(T.contactTitle.ar, T.contactTitle.en)}</h2>
          <p>{L(T.contactDesc.ar, T.contactDesc.en)}</p>
          <a className="button button--submit mk-contact-btn" href="/#contact">{L(T.contactBtn.ar, T.contactBtn.en)}</a>
        </div>
      </div>
    </section>
  )
}

function MarketersApply() {
  const { L } = useLang()
  const { dark } = usePageTheme()
  const params = new URLSearchParams(window.location.search)
  const type: Tab = params.get('type') === 'package' ? 'packages' : 'services'
  const pick = params.get('pick') ?? ''
  const options = type === 'services' ? SERVICES : PACKAGES
  const [sent, setSent] = useState(false)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSent(true)
    window.scrollTo({ top: 0 })
  }

  if (sent) {
    return (
      <section className="mk-section mk-section--apply">
        <p className="contact-eyebrow">{L(T.applyEyebrow.ar, T.applyEyebrow.en)}</p>
        <div className="contact-panel mk-success" role="status">
          <ContactFx dark={dark} />
          <div className="mk-success-inner">
            <span className="mk-check" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="m4.5 12.5 5 5 10-11" />
              </svg>
            </span>
            <h2>{L(T.successTitle.ar, T.successTitle.en)}</h2>
            <p>{L(T.successDesc.ar, T.successDesc.en)}</p>
            <a className="button button--submit" href="/">{L(T.backHome.ar, T.backHome.en)}</a>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="mk-section mk-section--apply">
      <p className="contact-eyebrow">{L(T.applyEyebrow.ar, T.applyEyebrow.en)}</p>
      <h1 className="mk-apply-title">{L(T.applyTitle.ar, T.applyTitle.en)}</h1>
      <div className="contact-panel mk-apply">
        <ContactFx dark={dark} />
        <img className="contact-glow" src={contactGlow} alt="" aria-hidden="true" />
        <div className="mk-apply-inner">
          <p className="mk-apply-lead">{L(T.applyLead.ar, T.applyLead.en)}</p>
          <form className="mk-form" onSubmit={handleSubmit}>
            <div className="mk-form-row">
              <input className="field" name="name" type="text" placeholder={L(T.fName.ar, T.fName.en)} aria-label={L('الاسم', 'Name')} autoComplete="name" required />
              <input className="field" name="phone" type="tel" placeholder={L(T.fPhone.ar, T.fPhone.en)} aria-label={L('رقم الجوال', 'Phone')} autoComplete="tel" required />
            </div>
            <div className="mk-form-row">
              <input className="field" name="email" type="email" placeholder={L(T.fEmail.ar, T.fEmail.en)} aria-label={L('الايميل', 'Email')} autoComplete="email" />
              <Select
                name="plan"
                ariaLabel={type === 'services' ? L('الخدمة', 'Service') : L('الباقة', 'Package')}
                placeholder={type === 'services' ? L(T.fPickService.ar, T.fPickService.en) : L(T.fPickPackage.ar, T.fPickPackage.en)}
                options={options.map((o) => ({ value: o.key, label: L(o.name.ar, o.name.en) }))}
                defaultValue={options.some((o) => o.key === pick) ? pick : ''}
                required
              />
            </div>
            <div className="mk-form-row">
              <input className="field" name="link" type="url" placeholder={L(T.fLink.ar, T.fLink.en)} aria-label={L('رابط المنتج / الخدمة', 'Product / service link')} required />
              <input className="field" name="notes" type="text" placeholder={L(T.fNotes.ar, T.fNotes.en)} aria-label={L('ملاحظات', 'Notes')} />
            </div>
            <div className="form-action">
              <button className="button button--submit" type="submit">{L(T.submit.ar, T.submit.en)}</button>
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}

export default function MarketersPage({ apply = false }: { apply?: boolean }) {
  return (
    <PageShell active="services">
      {apply ? <MarketersApply /> : <MarketersMain />}
    </PageShell>
  )
}
