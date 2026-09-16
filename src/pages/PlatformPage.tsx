import { useEffect, useRef, useState } from 'react'
import type { ReactNode, RefObject } from 'react'
import { ActiveFx, ContactFx, HeroFx } from '../components/CardFx'
import { PageShell } from '../shared/PageShell'
import { useLang } from '../shared/i18n'
import { usePageTheme } from '../shared/theme'
import '../platform.css'

/*
 * الحلول الرقمية — ported from the client's platform.html reference.
 * Structure, copy and class names follow the reference; the shared
 * shell, the HeroFx shader and the sticky product story are ours.
 */

type Localize = (ar: string, en: string) => string
type IconName = 'box' | 'wallet' | 'users' | 'cup' | 'chart' | 'bell' | 'shield' | 'brief' | 'arw' | 'chk'
type SceneKind = 'commissions' | 'crm' | 'leaderboard' | 'performance' | 'publish' | 'opportunities' | 'approval'
type Audience = 'marketer' | 'company'

const ICONS: Record<IconName, ReactNode> = {
  box: <><path d="M12 3l8 4.2v9.6L12 21l-8-4.2V7.2z" /><path d="M4 7.2l8 4.2 8-4.2M12 21v-9.6" /></>,
  wallet: <><path d="M3.5 8.5A2.5 2.5 0 0 1 6 6h11a2.5 2.5 0 0 1 2.5 2.5v8A2.5 2.5 0 0 1 17 19H6a2.5 2.5 0 0 1-2.5-2.5z" /><path d="M16 12.5h1.6" /></>,
  users: <><circle cx="9" cy="8" r="3.2" /><path d="M3 20c0-3.3 2.7-5.4 6-5.4s6 2.1 6 5.4" /><path d="M16 5.2A3.2 3.2 0 0 1 16 11M18 20c0-2.6-1-4.3-2.6-5.1" /></>,
  cup: <><path d="M8 3h8v5a4 4 0 0 1-8 0z" /><path d="M8 4.5H5.5v1A3.5 3.5 0 0 0 9 9M16 4.5h2.5v1A3.5 3.5 0 0 1 15 9" /><path d="M12 12v4M9 20h6M10 16h4" /></>,
  chart: <path d="M4 19V9M10 19V5M16 19v-7M22 19H2" />,
  bell: <><path d="M18 15v-4a6 6 0 1 0-12 0v4l-1.6 2.4h15.2z" /><path d="M10 20.2a2.2 2.2 0 0 0 4 0" /></>,
  shield: <path d="M12 3l7.5 3.2v5.1c0 4.3-3.2 7.9-7.5 8.7-4.3-.8-7.5-4.4-7.5-8.7V6.2L12 3z" />,
  brief: <><rect x="3" y="7.5" width="18" height="12" rx="2.5" /><path d="M9 7.5V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1.5M3 12.5h18" /></>,
  arw: <path d="M5 12h14M13 6l6 6-6 6" />,
  chk: <path d="M4.5 12.6l5 5L19.5 7" />,
}

function Icon({ name }: { name: IconName }) {
  return <svg viewBox="0 0 24 24" aria-hidden="true">{ICONS[name]}</svg>
}

/* gradient defs shared by the feature icons and the sparkline */
function Defs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
      <defs>
        <linearGradient id="pf-icg" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#076C61" /><stop offset=".55" stopColor="#0B9E79" /><stop offset="1" stopColor="#31C795" />
        </linearGradient>
        <linearGradient id="pf-sg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#04CB79" stopOpacity=".4" /><stop offset="1" stopColor="#04CB79" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  )
}

const stillMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

/* starts as an arrow, opens into the full button on hover (see .grow) */
function GrowButton({ href, label }: { href: string; label: string }) {
  return (
    <a className="btn b1 grow" href={href} aria-label={label}>
      <span><i>{label}</i></span>
      <Icon name="arw" />
    </a>
  )
}

/* ─── board scenes ─── */

function Label({ title, live }: { title: string; live: string }) {
  return <div className="blabel"><b>{title}</b><span className="live"><i />{live}</span></div>
}

const FEED = [
  { i: ['ن', 'N'], t: ['نظام نقاط بيع · متجر نُوى', 'POS system · Nuwa Store'], a: 1240 },
  { i: ['ر', 'R'], t: ['منصة CRM · اشتراك سنوي', 'CRM platform · annual plan'], a: 3610, p: true },
  { i: ['د', 'D'], t: ['أمن سيبراني · تأمين درب', 'Cybersecurity · Darb Insurance'], a: 640 },
  { i: ['س', 'S'], t: ['استضافة سحابية · سُهيل', 'Cloud hosting · Suhail'], a: 96 },
  { i: ['ت', 'T'], t: ['نظام مخزون · شركة تجزئة', 'Inventory system · retail chain'], a: 880 },
  { i: ['ع', 'C'], t: ['حجز إلكتروني · عيادة', 'Online booking · clinic'], a: 420, p: true },
  { i: ['م', 'F'], t: ['أتمتة عمليات · مصنع', 'Process automation · factory'], a: 2150 },
] as const

