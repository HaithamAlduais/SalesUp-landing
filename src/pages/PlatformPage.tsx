import { useEffect, useRef, useState } from 'react'
import type { KeyboardEvent, PointerEvent as ReactPointerEvent } from 'react'
import { domAnimation, LazyMotion, m, MotionConfig } from 'motion/react'
import { ArrowLeft, Check, Package, Wallet, Users, Trophy, ChartNoAxesCombined, Bell, BriefcaseBusiness } from 'lucide-react'
import { FinalCtaFx, HeroFx } from '../components/CardFx'
import { ProductAppPreview } from '../components/ProductAppPreview'
import { PageShell } from '../shared/PageShell'
import { useLang } from '../shared/i18n'
import { usePageTheme } from '../shared/theme'
import { productHero, accountContent, journeyContent, featureContent, faqContent, APP_LOGIN_URL, COMPANY_SIGNUP_URL, MARKETER_SIGNUP_URL } from '../platform-product-content'
import type { Bi, ProductAudience, ProductContentIcon, ProductPreviewView } from '../platform-product-content'
import '../platform-mobile.css'
import '../platform-accounts.css'
import '../platform-real-product.css'

type WorkspaceSelection = { audience: ProductAudience; activeIndex: number }
const icons = { cube: Package, wallet: Wallet, users: Users, trophy: Trophy, chart: ChartNoAxesCombined, bell: Bell, brief: BriefcaseBusiness }
function Icon({ name }: { name: ProductContentIcon }) { const Glyph = icons[name]; return <Glyph className="platform-icon" strokeWidth={1.7} aria-hidden="true" /> }
function Arrow() { return <ArrowLeft className="platform-arrow" aria-hidden="true" /> }
function Tick() { return <Check className="platform-check" aria-hidden="true" /> }
function useCopy() { const { lang } = useLang(); return (text: Bi) => text[lang] }

function updateRolePointer(event: ReactPointerEvent<HTMLElement>) {
  if (event.pointerType !== 'mouse') return
  const rect = event.currentTarget.getBoundingClientRect()
  event.currentTarget.style.setProperty('--role-pointer-x', ((event.clientX - rect.left) / rect.width * 100) + '%')
  event.currentTarget.style.setProperty('--role-pointer-y', ((event.clientY - rect.top) / rect.height * 100) + '%')
  event.currentTarget.dataset.pointerActive = 'true'
}

function PlatformHero() {
  const { dark } = usePageTheme()
  const { L } = useLang()
  const t = useCopy()
  return <section className="platform-native-hero platform-real-hero">
    <div className="platform-native-fx" aria-hidden="true"><HeroFx dark={dark} /></div>
    <div className="platform-native-wrap">
      <div className="platform-hero-copy">
        <span className="platform-kicker">{t(productHero.eyebrow)}</span>
        <h1>{t(productHero.title)} <em>{t(productHero.accent)}</em></h1>
        <p>{t(productHero.description)}</p>
        <div className="platform-hero-actions">
          <a className="platform-primary" href="#platform-roles">{L('اختر حسابك', 'Choose your account')}<Arrow /></a>
          <a className="platform-text-link" href="#platform-workspace">{L('استكشف المنصة', 'Explore the platform')}<Arrow /></a>
        </div>
        <div className="platform-proof"><span><Tick />{L('حساب للشركة وحساب للمسوّق', 'A workspace for each role')}</span><span><Tick />{L('نفس واجهة المنصة الفعلية', 'The actual product UI')}</span></div>
      </div>
      <div className="platform-real-hero-preview"><ProductAppPreview view="dashboard" compact /></div>
    </div>
  </section>
}

function RoleCards({ onSelect }: { onSelect: (selection: WorkspaceSelection) => void }) {
  const { L } = useLang()
  const t = useCopy()
  return <section className="platform-roles platform-accounts" id="platform-roles" aria-labelledby="platform-accounts-title">
    <div className="platform-accounts-heading"><span>{L('طرفين على نفس المنصة', 'Two sides, one platform')}</span><h2 id="platform-accounts-title">{L('أنت وين في رحلة البيع؟', 'Where do you fit in the sale?')}</h2><p>{L('أدوات ومعلومات تخصّك، حسب دورك.', 'Tools and information tailored to your role.')}</p></div>
    <div className="platform-accounts-grid">{accountContent.map(role => <article className={'platform-account platform-account--' + role.audience} key={role.audience} onPointerMove={updateRolePointer} onPointerLeave={event => event.currentTarget.removeAttribute('data-pointer-active')}>
      <div className="platform-account-label"><Icon name={role.audience === 'company' ? 'brief' : 'users'} /><span>{t(role.label)}</span></div>
      <div className="platform-account-intro"><h3>{t(role.title)}<em>{t(role.accent)}</em></h3><p>{t(role.description)}</p></div>
      <ul className="platform-account-benefits">{role.benefits.map(point => <li key={point.title.en}><Tick /><div><b>{t(point.title)}</b><p>{t(point.description)}</p></div></li>)}</ul>
      <a className="platform-account-action" href={role.audience === 'company' ? COMPANY_SIGNUP_URL : MARKETER_SIGNUP_URL}>{role.audience === 'company' ? L('أنشئ حساب شركة', 'Create a company account') : L('أنشئ حساب مسوّق', 'Create an agent account')}<Arrow /></a>
      <a className="platform-account-explore" href="#platform-workspace" onClick={() => onSelect({ audience: role.audience, activeIndex: 0 })}>{L('استكشف أدوات الحساب', 'Explore this workspace')}</a>
    </article>)}</div>
  </section>
}

