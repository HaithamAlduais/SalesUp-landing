import { CSSProperties, FormEvent, useEffect, useRef, useState } from 'react'
import { ActiveFx, COARSE_POINTER, ContactFx, HeroFx, InViewFx } from './components/CardFx'
import { leadFromForm, submitLead } from './components/leads'
import { PageShell } from './shared/PageShell'
import { usePageTheme } from './shared/theme'
import { useLang } from './shared/i18n'
import { CountUp } from './shared/ui'
import { SECTORS } from './data/sectors'

import maskSquiggleL from './assets/mask-squiggle-l.png'
import maskSquiggleR from './assets/mask-squiggle-r.png'
import decoAbout from './assets/deco-about.svg'
import starShape from './assets/star.svg'
import contactGlow from './assets/contact-glow.svg'
import badgeStar from './assets/badge-star.svg'

import iconFintech from './assets/icon-fintech.png'
import iconSaas from './assets/icon-saas.png'
import iconAgencies from './assets/icon-agencies.png'
import iconTech from './assets/icon-tech.png'
import iconInsideSales from './assets/icon-inside-sales.png'
import iconOutsideSales from './assets/icon-outside-sales.png'
import iconMarketers from './assets/icon-marketers.png'

import brandZid from './assets/brand-zid-trim.png'
import brandZidWhite from './assets/brand-zid-white.svg'
import brandMoc from './assets/brand-moc-trim.png'
import brandMocWhite from './assets/brand-moc-white.svg'
import brandEsar from './assets/brand-esar-trim.png'
import brandPin from './assets/brand-pin-trim.png'
import brandPinLight from './assets/brand-pin-light.png'
import brandNuzul from './assets/brand-nuzul-trim.png'
import brandFlyakeed from './assets/brand-flyakeed-trim.png'
import brandFlyakeedLight from './assets/brand-flyakeed-light.png'
import brandQubit from './assets/brand-qubit-trim.png'
import brandHatif from './assets/brand-hatif-trim.png'
import brandCarsvid from './assets/brand-carsvid-trim.png'

/*
 * Modern logo wall. Every brand renders monochrome-grey in light mode
 * (hover reveals its colors) and light-on-dark in dark mode:
 *  - mono:  dark-mode art via CSS silhouette (brightness(0) invert(1))
 *  - duo:   dedicated dark art (official white SVGs for zid/MoC, the
 *           brands' own white lockups for PIN/FlyAkeed)
 *  - badge: full-color badge art that works on both backgrounds (JOY)
 * `h` is the optical height in px, corrected per logo shape.
 */
const MARQUEE_BRANDS: {
  key: string
  alt: string
  h: number
  light: string
  dark?: string
  badge?: boolean
}[] = [
  { key: 'zid', alt: 'zid', h: 34, light: brandZid, dark: brandZidWhite },
  { key: 'moc', alt: 'Ministry of Culture', h: 54, light: brandMoc, dark: brandMocWhite },
  { key: 'esar', alt: 'إيسار', h: 36, light: brandEsar },
  { key: 'pin', alt: 'PIN', h: 36, light: brandPinLight, dark: brandPin },
  { key: 'nuzul', alt: 'NUZUL', h: 40, light: brandNuzul },
  { key: 'flyakeed', alt: 'FlyAkeed', h: 30, light: brandFlyakeedLight, dark: brandFlyakeed },
  { key: 'qubit', alt: 'Qubit', h: 30, light: brandQubit },
  { key: 'hatif', alt: 'هاتف HATIF', h: 34, light: brandHatif },
  { key: 'carsvid', alt: 'CARSVID', h: 32, light: brandCarsvid },
]