type FeedState = { rows: { id: number; k: number }[]; total: number; next: number }

function pushFeed(state: FeedState): FeedState {
  const k = state.next % FEED.length
  const item = FEED[k]
  return {
    rows: [{ id: state.next, k }, ...state.rows].slice(0, 4),
    total: state.total + ('p' in item ? 0 : item.a),
    next: state.next + 1,
  }
}

function initialFeed(): FeedState {
  let state: FeedState = { rows: [], total: 12480, next: 0 }
  for (let n = 0; n < 4; n++) state = pushFeed(state)
  return state
}

/* live commissions feed: a new row lands every 3s while on screen */
function CommissionsScene({ live }: { live: boolean }) {
  const { lang, L } = useLang()
  const ref = useRef<HTMLUListElement>(null)
  const [state, setState] = useState(initialFeed)

  useEffect(() => {
    const el = ref.current
    if (!el || !live || stillMotion()) return
    let timer = 0
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !timer) timer = window.setInterval(() => setState(pushFeed), 3000)
      else if (!entries[0].isIntersecting && timer) { window.clearInterval(timer); timer = 0 }
    }, { threshold: 0.2 })
    observer.observe(el)
    return () => { observer.disconnect(); if (timer) window.clearInterval(timer) }
  }, [live])

  const pick = lang === 'ar' ? 0 : 1
  return (
    <>
      <Label title={L('لوحة العمولات', 'Commission board')} live={L('مباشر', 'Live')} />
      <div className="total"><span>{L('إجمالي عمولاتك', 'Total commissions')}</span><b><em>{state.total.toLocaleString('en-US')}</em><small>{L('ر.س', 'SAR')}</small></b></div>
      <ul className={'feed' + (live ? ' live-feed' : '')} ref={ref}>
        {state.rows.map(({ id, k }) => {
          const item = FEED[k]
          const pending = 'p' in item
          return (
            <li key={id}>
              <span className="av">{item.i[pick]}</span>
              <span className="tx"><b>{item.t[pick]}</b><span>{pending ? L('قيد الاعتماد', 'Pending approval') : L('اعتُمدت', 'Approved')}</span></span>
              <span className={'amt' + (pending ? ' pend' : '')}>{item.a.toLocaleString('en-US')}</span>
            </li>
          )
        })}
      </ul>
    </>
  )
}

function CrmScene() {
  const { L } = useLang()
  const columns = [
    { color: '#3B82F6', title: L('عملاء جدد', 'New leads'), count: 4, cards: [L('مطعم · نقاط بيع', 'Restaurant · POS'), L('صالون · حجوزات', 'Salon · bookings')] },
    { color: '#A855F7', title: L('مؤهّلون', 'Qualified'), count: 5, cards: [L('عيادة · حجز', 'Clinic · booking'), L('محاماة · أرشفة', 'Law firm · archiving')] },
    { color: '#6366F1', title: L('قيد التنفيذ', 'In progress'), count: 3, cards: [L('تجزئة · مخزون', 'Retail · inventory')] },
    { color: '#04CB79', title: L('مقفلة', 'Closed'), count: 2, cards: [L('مصنع · CRM', 'Factory · CRM')], won: true },
  ]
  return (
    <>
      <Label title={L('الصفقات · CRM', 'Deals · CRM')} live={L('12 صفقة', '12 deals')} />
      <div className="kmini">
        {columns.map((col) => (
          <div className="kc2" key={col.title}>
            <span className="kt"><i style={{ background: col.color }} />{col.title}<b>{col.count}</b></span>
            {col.cards.map((card) => <div className={'kk' + (col.won ? ' on' : '')} key={card}>{card}</div>)}
          </div>
        ))}
      </div>
    </>
  )
}

function LeaderboardScene() {
  const { L } = useLang()
  const rows = [
    { rank: 1, name: L('عبدالله ا.', 'Abdullah A.'), deals: L('31 صفقة مقفلة', '31 closed deals'), amount: '18,420', top: true },
    { rank: 2, name: L('نورة م.', 'Noura M.'), deals: L('28 صفقة مقفلة', '28 closed deals'), amount: '16,900', top: true },
    { rank: 3, name: L('أنت', 'You'), deals: L('27 صفقة مقفلة', '27 closed deals'), amount: '12,480', top: true, me: true },
    { rank: 4, name: L('سعد ح.', 'Saad H.'), deals: L('22 صفقة مقفلة', '22 closed deals'), amount: '10,150' },
  ]
  return (
    <>
      <Label title={L('لوحة المتصدّرين', 'Leaderboard')} live={L('هذا الشهر', 'This month')} />
      <ul className="lead2">
        {rows.map((row) => (
          <li className={row.me ? 'me' : undefined} key={row.rank}>
            <span className={'rk' + (row.top ? ' g' : '')}>{row.rank}</span>
            <span className="tx"><b>{row.name}</b><span>{row.deals}</span></span>
            <span className="amt">{row.amount}</span>
          </li>
        ))}
      </ul>
    </>
  )
}

