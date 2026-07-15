import { useEffect, useRef, useState } from 'react'
import { PageShell } from '../shared/PageShell'
import { useLang } from '../shared/i18n'
import { ActiveFx } from '../components/CardFx'
import iconFintech from '../assets/icon-fintech.png'
import iconSaas from '../assets/icon-saas.png'
import iconAgencies from '../assets/icon-agencies.png'
import iconTech from '../assets/icon-tech.png'

/*
 * القطاعات — sector pages (Figma 5:1530, 5:1944, 5:2089, 5:2234).
 * The four frames are accordion STATES of one page: a sectors heading,
 * an icon panel, and a four-item accordion with exactly one sector
 * open. Routes /sectors/:slug deep-link to the matching item; toggling
 * updates the URL via replaceState. Icons and fx variants reuse the
 * landing's sector identities for continuity.
 */
export const SECTORS: Record<
  string,
  { ar: string; en: string; icon: string; fx: number; descAr: string; descEn: string }
> = {
  technology: {
    ar: 'تقنية المعلومات',
    en: 'Information Technology',
    icon: iconTech,
    fx: 7,
    descAr:
      'تقدم منصة Salesup حلولًا تقنية مبتكرة تشمل تطوير البرمجيات المخصصة، إدارة البيانات، الحلول السحابية، وأمن المعلومات. ونعمل مع العملاء في مجال تقنية المعلومات لتحقيق أهدافهم',
    descEn:
      'The SalesUp platform delivers innovative technology solutions — custom software development, data management, cloud services, and information security. We work with IT companies to help them reach their goals.',
  },
  fintech: {
    ar: 'فنتك',
    en: 'Fintech',
    icon: iconFintech,
    fx: 4,
    descAr:
      'توفر Salesup دعمًا مخصصًا للمبدعين ومحترفي التصميم في تطوير وتسويق مشاريعهم الإبداعية. نحن نقدم أدوات وموارد لتحسين جودة التصميم وتعزيز الابتكار في الأعمال الإبداعية.',
    descEn:
      'SalesUp provides dedicated support for creators and design professionals to develop and market their creative projects. We offer tools and resources that raise design quality and drive innovation in creative work.',
  },
  saas: {
    ar: 'Saas',
    en: 'SaaS',
    icon: iconSaas,
    fx: 5,
    descAr:
      'من خلال خدمات البرمجيات كخدمة (SaaS)، توفر Salesup حلولًا برمجية مرنة ومبتكرة عبر الإنترنت تشمل نظم إدارة العلاقات مع العملاء (CRM)، وأنظمة إدارة المشاريع، وحلول الاتصال والتعاون.',
    descEn:
      'Through Software-as-a-Service, SalesUp offers flexible, innovative online solutions — CRM systems, project management platforms, and communication and collaboration tools.',
  },
  agencies: {
    ar: 'الوكالات الاعلانية',
    en: 'Ad Agencies',
    icon: iconAgencies,
    fx: 6,
    descAr:
      'نحن شركاء للوكالات الإعلانية، حيث نقدم حلولًا تسويقية مبتكرة وإبداعية تشمل تطوير الحملات الإعلانية، وإدارة الوسائط الاجتماعية، وتحليل البيانات لتحقيق أهداف التسويق بنجاح.',
    descEn:
      'We partner with advertising agencies to deliver creative, innovative marketing solutions — campaign development, social media management, and data analysis that hit marketing goals.',
  },
}

/* Figma accordion order (top to bottom) */
const ORDER = ['technology', 'fintech', 'saas', 'agencies'] as const

function SectorsBody({ initial }: { initial: string }) {
  const { L } = useLang()
  const [open, setOpen] = useState(initial)
  const panelRef = useRef<HTMLDivElement>(null)
  const [panelVisible, setPanelVisible] = useState(false)

  /* release the panel's GPU scene when it is offscreen */
  useEffect(() => {
    const el = panelRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => setPanelVisible(entries[0].isIntersecting),
      { rootMargin: '120px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const select = (slug: string) => {
    setOpen(slug)
    window.history.replaceState(null, '', `/sectors/${slug}`)
  }

  const current = SECTORS[open]

  return (
    <section className="sector-page">
      <div className="section-heading">
        <p className="eyebrow">{L('القطاعات', 'Sectors')}</p>
        <div className="heading-group">
          <h2>{L('نشتغل مع قطاعات تحتاج مبيعات أوضح ونمو قابل للقياس', 'We work with sectors that need clearer sales and measurable growth')}</h2>
          <p className="heading-desc">{L('كل قطاع له طريقته في البيع والوصول للعميل، عشان كذا نشتغل معك بحلول تناسب طبيعة نشاطك وسوقك', 'Every sector sells and reaches customers differently — so we work with you on solutions that fit your business and your market')}</p>
        </div>
      </div>
      <div className="sector-layout">
        <div className="sector-panel" ref={panelRef} aria-hidden="true">
          <ActiveFx variant={current.fx} active={panelVisible} />
          <img key={open} className="sector-panel-icon" src={current.icon} alt="" />
        </div>
        <div className="sector-accordion">
          {ORDER.map((slug) => {
            const s = SECTORS[slug]
            const isOpen = slug === open
            return (
              <div className={`sector-acc-item${isOpen ? ' is-open' : ''}`} key={slug}>
                <button
                  type="button"
                  className="sector-acc-head"
                  aria-expanded={isOpen}
                  aria-controls={`sector-body-${slug}`}
                  onClick={() => select(slug)}
                >
                  <span className="sector-acc-title" lang={slug === 'saas' ? 'en' : undefined}>
                    {L(s.ar, s.en)}
                  </span>
                  <svg className="acc-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </button>
                <div className="sector-acc-body" id={`sector-body-${slug}`} role="region">
                  <div className="sector-acc-inner">
                    <img className="sector-acc-icon" src={s.icon} alt="" width={96} height={96} />
                    <p>{L(s.descAr, s.descEn)}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default function SectorPage({ slug }: { slug: string }) {
  const initial = slug in SECTORS ? slug : 'technology'
  return (
    <PageShell active="about">
      <SectorsBody initial={initial} />
    </PageShell>
  )
}