function useStoryScroll(count: number) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)
  useEffect(() => {
    let frame = 0
    const sync = () => {
      const el = trackRef.current
      if (!el || window.matchMedia('(max-width: 820px)').matches) return
      const total = el.offsetHeight - window.innerHeight
      if (total <= 0) return
      const progress = Math.min(0.999, Math.max(0, -el.getBoundingClientRect().top / total))
      setActive(Math.min(count - 1, Math.floor(progress * count)))
    }
    const schedule = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(sync) }
    sync()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => { cancelAnimationFrame(frame); window.removeEventListener('scroll', schedule); window.removeEventListener('resize', schedule) }
  }, [count])
  const goTo = (index: number) => {
    const el = trackRef.current
    if (!el) return
    const total = el.offsetHeight - window.innerHeight
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top: window.scrollY + el.getBoundingClientRect().top + total * (index + 0.12) / count, behavior: reduce ? 'instant' : 'smooth' })
  }
  return { trackRef, active, goTo }
}

function PlatformStory() {
  const { L } = useLang()
  const t = useCopy()
  const { trackRef, active, goTo } = useStoryScroll(journeyContent.length)
  const current = journeyContent[active]
  const sceneView = (index: number): ProductPreviewView => index === 0 ? 'products' : index === 4 ? 'commissions' : journeyContent[index].view
  return <section className="platform-story platform-real-story" id="platform-journey">
    <div className="platform-story-track" ref={trackRef}><div className="platform-story-viewport">
      <div className="platform-story-intro"><span>{L('من داخل المنصة', 'Inside the platform')}</span><p>{L('شوف الخطوات على واجهتها الفعلية.', 'Follow the steps in the actual interface.')}</p></div>
      <div className="platform-story-grid">
        <div className="platform-story-copy">
          <div className="platform-story-rail" aria-label={L('خطوات المنصة', 'Platform steps')}>{journeyContent.map((step, index) => <button type="button" key={step.title.en} className={active === index ? 'is-active' : ''} aria-current={active === index ? 'step' : undefined} onClick={() => goTo(index)} aria-label={t(step.title)}><span>{String(index + 1).padStart(2, '0')}</span><b>{L(['المنتج', 'الانضمام', 'مواد البيع', 'العملاء', 'الصفقة', 'العمولة'], ['Product', 'Join', 'Materials', 'Customers', 'Deal', 'Payment'])[index]}</b></button>)}</div>
          <div className="platform-story-steps">{journeyContent.map((step, index) => <m.article className={'platform-story-step' + (active === index ? ' is-active' : '')} key={step.title.en} initial={false} animate={{ opacity: active === index ? 1 : 0, y: active === index ? 0 : 12 }} transition={{ duration: 0.2 }}>
            <div className="platform-story-step-icon"><Icon name={step.icon} /></div><span className="platform-story-step-audience">{step.audience === 'company' ? L('للشركة', 'For companies') : L('للمسوّق', 'For agents')}</span>
            <h2>{t(step.title)}</h2><p>{t(step.description)}</p><div className="platform-story-proof"><Tick />{t(step.proof)}</div>
            <div className="platform-story-mobile-preview"><ProductAppPreview view={sceneView(index)} audience={step.audience} compact /></div>
          </m.article>)}</div>
        </div>
        <div className="platform-story-stage platform-real-story-stage"><ProductAppPreview view={sceneView(active)} audience={current.audience} compact /></div>
      </div>
      <div className="platform-story-progress" aria-hidden="true"><span style={{ transform: 'scaleX(' + (active + 1) / journeyContent.length + ')' }} /></div>
    </div></div>
  </section>
}