function PerformanceScene() {
  const { L } = useLang()
  return (
    <>
      <Label title={L('ملخّص أدائك', 'Your performance')} live={L('آخر 6 أشهر', 'Last 6 months')} />
      <div className="tiles">
        <div className="tile hot"><span>{L('عمولاتي', 'My commissions')}</span><b>12,480</b><em>{L('هذا الشهر', 'This month')} <bdi dir="ltr">+18%</bdi></em></div>
        <div className="tile"><span>{L('قيد الاعتماد', 'Pending approval')}</span><b>3,150</b><em>{L('4 صفقات', '4 deals')}</em></div>
        <div className="tile"><span>{L('صفقات مقفلة', 'Closed deals')}</span><b>27</b><em>{L('من أصل 41', 'out of 41')}</em></div>
        <div className="tile"><span>{L('منتجات انضممت لها', 'Products joined')}</span><b>6</b><em>{L('نشطة', 'Active')}</em></div>
      </div>
      <div className="chartwrap">
        <div className="ct"><span>{L('نمو عمولاتك', 'Commission growth')}</span><em>+24.8%</em></div>
        <svg className="spark" viewBox="0 0 300 64" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 54 L50 48 L100 40 L150 30 L200 22 L250 13 L300 6 L300 64 L0 64 Z" fill="url(#pf-sg)" />
          <path d="M0 54 L50 48 L100 40 L150 30 L200 22 L250 13 L300 6" fill="none" stroke="#04CB79" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="300" cy="6" r="3.6" fill="#04CB79" />
        </svg>
      </div>
    </>
  )
}

function PublishScene() {
  const { L } = useLang()
  return (
    <>
      <Label title={L('إضافة منتج جديد', 'New product')} live={L('جاهز للنشر', 'Ready to publish')} />
      <div className="tiles">
        <div className="tile hot"><span>{L('العمولة', 'Commission')}</span><b>12%</b><em>{L('تظهر للمسوّق قبل الانضمام', 'Shown before a marketer joins')}</em></div>
        <div className="tile"><span>{L('المنتج', 'Product')}</span><b className="txt">{L('نظام نقاط بيع', 'POS system')}</b><em>{L('اشتراك سنوي', 'Annual plan')}</em></div>
        <div className="tile"><span>{L('الفئة', 'Category')}</span><b className="txt">{L('حلول المتاجر', 'Retail solutions')}</b><em>{L('يظهر ضمن الفرص', 'Listed in opportunities')}</em></div>
        <div className="tile"><span>{L('مسوّقون مهتمون', 'Interested marketers')}</span><b>86</b><em>{L('خلال أول أسبوع', 'In the first week')}</em></div>
      </div>
      <div className="total" style={{ marginTop: 14, marginBottom: 0 }}>
        <span>{L('حالة النشر', 'Publishing status')}</span><b className="txt">{L('مكتمل · ظاهر للمسوّقين', 'Complete · visible to marketers')}</b>
      </div>
    </>
  )
}

function OpportunitiesScene() {
  const { L } = useLang()
  const rows = [
    { i: L('ر', 'C'), t: L('منصة CRM · اشتراك سنوي', 'CRM platform · annual plan'), s: L('مفتوحة · شروط واضحة', 'Open · clear terms'), a: '18%' },
    { i: L('م', 'E'), t: L('متجر إلكتروني · قطع غيار', 'E-commerce · spare parts'), s: L('مفتوحة · مبيعات B2B', 'Open · B2B sales'), a: '14%' },
    { i: L('س', 'S'), t: L('خدمة استضافة · سُهيل', 'Hosting service · Suhail'), s: L('مفتوحة · جاهزة للتسويق', 'Open · ready to market'), a: '12%' },
    { i: L('ن', 'N'), t: L('نظام نقاط بيع · متجر نُوى', 'POS system · Nuwa Store'), s: L('مفتوحة · عمولة على الإقفال', 'Open · paid on close'), a: '12%' },
  ]
  return (
    <>
      <Label title={L('فرص مناسبة لك', 'Opportunities for you')} live={L('12 فرصة متاحة', '12 open')} />
      <ul className="feed tall">
        {rows.map((row) => (
          <li key={row.t}><span className="av">{row.i}</span><span className="tx"><b>{row.t}</b><span>{row.s}</span></span><span className="amt">{row.a}</span></li>
        ))}
      </ul>
    </>
  )
}

function ApprovalScene() {
  const { L } = useLang()
  const rows = [
    { i: L('ن', 'N'), t: L('متجر نُوى · نظام نقاط بيع', 'Nuwa Store · POS system'), s: L('بيانات العميل والمرحلة مكتملة', 'Customer details and stage complete'), st: L('جديد', 'New') },
    { i: L('أ', 'O'), t: L('مؤسسة أفق · اشتراك CRM', 'Ofoq Co. · CRM plan'), s: L('عرض سعر مرسل · بانتظار الرد', 'Quote sent · awaiting reply'), st: L('مراجعة', 'Review'), pend: true },
    { i: L('د', 'D'), t: L('دار النور · خدمة استضافة', 'Dar Al Noor · hosting'), s: L('بيانات العميل والمرحلة مكتملة', 'Customer details and stage complete'), st: L('جديد', 'New') },
  ]
  return (
    <>
      <Label title={L('صفقات بانتظار الاعتماد', 'Deals awaiting approval')} live={L('4 تحتاج قرارك', '4 need your decision')} />
      <div className="total"><span>{L('تحتاج قرارك', 'Need your decision')}</span><b><em>04</em><small>{L('طلبات موثّقة', 'documented requests')}</small></b></div>
      <ul className="feed">
        {rows.map((row) => (
          <li key={row.t}><span className="av">{row.i}</span><span className="tx"><b>{row.t}</b><span>{row.s}</span></span><span className={'st' + (row.pend ? ' pend' : '')}>{row.st}</span></li>
        ))}
      </ul>
    </>
  )
}

function Scene({ kind, live }: { kind: SceneKind; live: boolean }) {
  switch (kind) {
    case 'commissions': return <CommissionsScene live={live} />
    case 'crm': return <CrmScene />
    case 'leaderboard': return <LeaderboardScene />
    case 'performance': return <PerformanceScene />
    case 'publish': return <PublishScene />
    case 'opportunities': return <OpportunitiesScene />
    case 'approval': return <ApprovalScene />
  }
}

/* one product card holding several self-explaining scenes */
function Board({ scenes, active, live = false, children }: { scenes: SceneKind[]; active: number; live?: boolean; children?: ReactNode }) {
  const { L } = useLang()
  return (
    <article className="board" aria-label={L('معاينة توضيحية للمنصة', 'Illustrative platform preview')}>
      {children}
      <div className="bh"><span className="dots3"><i /><i /><i /></span></div>
      <div className="scenes">
        {scenes.map((kind, index) => (
          <section className={'scene' + (index === active ? ' on' : '')} aria-hidden={index !== active} key={kind}>
            <Scene kind={kind} live={live} />
          </section>
        ))}
      </div>
    </article>
  )
}

function Rings() {
  return (
    <>
      <span className="disc" />
      <svg className="rings" viewBox="0 0 440 380" aria-hidden="true">
        <g transform="translate(220 190)"><circle r="196" strokeWidth="1.2" /><circle r="158" strokeWidth="1.2" /><circle r="122" strokeWidth="1.3" /></g>
      </svg>
    </>
  )
}

/* cycles the hero scenes every 5.2s while the stage is on screen */
function useRotation(count: number, ref: RefObject<HTMLElement | null>, ms = 5200) {
  const [index, setIndex] = useState(0)
  useEffect(() => {
    const el = ref.current
    if (!el || count < 2 || stillMotion()) return
    let timer = 0
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !timer) timer = window.setInterval(() => setIndex((i) => (i + 1) % count), ms)
      else if (!entries[0].isIntersecting && timer) { window.clearInterval(timer); timer = 0 }
    }, { threshold: 0.2 })
    observer.observe(el)
    return () => { observer.disconnect(); if (timer) window.clearInterval(timer) }
  }, [count, ms, ref])
  return index
}