function MarqueeStrip() {
  return (
    <div className="marquee-strip" aria-hidden="true">
      {MARQUEE_BRANDS.map((b) => (
        <div
          className={`brand ${b.dark ? 'brand--duo' : b.badge ? 'brand--badge' : 'brand--mono'}`}
          style={{ '--h': b.h } as CSSProperties}
          key={b.key}
        >
          <img className="brand-art brand-art--light" src={b.light} alt={b.alt} loading="lazy" />
          {b.dark ? <img className="brand-art brand-art--dark" src={b.dark} alt="" loading="lazy" /> : null}
        </div>
      ))}
    </div>
  )
}

function Hero({ dark }: { dark: boolean }) {
  const { L } = useLang()
  return (
    <>
      <div className="band band--hero">
        <div className="hero-shader" aria-hidden="true">
          <HeroFx dark={dark} />
        </div>
        <section className="hero-copy-block" id="top">
          <div className="hero-copy">
            <h1>{L('نساعدك تزيــد مبيعـــاتك', 'We Help You Grow Your Sales')}</h1>
            <p>{L('سيلــز أب تبيع عنك خدماتك بفريق مبيعات احترافي مخصص لك', 'SalesUp sells your services for you — with a professional sales team dedicated to your business')}</p>
          </div>
        </section>
        <div className="stats" aria-label={L('أرقام SalesUp', 'SalesUp numbers')} dir="ltr">
          <div className="stat">
            <p className="stat-number"><CountUp target={8000} format />+</p>
            <p className="stat-label">{L('عدد الاستشارات', 'Consultations')}</p>
          </div>
          <div className="stat">
            <p className="stat-number"><CountUp target={5000} />+</p>
            <p className="stat-label">{L('فرصة مبيعات', 'Sales Opportunities')}</p>
          </div>
          <div className="stat">
            <p className="stat-number"><CountUp target={80} />+</p>
            <p className="stat-label">{L('عدد القطاعات', 'Sectors Served')}</p>
          </div>
        </div>
        <p className="marquee-label">{L('شركاء النجاح', 'Trusted by our partners')}</p>
        <div className="marquee" dir="ltr">
          <div className="marquee-track">
            <MarqueeStrip />
            <MarqueeStrip />
          </div>
        </div>
      </div>
    </>
  )
}