function FeatureSwitch({ selection, onSelect }: { selection: WorkspaceSelection; onSelect: (selection: WorkspaceSelection) => void }) {
  const { L } = useLang()
  const t = useCopy()
  const { audience, activeIndex } = selection
  const features = featureContent[audience]
  const feature = features[activeIndex]
  const selectAudience = (next: ProductAudience) => onSelect({ audience: next, activeIndex: 0 })
  const handleKey = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return
    event.preventDefault()
    const next = event.key === 'Home' ? 'marketer' : event.key === 'End' ? 'company' : audience === 'marketer' ? 'company' : 'marketer'
    selectAudience(next)
    event.currentTarget.parentElement?.querySelector<HTMLButtonElement>('#' + next + '-tab')?.focus()
  }
  const view = audience === 'company' && activeIndex === 0 ? 'products' : audience === 'company' && activeIndex >= 4 ? 'commissions' : feature.view
  return <section className="platform-features platform-real-workspace" id="platform-workspace">
    <div className="platform-workspace-head"><div className="platform-section-head"><span>{L('أدوات المنصة', 'Product tools')}</span><h2>{audience === 'company' ? L('منتجاتك ومبيعاتها، في حساب واحد', 'Your products and sales, together') : L('من اختيار المنتج إلى متابعة عمولتك', 'From choosing a product to tracking payment')}</h2><p>{L('استكشف الأدوات بنفس مكوّنات المنصة، مع بيانات توضيحية.', 'Explore the tools using the product’s own components and example data.')}</p></div>
      <div className="platform-audience" role="tablist" aria-label={L('نوع الحساب', 'Account type')}>{(['marketer', 'company'] as const).map(role => <button type="button" key={role} id={role + '-tab'} role="tab" tabIndex={role === audience ? 0 : -1} className={role === audience ? 'is-active' : ''} aria-selected={role === audience} aria-controls="platform-features-panel" onClick={() => selectAudience(role)} onKeyDown={handleKey}><Icon name={role === 'company' ? 'brief' : 'users'} />{role === 'company' ? L('للشركة', 'Company') : L('للمسوّق', 'Agent')}</button>)}</div>
    </div>
    <div className="platform-workspace-shell"><nav className="platform-feature-nav" aria-label={L('أدوات الحساب', 'Workspace tools')}>{features.map((item, index) => <button key={item.title.en} type="button" className={index === activeIndex ? 'is-active' : ''} aria-pressed={index === activeIndex} onClick={() => onSelect({ audience, activeIndex: index })}><span className="platform-feature-nav-icon"><Icon name={item.icon} /></span><span><b>{t(item.title)}</b><small>{L('استكشف الأداة', 'Explore tool')}</small></span></button>)}</nav>
      <div className="platform-feature-stage" id="platform-features-panel" role="tabpanel" aria-labelledby={audience + '-tab'}>
        <div className="platform-real-feature-description" aria-live="polite"><h3>{t(feature.title)}</h3><p>{t(feature.description)}</p></div>
        <ProductAppPreview view={view} audience={audience} />
      </div>
    </div>
  </section>
}

function Faq() {
  const t = useCopy()
  const { L } = useLang()
  const [open, setOpen] = useState<number | null>(0)
  return <section className="platform-faq"><div className="platform-faq-copy"><span>{L('قبل ما تبدأ', 'Before you start')}</span><h2>{L('أجوبة على أسئلتك', 'Your questions, answered')}</h2><p>{L('عن الحسابات والمنتجات والصفقات والعمولات.', 'About accounts, products, deals and commissions.')}</p></div><div className="platform-faq-list">{faqContent.map((item, index) => <article className={open === index ? 'is-open' : ''} key={item.question.en}><button type="button" onClick={() => setOpen(open === index ? null : index)} aria-expanded={open === index} aria-controls={'platform-faq-' + index}><span>{t(item.question)}</span><b aria-hidden="true">{open === index ? '−' : '+'}</b></button><div id={'platform-faq-' + index} hidden={open !== index}><p>{t(item.answer)}</p></div></article>)}</div></section>
}

function FinalCta() {
  const { L } = useLang()
  return <section className="platform-final"><FinalCtaFx /><div className="platform-final-copy"><span>{L('جاهز تبدأ؟', 'Ready to begin?')}</span><h2>{L('ادخل المنصة، وابدأ من حسابك', 'Step into your workspace')}</h2><p>{L('شركة أو مسوّق؟ اختر دورك وكمّل بياناتك.', 'Company or agent? Choose your role and complete your details.')}</p><a className="platform-primary" href={APP_LOGIN_URL}>{L('أنشئ حسابك', 'Create your account')}<Arrow /></a></div></section>
}

export default function PlatformPage() {
  const [workspace, setWorkspace] = useState<WorkspaceSelection>({ audience: 'marketer', activeIndex: 0 })
  return <PageShell active="platform"><LazyMotion features={domAnimation} strict><MotionConfig reducedMotion="user"><PlatformHero /><RoleCards onSelect={setWorkspace} /><PlatformStory /><FeatureSwitch selection={workspace} onSelect={setWorkspace} /><Faq /><FinalCta /></MotionConfig></LazyMotion></PageShell>
}