/* sections flow in as you scroll, instead of landing all at once */
const REVEAL = '.shead, .faqhead, .side, .side li, .feat, .q, .final, .hcopy, .hero .stage, .aud, .story-item'

function useReveal(root: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = root.current
    if (!el || stillMotion()) return
    const items = Array.from(el.querySelectorAll<HTMLElement>(REVEAL))
    items.forEach((item) => item.classList.add('rv'))
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        const target = entry.target as HTMLElement
        const siblings = Array.from(target.parentElement?.children ?? []).filter((x) => x.classList.contains('rv'))
        target.style.transitionDelay = Math.max(0, siblings.indexOf(target)) * 110 + 'ms'
        target.classList.add('in')
        observer.unobserve(target)
      })
    }, { threshold: 0.05, rootMargin: '0px 0px -12% 0px' })
    items.forEach((item) => observer.observe(item))
    return () => {
      observer.disconnect()
      items.forEach((item) => { item.classList.remove('rv', 'in'); item.style.transitionDelay = '' })
    }
  }, [root])
}

/* ─── sections ─── */

const HERO_SCENES: SceneKind[] = ['commissions', 'crm', 'leaderboard', 'performance']

function Hero() {
  const { L } = useLang()
  const { dark } = usePageTheme()
  const stageRef = useRef<HTMLDivElement>(null)
  const active = useRotation(HERO_SCENES.length, stageRef)

  return (
    <header className="hero">
      <div className="fxwrap" aria-hidden="true"><HeroFx dark={dark} /></div>
      <div className="w">
        <div className="hcopy">
          <h1>
            <span className="sm">{L('الشركات والمسوّقين', 'Companies and marketers')}</span><br />
            <span className="hl">{L('في مكان واحد', 'in one place')}</span>
          </h1>
          <p className="lead">
            {L('اعرض منتجاتك، اكتشف فرص التسويق بعمولة، وأدر الصفقات والعمولات بسهولة ', 'List your products, discover commission opportunities, and manage deals and commissions with ease ')}
            <span className="nb">{L('عبر منصة تجمع الطرفين.', 'on one platform for both sides.')}</span>
          </p>
          <div className="hcta"><GrowButton href="/#contact" label={L('ابدأ مجاناً', 'Start for free')} /></div>
        </div>
        <div className="stage" ref={stageRef}>
          <Rings />
          <Board scenes={HERO_SCENES} active={active} live />
          <span className="badge bd1"><Icon name="shield" />{L('عمولتك محفوظة ومرصودة', 'Your commission is recorded and protected')}</span>
          <span className="badge bd2"><Icon name="users" /><bdi dir="ltr">+1,400</bdi>&nbsp;{L('مسوّق نشط', 'active marketers')}</span>
        </div>
      </div>
    </header>
  )
}