function About() {
  const { L } = useLang()
  const cards = [
    { title: L('مسار بيع أوضح', 'A Clearer Sales Path'), desc: L('نرتّب خطوات التواصل والمتابعة', 'We structure outreach and follow-up'), fx: 0 },
    { title: L('شريحة عملاء أكبر', 'A Bigger Customer Base'), desc: L('نوصل خدمتك للجمهور الأنسب', 'We take your service to the right audience'), fx: 1 },
    { title: L('حلول تناسب مرحلتك', 'Solutions That Fit Your Stage'), desc: L('نقترح الخدمة الأنسب حسب احتياجك', 'We recommend what suits your needs'), fx: 2 },
    { title: L('متابعة النمو', 'Growth You Can Track'), desc: L('نقيس الأداء ونحسّن الخطة', 'We measure performance and refine the plan'), fx: 3 },
  ]

  const [active, setActive] = useState(0)
  const [trackVisible, setTrackVisible] = useState(false)
  const trackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onScroll = () => {
      const el = trackRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const total = el.offsetHeight - window.innerHeight
      if (total <= 0) return
      const progress = Math.min(0.999, Math.max(0, -rect.top / total))
      setActive(Math.floor(progress * cards.length))
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [cards.length])

  /* release the active slide's GPU scene once the story is offscreen */
  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => setTrackVisible(entries[0].isIntersecting),
      { rootMargin: '120px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div className="band band--about">
      <section className="about-section" id="about">
        <div className="about-track" ref={trackRef}>
          <div className="about-viewport">
            {/* decorations live inside the sticky viewport so they hold
                their places on screen while the story plays */}
            <img className="deco-about" src={decoAbout} alt="" aria-hidden="true" />
            <div className="squiggle squiggle--left" aria-hidden="true" style={{ maskImage: `url(${maskSquiggleL})`, WebkitMaskImage: `url(${maskSquiggleL})` }}>
              <div className="squiggle-fill squiggle-fill--left" />
            </div>
            <div className="section-heading section-heading--end">
              <p className="eyebrow">{L('من نحن ', 'About Us')}</p>
              <div className="heading-group">
                <h2>{L('شريك يساعدك تحوّل الفرص إلى نمو واضح', 'A partner who turns opportunities into clear growth')}</h2>
                <p>{L('ركّز على تطوير منتجك، واترك لنا إدارة مبيعاتك من التخطيط إلى تحقيق نمو شهري مستدام, ندير رحلة العميل كاملة، من الوصول إلى العملاء المحتملين وحتى اتخاذ قرار الشراء.', 'Focus on building your product and leave your sales to us — from planning to sustainable monthly growth. We manage the full customer journey, from reaching prospects to the buying decision.')}</p>
              </div>
            </div>
            <div className="about-stage">
              {cards.map((c, i) => (
                <article
                  className={`about-slide${i === active ? ' is-active' : ''}${i < active ? ' is-passed' : ''}`}
                  key={c.title}
                  aria-hidden={i !== active}
                >
                  <ActiveFx variant={c.fx} active={i === active && trackVisible} />
                  <div className="about-slide-copy">
                    <span className="about-slide-index" dir="ltr">{`0${i + 1}`}</span>
                    <h3>{c.title}</h3>
                    <p>{c.desc}</p>
                  </div>
                </article>
              ))}
              <div className="about-dots" dir="ltr" role="presentation">
                {cards.map((c, i) => (
                  <span className={`about-dot${i === active ? ' is-active' : ''}`} key={c.title} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

function Sectors() {
  const { lang, L } = useLang()
  /* card body toggles a reveal (shader + short description); ONLY the
     اكتشف القطاع pill navigates — so touch users see the scene before
     leaving the page */
  const [open, setOpen] = useState<number | null>(null)
  const cards = [
    { slug: 'fintech', title: L('فنتك', 'Fintech'), icon: iconFintech, href: '/sectors/fintech' },
    { slug: 'saas', title: 'SaaS', icon: iconSaas, href: '/sectors/saas' },
    { slug: 'agencies', title: L('الوكالات الإعلانية', 'Ad Agencies'), icon: iconAgencies, href: '/sectors/agencies' },
    { slug: 'technology', title: L('تقنية المعلومات', 'Information Technology'), icon: iconTech, href: '/sectors/technology' },
  ]
  const toggle = (i: number) => setOpen((cur) => (cur === i ? null : i))
  return (
    <section className="sectors-section" id="sectors">
      <div className="section-heading">
        <p className="eyebrow">{L('القطاعات', 'Sectors')}</p>
        <div className="heading-group">
          <h2>{L('نشتغل مع قطاعات تحتاج مبيعات أوضح ونمو قابل للقياس', 'We work with sectors that need clearer sales and measurable growth')}</h2>
          <p className="heading-desc">{L('كل قطاع له طريقته في البيع والوصول للعميل، عشان كذا نشتغل معك بحلول تناسب طبيعة نشاطك وسوقك', 'Every sector sells and reaches customers differently — so we work with you on solutions that fit your business and your market')}</p>
        </div>
      </div>
      <div className="sector-grid" dir="ltr">
        {cards.map((c, i) => (
          <div
            className={`sector-card${open === i ? ' is-open' : ''}`}
            key={c.href}
            role="button"
            tabIndex={0}
            aria-expanded={open === i}
            onClick={() => toggle(i)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                toggle(i)
              }
            }}
          >
            {/* ambient scene on every device — softly on while the card
                is on screen; hover/open intensifies it */}
            <InViewFx variant={4 + i} />
            <div className="sector-card-inner">
              <img className="sector-icon" src={c.icon} alt="" width={134} height={134} />
              <h3>{c.title}</h3>
              <p className="sector-desc">{L(SECTORS[c.slug].descAr, SECTORS[c.slug].descEn)}</p>
              <a
                className="sector-cta"
                href={c.href}
                dir={lang === 'ar' ? 'rtl' : 'ltr'}
                onClick={(e) => e.stopPropagation()}
              >
                {L('اكتشف القطاع', 'Explore Sector')}
                <svg className="cta-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M19 12H5m0 0 6-6m-6 6 6 6" />
                </svg>
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function Services() {
  const { lang, L } = useLang()
  const services = [
    {
      key: 'marketers',
      title: 'Marketers',
      en: true,
      badge: true,
      icon: iconMarketers,
      desc: L('نرتّب لك تسويقك الرقمي من قوقل إلى السوشال ميديا ، بخطة شهرية واضحة', 'We run your digital marketing from Google to social media, with a clear monthly plan'),
      href: '/marketers',
      fx: 1,
    },
    {
      key: 'inside',
      title: L('المبيعات الداخلية', 'Inside Sales'),
      icon: iconInsideSales,
      desc: L('نتابع التواصل مع العملاء المهتمين، ونحوّل اهتمامهم لفرص مبيعات حقيقة', 'We follow up with interested customers and turn their interest into real sales opportunities'),
      href: '/services',
      fx: 3,
    },
    {
      key: 'outside',
      title: L('المبيعات الخارجية', 'Outside Sales'),
      icon: iconOutsideSales,
      desc: L('نوصل لعملاء جدد ، ونساعدك توسّع حضورك في أسواق أو مناطق جديدة', 'We reach new customers and help you expand into new markets and regions'),
      href: '/services',
      fx: 5,
    },
  ]

  /* hover-capable pointers expand on hover; touch/pen (including on
     hybrid laptops, decided per-event by pointerType) expand on the
     first tap and navigate on the second; keyboard expands on focus */
  const [open, setOpen] = useState<number | null>(null)
  const lastPointer = useRef('')
  const keyboardNav = useRef(false)
  const listRef = useRef<HTMLDivElement>(null)

  /* focus-visible heuristic: focus counts as keyboard-driven when the
     last input before it was Tab, not a pointer */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab') keyboardNav.current = true
    }
    const onPointer = () => {
      keyboardNav.current = false
    }
    window.addEventListener('keydown', onKey, true)
    window.addEventListener('pointerdown', onPointer, true)
    return () => {
      window.removeEventListener('keydown', onKey, true)
      window.removeEventListener('pointerdown', onPointer, true)
    }
  }, [])

  /* collapse (and release the GPU scene) once the cards are offscreen */
  useEffect(() => {
    const el = listRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) setOpen(null)
      },
      { rootMargin: '80px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div className="band band--services">
      <div className="squiggle squiggle--right" aria-hidden="true" style={{ maskImage: `url(${maskSquiggleR})`, WebkitMaskImage: `url(${maskSquiggleR})` }}>
        <div className="squiggle-fill squiggle-fill--right" />
      </div>
      <section className="services-section" id="services">
        <div className="section-heading">
          <p className="eyebrow">{L('الخدمات', 'Services')}</p>
          <div className="heading-group">
            <h2>{L('حلول تساعدك تزيد المبيعات وتفتح فرص نمو أوضح', 'Solutions that grow your sales and open clearer opportunities')}</h2>
            <p className="heading-desc">{L('نشتغل معك حسب احتياجك، سواء كنت تحتاج فريق يدعم مبيعاتك، توليد عملاء محتملين، تطوير عملية البيع، أو حلول تساعدك تقيس وتحسّن الأداء', 'We work around your needs — a team to support your sales, lead generation, sales-process development, or tools to measure and improve performance')}</p>
          </div>
        </div>
        <div className="services-expander" ref={listRef}>
          {services.map((s, i) => (
            <a
              className={`expander-card${open === i ? ' is-open' : ''}`}
              href={s.href}
              key={s.key}
              aria-expanded={open === i}
              onPointerDown={(e) => {
                lastPointer.current = e.pointerType
              }}
              onPointerEnter={(e) => {
                if (e.pointerType === 'mouse' && !COARSE_POINTER) setOpen(i)
              }}
              onPointerLeave={(e) => {
                if (e.pointerType === 'mouse' && !COARSE_POINTER) {
                  setOpen((cur) => (cur === i ? null : cur))
                }
              }}
              onFocus={() => {
                /* keyboard focus only — pointer taps are handled in onClick */
                if (keyboardNav.current) setOpen(i)
              }}
              onBlur={() => setOpen((cur) => (cur === i ? null : cur))}
              onClick={(e) => {
                const touchLike =
                  COARSE_POINTER || lastPointer.current === 'touch' || lastPointer.current === 'pen'
                if (touchLike && open !== i) {
                  e.preventDefault()
                  setOpen(i)
                }
              }}
            >
              <ActiveFx variant={s.fx} active={open === i} />
              {s.badge ? (
                <span className="featured-badge">
                  {L('جديـــــــد', 'NEW')}
                  <img className="badge-star" src={badgeStar} alt="" />
                </span>
              ) : null}
              <div className="expander-head">
                <img className="expander-icon" src={s.icon} alt="" width={132} height={132} />
                <h3 lang={s.en ? 'en' : undefined}>{s.title}</h3>
              </div>
              <div className="expander-body">
                <p>{s.desc}</p>
                <span className="expander-cta" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                  {L('استكشف الخدمة', 'Explore Service')}
                  <svg className="cta-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M19 12H5m0 0 6-6m-6 6 6 6" />
                  </svg>
                </span>
              </div>
            </a>
          ))}
        </div>
        <div className="center-action">
          <a className="button button--dark" href="/services">{L('لـــ مزيد من الخدمات', 'More Services')}</a>
        </div>
      </section>
    </div>
  )
}

function Process() {
  const { L } = useLang()
  const steps = [
    { title: L('نفهم احتياجك أول', 'We understand your needs first'), desc: L('نبدأ من وضعك الحالي ونشوف وين الفرص اللي تستاهل التركيز', 'We start from where you are and find the opportunities worth focusing on') },
    { title: L('نرتّب لك الأولويات', 'We set your priorities'), desc: L('نحدد وش تبدأ فيه، وأي خدمة تناسب مرحلتك وهدفك', 'We define where to start and which service fits your stage and goal') },
    { title: L('نركز على جودة الفرص', 'We focus on quality opportunities'), desc: L('نشتغل على الوصول للعميل الأنسب، مو بس زيادة أرقام', 'We target the right customers — not just bigger numbers') },
    { title: L('نتابع ونحسّن', 'We track and improve'), desc: L('نقيس النتائج ونطوّر الخطة حسب الأداء', 'We measure results and evolve the plan based on performance') },
  ]

  const [active, setActive] = useState(0)
  const trackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onScroll = () => {
      const el = trackRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const total = el.offsetHeight - window.innerHeight
      if (total <= 0) return
      const progress = Math.min(0.999, Math.max(0, -rect.top / total))
      setActive(Math.floor(progress * steps.length))
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [steps.length])

  return (
    <section className="process-section" id="process">
      <div className="process-track" ref={trackRef}>
        <div className="process-viewport">
          <div className="section-heading">
            <p className="eyebrow">{L('ليش سيلز أب ؟', 'Why SalesUp?')}</p>
            <div className="heading-group">
              <h2>{L('لأننا نربط بين المبيعات والتسويق', 'Because we connect sales with marketing')}</h2>
              <p className="heading-desc">{L('نساعدك تشوف فرص النمو بوضوح، وتعرف وش تحتاج في المبيعات والتسويق عشان توصل لعملاء اكثر وتحقق نتائج افضل', 'We help you see growth opportunities clearly, and know what your sales and marketing need to reach more customers and better results')}</p>
            </div>
          </div>
          <div className="process-stage" dir="ltr">
            {steps.map((s, i) => (
              <div className={`process-slide${i === active ? ' is-active' : ''}${i < active ? ' is-passed' : ''}`} key={s.title} aria-hidden={i !== active}>
                <div className="step-copy">
                  <h3>{s.title}</h3>
                  <p>{s.desc}</p>
                </div>
                <div className="step-marker">
                  <p className="step-number">{i + 1}</p>
                  <img className="step-star" src={starShape} alt="" />
                </div>
              </div>
            ))}
            <div className="process-dots" dir="ltr" role="presentation">
              {steps.map((s, i) => (
                <span className={`process-dot${i === active ? ' is-active' : ''}`} key={s.title} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Contact({ dark }: { dark: boolean }) {
  const { L } = useLang()
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (status === 'sending') return
    const payload = leadFromForm(event.currentTarget, { form: 'contact' })
    setStatus('sending')
    setStatus((await submitLead(payload)) ? 'sent' : 'error')
  }

  return (
    <section className="contact-section" id="contact">
      <p className="contact-eyebrow">{L('احصل على استشارة مجانية', 'Get a Free Consultation')}</p>
      <div className="contact-panel">
        <ContactFx dark={dark} />
        <div className="contact-clip" aria-hidden="true">
          <img className="contact-glow" src={contactGlow} alt="" />
        </div>
        <div className="contact-inner">
          <div className="contact-copy">
            <h2>{L('احصل على استشارة مجانية', 'Get a Free Consultation')}</h2>
            <p>{L('تقدر تحصل على استشارة مجانية أو مزيد من المعلومات حول خدماتنا , و ترا فريقنا مستعد لمساعدتك دائــماً', 'Get a free consultation or more details about our services — our team is always ready to help')}</p>
          </div>
          <form className="contact-form" onSubmit={handleSubmit}>
            <input className="field field--full" name="name" type="text" placeholder={L('الاسم*', 'Name*')} aria-label={L('الاسم', 'Name')} autoComplete="name" required />
            <div className="field-row">
              <input className="field" name="email" type="email" placeholder={L('الايميل', 'Email')} aria-label={L('الايميل', 'Email')} autoComplete="email" />
              <input className="field field--phone" name="phone" type="tel" placeholder={L('رقم الجوال*', 'Phone*')} aria-label={L('رقم الجوال', 'Phone')} autoComplete="tel" required />
            </div>
            <textarea className="field field--full field--message" name="message" placeholder={L('الرسالة', 'Message')} aria-label={L('الرسالة', 'Message')} />
            <input className="hp-field" name="website" type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" />
            <div className="form-action">
              <button className="button button--submit" type="submit" disabled={status === 'sending'}>
                {status === 'sending' ? L('جارٍ الإرسال…', 'Sending…') : L('ارسل طلبك', 'Send Request')}
              </button>
              {status === 'sent' ? <p className="form-status" role="status">{L('وصلنا طلبك، بنتواصل معك قريبًا.', "We received your request — we'll be in touch soon.")}</p> : null}
              {status === 'error' ? <p className="form-status form-status--error" role="alert">{L('تعذّر إرسال الطلب. حاول مرة أخرى، أو راسلنا مباشرة على hi@salesup.sa', "Couldn't send your request. Please try again, or email us directly at hi@salesup.sa")}</p> : null}
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}

function LandingSections() {
  const { dark } = usePageTheme()
  return (
    <>
      <Hero dark={dark} />
      <About />
      <Sectors />
      <Services />
      <Process />
      <Contact dark={dark} />
    </>
  )
}

/* the landing screen (Figma 5:962), wrapped in the shared shell */
export default function LandingPage() {
  return (
    <PageShell active="home">
      <LandingSections />
    </PageShell>
  )
}