function Duo() {
  const { L } = useLang()
  const sides = [
    {
      icon: 'brief' as const,
      title: L('للشركة صاحبة المنتج أو الخدمة', 'For the company behind the product or service'),
      lead: L('فريق بيع جاهز.', 'A ready sales team.'),
      points: [
        L('تعرض منتجك وتحدّد العمولة والشروط بنفسك', 'List your product and set the commission and terms yourself'),
        L('مسوّقون ينضمون له ويبدأون البيع', 'Marketers join it and start selling'),
        L('تشوف كل صفقة وصلتك', 'See every deal that reaches you'),
      ],
    },
    {
      icon: 'users' as const,
      title: L('للمسوّق', 'For the marketer'),
      lead: L('ابدأ من مكانك بدون رأس مال.', 'Start from where you are, with no capital.'),
      points: [
        L('تتصفّح المنتجات وتشوف عمولة كل واحد قبل ما تنضم', 'Browse products and see each commission before you join'),
        L('تسجّل عملاءك وصفقاتك في CRM خاص فيك', 'Record your customers and deals in your own CRM'),
        L('تتابع المستحق والجاري وإجمالي ما كسبته', 'Track what is payable, pending, and your total earnings'),
        L('تشوف ترتيبك بين المسوّقين في لوحة المتصدّرين', 'See your rank among marketers on the leaderboard'),
      ],
    },
  ]

  return (
    <section id="duo">
      <div className="w">
        <div className="shead"><h2>{L('طرفين على نفس المنصة', 'Two sides, one platform')}</h2></div>
        <div className="duo">
          {sides.map((side) => (
            <div className="side" key={side.title}>
              <div className="ico"><Icon name={side.icon} /></div>
              <h3>{side.title}</h3>
              <p className="lead">{side.lead}</p>
              <ul>{side.points.map((point) => <li key={point}><Icon name="chk" />{point}</li>)}</ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

type StoryStep = { eyebrow: string; title: string; desc: string; proof: string; icon: IconName; fx: number; scene: SceneKind }

function storySteps(L: Localize): StoryStep[] {
  return [
    {
      eyebrow: L('للشركة · البداية من منتجك', 'Company · Start with your product'),
      title: L('انشر منتجك بالشروط التي تناسبك', 'Publish your product on your terms'),
      desc: L('تضيف منتجك بوصفه وشروطه وتحدّد عمولته، ويظهر للمسوّقين في ثوانٍ.', 'Add your product, its terms and commission, and it is visible to marketers in seconds.'),
      proof: L('لا تحتاج أن تعيد شرح العرض لكل مسوّق.', 'No need to explain the offer to every marketer.'),
      icon: 'box', fx: 0, scene: 'publish',
    },
    {
      eyebrow: L('للمسوّق · اختر فرصتك', 'Marketer · Choose your opportunity'),
      title: L('تدخل على منتج تعرف كيف تبيعه', 'Join a product you know how to sell'),
      desc: L('تتصفّح المتاح، تشوف عمولة كل منتج وشروطه، وتنضم للي تعرف تبيعه.', 'Browse what is open, see each product’s commission and terms, and join the ones you can sell.'),
      proof: L('العمولة والشروط واضحة قبل أول تواصل.', 'Commission and terms are clear before your first outreach.'),
      icon: 'users', fx: 1, scene: 'opportunities',
    },
    {
      eyebrow: L('للمسوّق · عملك مرتب', 'Marketer · Keep work organized'),
      title: L('كل عميل وصفقة في CRM خاص فيك', 'Every customer and deal in your own CRM'),
      desc: L('عملاؤك وصفقاتك منظّمة، وتعرف كل صفقة وين وصلت ومتى آخر تواصل.', 'Your customers and deals stay organized, with every stage and last contact in view.'),
      proof: L('ما تضيع الفرص بين المحادثات والملفات.', 'No opportunities lost between chats and files.'),
      icon: 'brief', fx: 2, scene: 'crm',
    },
    {
      eyebrow: L('للشركة · تحكّم في الاعتماد', 'Company · Control approval'),
      title: L('كل صفقة تصل موثّقة وجاهزة للقرار', 'Every deal arrives documented and ready for a decision'),
      desc: L('كل صفقة تصلك بتفاصيل عميلها ومرحلتها، وتعتمدها بضغطة.', 'Every deal reaches you with its customer details and stage, ready to approve in one click.'),
      proof: L('تدفع على النتيجة، وليس على الوعود.', 'You pay for outcomes, not promises.'),
      icon: 'shield', fx: 3, scene: 'approval',
    },
    {
      eyebrow: L('للمسوّق · حقك محسوب', 'Marketer · Your earnings, counted'),
      title: L('المستحق والجاري قدامك لحظة بلحظة', 'Payable and pending, in front of you moment by moment'),
      desc: L('المستحق والجاري وإجمالي ما كسبته، محدّث لحظياً بدون ما تسأل أحد.', 'Payable, pending and total earnings, updated live without asking anyone.'),
      proof: L('تعرف بالضبط ماذا لك ومتى يصرف.', 'Know exactly what is yours and when it pays out.'),
      icon: 'wallet', fx: 4, scene: 'commissions',
    },
    {
      eyebrow: L('لكل الطرفين · قرارات أوضح', 'Both sides · Clearer decisions'),
      title: L('تشوف الأداء، وتتحرّك على بيانات حقيقية', 'See performance and act on real data'),
      desc: L('تشوف أي منتج يتحرّك، وكم صفقة وصلتك، ومن أي مسوّق جات. وتعرف أي فرصة تستحق جهدك أكثر.', 'See which product is moving, how many deals arrived and which marketer brought them, so you know where to focus next.'),
      proof: L('تقاريرك تشرح لك أين تكبر، لا مجرد أرقام.', 'Your reports show where to grow, not just numbers.'),
      icon: 'chart', fx: 5, scene: 'performance',
    },
  ]
}

/* pinned story: the track's scroll progress picks the active step */
function useStoryScroll(count: number) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    let frame = 0
    const sync = () => {
      const el = trackRef.current
      if (!el) return
      const total = el.offsetHeight - window.innerHeight
      if (total <= 0) return
      const progress = Math.min(0.999, Math.max(0, -el.getBoundingClientRect().top / total))
      const next = Math.min(count - 1, Math.floor(progress * count))
      setActive((current) => (current === next ? current : next))
    }
    const schedule = () => {
      window.cancelAnimationFrame(frame)
      frame = window.requestAnimationFrame(sync)
    }
    sync()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  }, [count])

  /* release the stage's GPU scene once the story is offscreen */
  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    const observer = new IntersectionObserver((entries) => setVisible(entries.some((entry) => entry.isIntersecting)), { rootMargin: '130px' })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const goTo = (index: number) => {
    const el = trackRef.current
    if (!el) return
    const total = el.offsetHeight - window.innerHeight
    if (total <= 0) return
    window.scrollTo({ top: window.scrollY + el.getBoundingClientRect().top + (total * (index + 0.5)) / count, behavior: 'smooth' })
  }

  return { trackRef, active, visible, goTo }
}

function StepCopy({ step }: { step: StoryStep }) {
  return (
    <div className="step">
      <span className="pill"><Icon name={step.icon} />{step.eyebrow}</span>
      <h3>{step.title}</h3>
      <p className="lead">{step.desc}</p>
      <p className="proof"><Icon name="chk" />{step.proof}</p>
    </div>
  )
}

function Story() {
  const { L } = useLang()
  const steps = storySteps(L)
  const { trackRef, active, visible, goTo } = useStoryScroll(steps.length)
  const current = steps[active]
  const head = (
    <div className="shead story-head">
      <h2>{L('من المنتج إلى النتيجة', 'From product to outcome')}</h2>
      <p className="lead">{L('مرّر لتشوف كيف تتصل كل خطوة باللي بعدها.', 'Scroll to see how every step connects to the next.')}</p>
    </div>
  )

  return (
    <section className="story" id="platform-journey">
      <div className="story-track" ref={trackRef}>
        <div className="story-viewport w">
          {head}
          <div className="story-grid">
            <div className="story-copy">
              <div className="rail" aria-label={L('خطوات المنصة', 'Platform steps')}>
                {steps.map((step, index) => (
                  <button
                    type="button"
                    className={index === active ? 'is-on' : index < active ? 'is-past' : undefined}
                    aria-current={index === active ? 'step' : undefined}
                    aria-label={L('الخطوة', 'Step') + ' ' + (index + 1)}
                    key={step.title}
                    onClick={() => goTo(index)}
                  >
                    {String(index + 1).padStart(2, '0')}
                  </button>
                ))}
              </div>
              <StepCopy step={current} key={active} />
            </div>
            <div className="stage story-stage">
              <Rings />
              <Board scenes={steps.map((step) => step.scene)} active={active}>
                <ActiveFx variant={current.fx} active={visible} />
              </Board>
            </div>
          </div>
          <div className="story-bar" aria-hidden="true"><i style={{ transform: 'scaleX(' + (active + 1) / steps.length + ')' }} /></div>
        </div>
      </div>

      {/* phones: the same steps as a plain list, each with its own board */}
      <div className="story-list w">
        {head}
        {steps.map((step) => (
          <article className="story-item" key={step.title}>
            <StepCopy step={step} />
            <div className="stage"><Rings /><Board scenes={[step.scene]} active={0} /></div>
          </article>
        ))}
      </div>
    </section>
  )
}

type Feature = { icon: IconName; title: string; desc: string }

function featureSets(L: Localize): Record<Audience, Feature[]> {
  return {
    marketer: [
      { icon: 'box', title: L('منتجات تنضم لها', 'Products to join'), desc: L('تتصفّح المتاح، تشوف عمولة كل منتج وشروطه، وتنضم للي تعرف تبيعه.', 'Browse what is open, see each product’s commission and terms, and join the ones you can sell.') },
      { icon: 'wallet', title: L('عمولات محسوبة', 'Commissions, counted'), desc: L('المستحق والجاري وإجمالي ما كسبته، محدّث لحظياً بدون ما تسأل أحد.', 'Payable, pending and total earnings, updated live without asking anyone.') },
      { icon: 'users', title: L('CRM خاص فيك', 'Your own CRM'), desc: L('عملاؤك وصفقاتك منظّمة، وتعرف كل صفقة وين وصلت ومتى آخر تواصل.', 'Your customers and deals stay organized, with every stage and last contact in view.') },
      { icon: 'cup', title: L('لوحة المتصدّرين', 'Leaderboard'), desc: L('ترتيبك بين المسوّقين قدامك، تعرف وين تقف ووش يحتاج منك جهد أكثر.', 'Your rank among marketers, so you know where you stand and where to push harder.') },
      { icon: 'chart', title: L('تقارير أدائك', 'Performance reports'), desc: L('عمولاتك شهرياً، نسبة إقفالك، وأي منتج يجيب لك أكثر.', 'Monthly commissions, your close rate, and which product earns you the most.') },
      { icon: 'bell', title: L('تنبيهات تسبقك', 'Alerts ahead of you'), desc: L('صفقة اعتُمدت، عمولة نُزّلت، أو صفقة وقفت، يوصلك أول بأول.', 'A deal approved, a commission paid, or a deal on hold: you hear about it first.') },
    ],
    company: [
      /* title per client revision (Sep 13): «انشر منصتك» replaces «انشر منتجك» */
      { icon: 'box', title: L('انشر منصتك', 'Publish your platform'), desc: L('تضيف منتجك بوصفه وشروطه وتحدّد عمولته، ويظهر للمسوّقين في ثوانٍ.', 'Add your product, its terms and commission, and it is visible to marketers in seconds.') },
      { icon: 'users', title: L('فريق بيع جاهز', 'A ready sales team'), desc: L('مسوّقون ينضمون لمنتجك ويبدأون البيع، بدون توظيف ولا رواتب ثابتة.', 'Marketers join your product and start selling, with no hiring and no fixed salaries.') },
      { icon: 'wallet', title: L('تدفع على النتيجة', 'Pay for outcomes'), desc: L('العمولة تُستحق فقط عند إقفال الصفقة، والمنصة تتولّى الاحتساب.', 'Commission is due only when a deal closes, and the platform handles the math.') },
      { icon: 'chart', title: L('أداء منتجاتك', 'Product performance'), desc: L('تشوف أي منتج يتحرّك، وكم صفقة وصلتك، ومن أي مسوّق جات.', 'See which product is moving, how many deals arrived, and which marketer brought them.') },
      { icon: 'brief', title: L('صفقات موثّقة', 'Documented deals'), desc: L('كل صفقة تصلك بتفاصيل عميلها ومرحلتها، وتعتمدها بضغطة.', 'Every deal reaches you with its customer details and stage, ready to approve in one click.') },
      { icon: 'shield', title: L('شروط تحميك', 'Terms that protect you'), desc: L('أنت تكتب شروط العمولة.', 'You write the commission terms.') },
    ],
  }
}

function Features() {
  const { L } = useLang()
  const [audience, setAudience] = useState<Audience>('marketer')
  const sets = featureSets(L)
  const tabs: { key: Audience; label: string }[] = [
    { key: 'marketer', label: L('للمسوّق', 'For marketers') },
    { key: 'company', label: L('للشركة', 'For companies') },
  ]

  return (
    <section className="feat-section" id="platform-workspace">
      <div className="w">
        <div className="shead"><h2>{L('كل أداة تحتاجها موجودة بمنصتنا', 'Every tool you need is on our platform')}</h2></div>
        <div className="aud" role="tablist" aria-label={L('اختر نوع الحساب', 'Choose account type')}>
          {tabs.map((tab) => (
            <button type="button" role="tab" id={'pf-tab-' + tab.key} aria-selected={audience === tab.key} aria-controls={'pf-panel-' + tab.key} className={audience === tab.key ? 'on' : undefined} onClick={() => setAudience(tab.key)} key={tab.key}>
              {tab.label}
            </button>
          ))}
        </div>
        {tabs.map((tab) => (
          <div className={'grid3 aset' + (audience === tab.key ? ' on' : '')} role="tabpanel" id={'pf-panel-' + tab.key} aria-labelledby={'pf-tab-' + tab.key} aria-hidden={audience !== tab.key} key={tab.key}>
            {sets[tab.key].map((feature) => (
              <div className="feat" key={feature.title}>
                <div className="ico"><Icon name={feature.icon} /></div>
                <h3>{feature.title}</h3>
                <p>{feature.desc}</p>
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  )
}

function Faq() {
  const { L } = useLang()
  const items = [
    [L('كيف تشتغل المنصة؟', 'How does the platform work?'), L('الشركات تعرض منتجاتها وفرصها، والمسوقون يختارون الفرص المناسبة لهم. ومن خلال المنصة يقدر الطرفان يتابعون الصفقات والعمولات من مكان واحد.', 'Companies list their products and opportunities, and marketers choose the ones that suit them. Both sides then follow deals and commissions from one place.')],
    [L('كيف تنحسب العمولة؟', 'How is the commission calculated?'), L('كل منتج أو فرصة يكون لها عمولة محددة وواضحة من البداية، بحيث يعرف المسوّق عمولته وتعرف الشركة تكلفة كل صفقة قبل بدء التسويق.', 'Every product or opportunity has a clear commission from the start, so the marketer knows their earnings and the company knows the cost of each deal before marketing begins.')],
    [L('كيف يتم اعتماد الصفقة؟', 'How is a deal approved?'), L('بعد تسجيل الصفقة، تتم مراجعتها واعتمادها حسب تفاصيل العملية. وبعد الاعتماد تظهر حالة الصفقة والعمولة بشكل واضح للطرفين.', 'After a deal is recorded, it is reviewed and approved according to its details. Once approved, the deal and commission status is clear to both sides.')],
    [L('متى تُصرف العمولة؟', 'When is the commission paid?'), L('بعد اعتماد الصفقة تنتقل العمولة إلى حالة الاستحقاق، ويتم صرفها بحسب دورة الدفع المحددة في المنصة.', 'Once a deal is approved, its commission becomes payable and is paid according to the platform’s payment cycle.')],
    [L('هل أقدر أتعامل مع أكثر من منتج أو مسوّق؟', 'Can I work with more than one product or marketer?'), L('نعم. المسوّق يقدر يشارك في أكثر من فرصة، والشركة تقدر تعرض أكثر من منتج وتتعامل مع عدة مسوقين من خلال حساب واحد.', 'Yes. A marketer can join more than one opportunity, and a company can list several products and work with several marketers from one account.')],
    [L('كيف أتابع الصفقات والعمولات؟', 'How do I follow deals and commissions?'), L('كل طرف عنده لوحة تحكم توضح له الصفقات وحالتها والعمولات المرتبطة فيها، عشان تكون رحلة البيع واضحة من البداية للنهاية.', 'Each side has a dashboard showing deals, their status and the related commissions, so the sales journey is clear from start to finish.')],
    [L('وش أحتاج عشان أبدأ؟', 'What do I need to start?'), L('اختر نوع حسابك، أكمل بياناتك، وبعدها تقدر تبدأ بعرض منتجاتك كشركة أو اكتشاف فرص التسويق كمسوّق.', 'Choose your account type, complete your details, and then start listing products as a company or discovering opportunities as a marketer.')],
  ]

  return (
    <section id="faq">
      <div className="w faqgrid">
        <header className="faqhead"><h2>{L('أسئلة قبل ما تبدأ', 'Questions before you start')}</h2></header>
        <div className="faq">
          {items.map(([question, answer], index) => (
            <details className="q" open={index === 0} key={question}>
              <summary><span>{question}</span><i /></summary>
              <div className="a">{answer}</div>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}

/* the closing block carries the landing's contact-panel scene */
function Final() {
  const { L } = useLang()
  const { dark } = usePageTheme()
  return (
    <section className="final-section">
      <div className="w">
        <div className="final">
          <ContactFx dark={dark} />
          <p className="lead">{L('سجّل بخطوة وحدة، اختر أول منتج، وابدأ تكسب من أول صفقة تقفلها', 'Sign up in one step, choose your first product, and start earning from your first closed deal')}</p>
          <div className="hcta"><GrowButton href="/#contact" label={L('ابدأ مجاناً', 'Start for free')} /></div>
        </div>
      </div>
    </section>
  )
}

export default function PlatformPage() {
  const root = useRef<HTMLDivElement>(null)
  useReveal(root)

  return (
    <PageShell active="platform">
      <div className="platform" ref={root}>
        <Defs />
        <Hero />
        <Duo />
        <Story />
        <Features />
        <Faq />
        <Final />
      </div>
    </PageShell>
  )
}
