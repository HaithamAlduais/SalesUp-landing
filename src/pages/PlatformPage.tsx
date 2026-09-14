import { useEffect, useRef, useState } from 'react'
import type { KeyboardEvent, PointerEvent as ReactPointerEvent, ReactNode } from 'react'
import { AnimatePresence, domAnimation, LazyMotion, m, MotionConfig } from 'motion/react'
import { ActiveFx, FinalCtaFx, HeroFx } from '../components/CardFx'
import { PageShell } from '../shared/PageShell'
import { useLang } from '../shared/i18n'
import { usePageTheme } from '../shared/theme'

type IconName = 'box' | 'wallet' | 'users' | 'cup' | 'chart' | 'bell' | 'brief' | 'shield' | 'spark'
type Audience = 'marketer' | 'company'
type ConsoleKind = 'publish' | 'opportunities' | 'pipeline' | 'approval' | 'payout' | 'analytics'
type FeatureVisualKind = 'offers' | 'balance' | 'pipeline' | 'leaderboard' | 'report' | 'alerts' | 'publish' | 'team' | 'outcome' | 'approvals' | 'terms'
type Localize = (arabic: string, english: string) => string

type Feature = {
  icon: IconName
  title: string
  desc: string
}

type StoryStep = {
  audience: Audience
  eyebrow: string
  title: string
  desc: string
  proof: string
  icon: IconName
  fx: number
  kind: ConsoleKind
  consoleAction: string
  consoleTitle: string
  consoleStatus: string
  metricLabel: string
  metricValue: string
  metricHint: string
  secondaryLabel: string
  secondaryValue: string
  rows: [string, string][]
  bars: number[]
}

function updateRolePointer(event: ReactPointerEvent<HTMLElement>) {
  if (event.pointerType !== 'mouse') return
  const card = event.currentTarget
  const bounds = card.getBoundingClientRect()
  card.style.setProperty('--role-pointer-x', `${Math.round(((event.clientX - bounds.left) / bounds.width) * 100)}%`)
  card.style.setProperty('--role-pointer-y', `${Math.round(((event.clientY - bounds.top) / bounds.height) * 100)}%`)
  card.dataset.pointerActive = 'true'
}

function clearRolePointer(event: ReactPointerEvent<HTMLElement>) {
  event.currentTarget.removeAttribute('data-pointer-active')
}

function Icon({ name }: { name: IconName }) {
  const paths: Record<IconName, ReactNode> = {
    box: <><path d="m12 3 8 4.3v9.4L12 21l-8-4.3V7.3L12 3Z" /><path d="m4 7.3 8 4.3 8-4.3M12 21v-9.4" /></>,
    wallet: <><rect x="3.5" y="6" width="17" height="13" rx="2.5" /><path d="M6 6V4.5h10M15.5 12.5h2" /></>,
    users: <><circle cx="9" cy="8" r="3" /><path d="M3 20c0-3.4 2.7-5.5 6-5.5s6 2.1 6 5.5M16 5.4a3 3 0 0 1 0 5.7M18.2 20c-.1-2.3-1-3.8-2.6-4.7" /></>,
    cup: <><path d="M8 3h8v5a4 4 0 0 1-8 0V3Z" /><path d="M8 4.5H5.5v1A3.5 3.5 0 0 0 9 9m7-4.5h2.5v1A3.5 3.5 0 0 1 15 9M12 12v4m-3 4h6m-5-4h4" /></>,
    chart: <><path d="M4 19V9m6 10V5m6 14v-7m6 7H2" /></>,
    bell: <><path d="M18 15v-4a6 6 0 1 0-12 0v4l-1.6 2.4h15.2L18 15Z" /><path d="M10 20a2.2 2.2 0 0 0 4 0" /></>,
    brief: <><rect x="3" y="7.5" width="18" height="12" rx="2.5" /><path d="M9 7.5V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1.5M3 12.5h18" /></>,
    shield: <path d="m12 3 7.5 3.2v5.1c0 4.3-3.2 7.9-7.5 8.7-4.3-.8-7.5-4.4-7.5-8.7V6.2L12 3Z" />,
    spark: <path d="m12 2 1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2Zm7 14 1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3Z" />,
  }

  return <svg className="platform-icon" viewBox="0 0 24 24" aria-hidden="true">{paths[name]}</svg>
}

function Arrow() {
  return <svg className="platform-arrow" viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5m0 0 6-6m-6 6 6 6" /></svg>
}

function Check() {
  return <svg className="platform-check" viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4.3 4.4L19 7" /></svg>
}

function CommissionBoard() {
  const rows = [
    ['ن', 'نظام نقاط بيع · متجر نُوى', '1,240'],
    ['ر', 'منصة CRM · اشتراك سنوي', '3,610'],
    ['د', 'أمن سيبراني · تأمين درب', '640'],
  ]

  return (
    <div className="commission-board" aria-label="لوحة العمولات">
      <div className="board-top">
        <span className="board-brand"><i /> SALESUP</span>
        <span className="board-live"><i /> مباشر</span>
      </div>
      <div className="board-total">
        <span>إجمالي عمولاتك</span>
        <b dir="ltr">12,480 <small>ر.س</small></b>
        <em>+18.4% هذا الشهر</em>
      </div>
      <div className="board-stat-grid">
        <div><span>قيد الاعتماد</span><b dir="ltr">3,150</b><small>4 صفقات</small></div>
        <div><span>صفقات مقفلة</span><b dir="ltr">27</b><small>من أصل 41</small></div>
      </div>
      <div className="board-chart" aria-hidden="true">
        <span style={{ height: '32%' }} /><span style={{ height: '49%' }} /><span style={{ height: '42%' }} /><span style={{ height: '66%' }} /><span style={{ height: '56%' }} /><span className="is-now" style={{ height: '88%' }} />
      </div>
      <div className="board-list">
        <div className="board-list-label"><span>آخر الصفقات</span><span>العمولة</span></div>
        {rows.map(([initial, label, amount]) => <div className="board-row" key={label}>
          <span className="board-avatar">{initial}</span><span>{label}<small>اعتُمدت الآن</small></span><b dir="ltr">{amount}</b>
        </div>)}
      </div>
      <div className="board-badge"><span><Icon name="shield" /></span>عمولتك محفوظة ومرصودة</div>
    </div>
  )
}

function PlatformHero() {
  const { dark } = usePageTheme()
  const { L } = useLang()

  return (
    <section className="platform-native-hero">
      <div className="platform-native-fx" aria-hidden="true"><HeroFx dark={dark} /></div>
      <div className="platform-hero-halo platform-hero-halo--two" aria-hidden="true" />
      <div className="platform-native-wrap">
        <div className="platform-hero-copy">
          <span className="platform-kicker"><span className="platform-kicker-pulse" />{L('منصة سيلز أب', 'SalesUp Platform')}</span>
          <h1>{L('الشركات والمسوّقين', 'Companies and marketers')} <em>{L('في مكان واحد', 'in one place')}</em></h1>
          <p>{L('اعرض منتجاتك، اكتشف فرص التسويق بعمولة، وأدر الصفقات والعمولات بسهولة عبر منصة تجمع الطرفين.', 'List products, discover commission opportunities, and manage deals in one shared platform.')}</p>
          <div className="platform-hero-actions">
            <a className="platform-primary" href="#platform-journey">{L('ابدأ مجاناً', 'Start for free')}<Arrow /></a>
            <a className="platform-text-link" href="#platform-workspace">{L('استكشف المنصة', 'Explore the platform')}<span aria-hidden="true">↙</span></a>
          </div>
          <div className="platform-proof">
            <span><Check />{L('بدون رسوم للبدء', 'No fee to get started')}</span>
            <span><Check />{L('حقوق كل طرف واضحة', 'Clear rights for both sides')}</span>
          </div>
        </div>
        <div className="platform-visual">
          <div className="platform-orbit platform-orbit-a" aria-hidden="true" />
          <div className="platform-orbit platform-orbit-b" aria-hidden="true" />
          <div className="platform-orbit platform-orbit-c" aria-hidden="true" />
          <CommissionBoard />
          <div className="platform-visual-note platform-visual-note--top"><span><Icon name="spark" /></span>{L('كل خطوة مرئية', 'Every step visible')}</div>
          <div className="platform-visual-note platform-visual-note--bottom"><b dir="ltr">1,400+</b>{L('مسوّق نشط', 'active marketers')}</div>
        </div>
      </div>
    </section>
  )
}

function RoleCards() {
  const { L } = useLang()
  const roles = [
    {
      icon: 'brief' as const,
      index: '01',
      tone: 'company',
      title: L('للشركة صاحبة المنتج أو الخدمة', 'For product businesses'),
      lead: L('فريق بيع جاهز، بدون توظيف ولا رواتب ثابتة.', 'A sales network, without fixed hiring overhead.'),
      journey: [
        L('انشر منتجك', 'Publish your product'),
        L('حدّد العمولة', 'Set commission'),
        L('اعتمد الصفقة', 'Approve the deal'),
      ],
      points: [
        L('تعرض منتجك وتحدّد العمولة والشروط بنفسك', 'Set your product, commission and terms'),
        L('مسوّقون ينضمون له ويبدأون البيع', 'Marketers join and start selling'),
        L('تشوف كل صفقة وصلتك', 'See every deal that reaches you'),
      ],
    },
    {
      icon: 'users' as const,
      index: '02',
      tone: 'marketer',
      title: L('للمسوّق', 'For marketers'),
      lead: L('ابدأ من مكانك بدون رأس مال.', 'Start from anywhere, without capital.'),
      journey: [
        L('اختر الفرصة', 'Choose an opportunity'),
        L('سجّل العميل', 'Record the customer'),
        L('تابع الاستحقاق', 'Track your payout'),
      ],
      points: [
        L('تتصفّح المنتجات وتشوف عمولة كل واحد قبل ما تنضم', 'Browse products and compare commissions'),
        L('تسجّل عملاءك وصفقاتك في CRM خاص فيك', 'Track customers and deals in your own CRM'),
        L('تشوف ترتيبك بين المسوّقين في لوحة المتصدّرين', 'See your rank in the marketer leaderboard'),
      ],
    },
  ]

  return (
    <section className="platform-roles" id="platform-roles">
      <div className="platform-section-head platform-section-head--split">
        <span>{L('طرفين على نفس المنصة', 'Two sides, one platform')}</span>
        <h2>{L('نفس الرحلة، لكن كل طرف يرى ما يحتاجه بالضبط', 'One journey, with the right view for each side')}</h2>
      </div>
      <div className="platform-role-journey">
        {roles.map((role) => (
          <m.article
            className={['platform-role-card', 'platform-role-card--' + role.tone].join(' ')}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.42, ease: [0.22, 0.8, 0.2, 1] }}
            onPointerMove={updateRolePointer}
            onPointerLeave={clearRolePointer}
            key={role.title}
          >
            <div className="platform-role-top">
              <span className="platform-role-index" dir="ltr">{role.index}</span>
              <span className="platform-icon-shell"><Icon name={role.icon} /></span>
            </div>
            <h3>{role.title}</h3>
            <p>{role.lead}</p>
            <ol className="platform-role-path">
              {role.journey.map((step, index) => <li key={step}><span dir="ltr">{String(index + 1).padStart(2, '0')}</span><b>{step}</b></li>)}
            </ol>
            <ul>{role.points.map((point) => <li key={point}><Check />{point}</li>)}</ul>
          </m.article>
        ))}
        <div className="platform-role-handoff" aria-hidden="true">
          <span><Icon name="shield" /></span>
          <b>{L('صفقة موثّقة', 'Documented deal')}</b>
          <small>{L('اتفاق واضح للطرفين', 'Clear for both sides')}</small>
        </div>
      </div>
    </section>
  )
}

function createStory(L: Localize): StoryStep[] {
  return [
    {
      audience: 'company',
      eyebrow: L('للشركة · البداية من منتجك', 'Company · Start with your product'),
      title: L('انشر منتجك بالشروط التي تناسبك', 'Publish your product on your terms'),
      desc: L('تضيف منتجك بوصفه وشروطه وتحدّد عمولته، ويظهر للمسوّقين في ثوانٍ.', 'Add your product, its terms and commission, then make it visible to marketers in seconds.'),
      proof: L('لا تحتاج أن تعيد شرح العرض لكل مسوّق.', 'No need to repeat your offer to every marketer.'),
      icon: 'box',
      fx: 0,
      kind: 'publish',
      consoleAction: L('نشر المنتج', 'Publish product'),
      consoleTitle: L('إضافة منتج جديد', 'Create a new product'),
      consoleStatus: L('جاهز للنشر', 'Ready to publish'),
      metricLabel: L('عمولة المنتج', 'Product commission'),
      metricValue: '12%',
      metricHint: L('تظهر قبل الانضمام', 'Visible before joining'),
      secondaryLabel: L('المسوّقون المهتمون', 'Interested marketers'),
      secondaryValue: '86',
      rows: [[L('نظام نقاط بيع', 'POS system'), L('نشط', 'Live')], [L('متجر نُوى', 'Nuwa Store'), L('مراجعة', 'Review')], [L('اشتراك سنوي', 'Annual plan'), L('مسودة', 'Draft')]],
      bars: [34, 48, 61, 54, 77, 92],
    },
    {
      audience: 'marketer',
      eyebrow: L('للمسوّق · اختر فرصتك', 'Marketer · Choose your opportunity'),
      title: L('تدخل على منتج تعرف كيف تبيعه', 'Join a product you know how to sell'),
      desc: L('تتصفّح المتاح، تشوف عمولة كل منتج وشروطه، وتنضم للي تعرف تبيعه.', 'Browse active offers, see each product’s commission and terms, then join the ones you can sell.'),
      proof: L('العمولة والشروط واضحة قبل أول تواصل.', 'Commission and terms are clear before your first outreach.'),
      icon: 'users',
      fx: 1,
      kind: 'opportunities',
      consoleAction: L('استعراض الفرص', 'Browse offers'),
      consoleTitle: L('فرص مناسبة لك', 'Opportunities for you'),
      consoleStatus: L('12 فرصة متاحة', '12 live opportunities'),
      metricLabel: L('أعلى عمولة', 'Highest commission'),
      metricValue: '18%',
      metricHint: L('شروط واضحة', 'Clear terms'),
      secondaryLabel: L('منتجات انضممت لها', 'Joined products'),
      secondaryValue: '6',
      rows: [[L('منصة CRM', 'CRM platform'), '18%'], [L('متجر إلكتروني', 'E-commerce'), '14%'], [L('خدمة استضافة', 'Hosting service'), '12%']],
      bars: [28, 44, 38, 67, 72, 82],
    },
    {
      audience: 'marketer',
      eyebrow: L('للمسوّق · عملك مرتب', 'Marketer · Keep work organized'),
      title: L('كل عميل وصفقة في CRM خاص فيك', 'Every customer and deal in your own CRM'),
      desc: L('عملاؤك وصفقاتك منظّمة، وتعرف كل صفقة وين وصلت ومتى آخر تواصل.', 'Keep customers and deals organized, with a clear view of each deal’s stage and last contact.'),
      proof: L('ما تضيع الفرص بين المحادثات والملفات.', 'No opportunities lost between chats and spreadsheets.'),
      icon: 'brief',
      fx: 2,
      kind: 'pipeline',
      consoleAction: L('إضافة صفقة', 'Add deal'),
      consoleTitle: L('الصفقات · CRM', 'Deals · CRM'),
      consoleStatus: L('12 صفقة نشطة', '12 active deals'),
      metricLabel: L('نسبة الإقفال', 'Close rate'),
      metricValue: '64%',
      metricHint: L('هذا الشهر', 'This month'),
      secondaryLabel: L('متابعة اليوم', 'Follow-ups today'),
      secondaryValue: '9',
      rows: [[L('مصنع دار النور', 'Dar Al Noor'), L('عرض سعر', 'Proposal')], [L('مؤسسة أفق', 'Ofoq Co.'), L('متابعة', 'Follow up')], [L('شركة ريادة', 'Riyada Co.'), L('إقفال', 'Closing')]],
      bars: [22, 35, 62, 58, 73, 86],
    },
    {
      audience: 'company',
      eyebrow: L('للشركة · تحكّم في الاعتماد', 'Company · Control approval'),
      title: L('كل صفقة تصل موثّقة وجاهزة للقرار', 'Every deal arrives documented and ready'),
      desc: L('كل صفقة تصلك بتفاصيل عميلها ومرحلتها، وتعتمدها بضغطة.', 'Every deal arrives with customer details and status, ready for approval in one click.'),
      proof: L('تدفع على النتيجة، وليس على الوعود.', 'You pay for outcomes, not promises.'),
      icon: 'shield',
      fx: 3,
      kind: 'approval',
      consoleAction: L('مراجعة الطلبات', 'Review requests'),
      consoleTitle: L('صفقات بانتظار الاعتماد', 'Deals awaiting approval'),
      consoleStatus: L('4 تحتاج قرارك', '4 need your decision'),
      metricLabel: L('قيمة الفرص', 'Opportunity value'),
      metricValue: '48K',
      metricHint: L('ر.س هذا الأسبوع', 'SAR this week'),
      secondaryLabel: L('تم اعتمادها', 'Approved'),
      secondaryValue: '27',
      rows: [[L('متجر نُوى', 'Nuwa Store'), L('جديد', 'New')], [L('مؤسسة أفق', 'Ofoq Co.'), L('مكتمل', 'Complete')], [L('دار النور', 'Dar Al Noor'), L('مراجعة', 'Review')]],
      bars: [45, 31, 64, 55, 76, 91],
    },
    {
      audience: 'marketer',
      eyebrow: L('للمسوّق · حقك محسوب', 'Marketer · Earnings made clear'),
      title: L('المستحق والجاري قدامك لحظة بلحظة', 'Payable and pending earnings, moment by moment'),
      desc: L('المستحق والجاري وإجمالي ما كسبته، محدّث لحظياً بدون ما تسأل أحد.', 'See payable, pending and total earnings updated live, without having to ask anyone.'),
      proof: L('تعرف بالضبط ماذا لك ومتى يصرف.', 'Know exactly what is yours and when it pays out.'),
      icon: 'wallet',
      fx: 4,
      kind: 'payout',
      consoleAction: L('سجل العمولات', 'Commission ledger'),
      consoleTitle: L('العمولات', 'Commissions'),
      consoleStatus: L('محدّثة الآن', 'Updated now'),
      metricLabel: L('إجمالي عمولاتك', 'Total commissions'),
      metricValue: '12,480',
      metricHint: L('ر.س هذا الشهر', 'SAR this month'),
      secondaryLabel: L('قيد الاعتماد', 'Pending approval'),
      secondaryValue: '3,150',
      rows: [[L('منصة CRM', 'CRM platform'), '3,610'], [L('نظام نقاط بيع', 'POS system'), '1,240'], [L('خدمة حماية', 'Security service'), '640']],
      bars: [31, 42, 53, 49, 69, 95],
    },
    {
      audience: 'company',
      eyebrow: L('لكل الطرفين · قرارات أوضح', 'Both sides · Clearer decisions'),
      title: L('تشوف الأداء، وتتحرّك على بيانات حقيقية', 'See performance and act on real data'),
      desc: L('تشوف أي منتج يتحرّك، وكم صفقة وصلتك، ومن أي مسوّق جات. وتعرف أي فرصة تستحق جهدك أكثر.', 'See which product is moving, how many deals arrived, and which marketer brought them—so you know where to focus next.'),
      proof: L('تقاريرك تشرح لك أين تكبر، لا مجرد أرقام.', 'Reports show where to grow, not just a wall of numbers.'),
      icon: 'chart',
      fx: 5,
      kind: 'analytics',
      consoleAction: L('عرض التقرير', 'View report'),
      consoleTitle: L('نمو الأداء', 'Performance growth'),
      consoleStatus: L('هذا الشهر', 'This month'),
      metricLabel: L('نمو العمولات', 'Commission growth'),
      metricValue: '+24.8%',
      metricHint: L('مقارنة بالشهر الماضي', 'vs. last month'),
      secondaryLabel: L('صفقات مقفلة', 'Closed deals'),
      secondaryValue: '27',
      rows: [[L('نظام نقاط بيع', 'POS system'), '+31%'], [L('منصة CRM', 'CRM platform'), '+24%'], [L('خدمة استضافة', 'Hosting service'), '+19%']],
      bars: [25, 36, 46, 62, 74, 96],
    },
  ]
}

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
      const rect = el.getBoundingClientRect()
      const progress = Math.min(0.999, Math.max(0, -rect.top / total))
      const next = Math.min(count - 1, Math.floor(progress * count))
      setActive((current) => current === next ? current : next)
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

  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => setVisible(entries.some((entry) => entry.isIntersecting)),
      { rootMargin: '130px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const goTo = (index: number) => {
    const el = trackRef.current
    if (!el) return
    const total = el.offsetHeight - window.innerHeight
    if (total <= 0) return
    const target = window.scrollY + el.getBoundingClientRect().top + (total * index / Math.max(count - 1, 1))
    window.scrollTo({ top: target, behavior: 'smooth' })
  }

  return { trackRef, active, visible, goTo }
}

function ConsolePlot({ scene, label, value }: { scene: StoryStep; label: string; value: string }) {
  const { L } = useLang()
  return (
    <article className="console-plot">
      <div className="console-plot-head">
        <div><span>{label}</span><b dir="ltr">{value}</b></div>
        <span className="console-period">{L('أبريل — يونيو', 'Apr — Jun')}</span>
      </div>
      <div className="console-plot-grid" aria-hidden="true">
        <i /><i /><i />
      </div>
      <div className="console-plot-bars" dir="ltr" aria-hidden="true">
        {scene.bars.map((height, index) => <i key={index} style={{ height: height + '%' }} className={index === scene.bars.length - 1 ? 'is-last' : ''} />)}
      </div>
      <div className="console-plot-axis"><span>{L('أبريل', 'Apr')}</span><span>{L('مايو', 'May')}</span><span>{L('يونيو', 'Jun')}</span></div>
    </article>
  )
}

function ConsoleScene({ scene }: { scene: StoryStep }) {
  const { L } = useLang()

  if (scene.kind === 'publish') {
    return (
      <div className="console-scene console-scene--publish">
        <article className="console-product-identity">
          <span className="console-product-symbol">ن</span>
          <div><span>{L('المنتج', 'Product')}</span><b>{L('نظام نقاط بيع', 'POS system')}</b><small>{L('حلول المتاجر · اشتراك سنوي', 'Retail solutions · annual plan')}</small></div>
          <em><i />{L('نشط', 'Live')}</em>
        </article>
        <article className="console-commission-rule">
          <span>{scene.metricLabel}</span><b dir="ltr">{scene.metricValue}</b><small>{L('تظهر بوضوح قبل الانضمام', 'Clear before a marketer joins')}</small>
        </article>
        <article className="console-field-grid">
          <p><span>{L('الفئة', 'Category')}</span><b>{L('حلول المتاجر', 'Retail solutions')}</b></p>
          <p><span>{L('حالة النشر', 'Publishing')}</span><b>{L('مكتمل', 'Complete')}</b></p>
          <p><span>{L('الشروط', 'Terms')}</span><b>{L('عرض واضح للمسوّق', 'Visible to marketers')}</b></p>
          <p><span>{L('المهتمون', 'Interested')}</span><b dir="ltr">{scene.secondaryValue}</b></p>
        </article>
        <article className="console-ready-card">
          <span><Icon name="spark" /></span>
          <div><b>{L('جاهز للنشر', 'Ready to publish')}</b><small>{L('كل بيانات المنتج مكتملة', 'All required information is complete')}</small></div>
          <i>✓</i>
        </article>
      </div>
    )
  }

  if (scene.kind === 'opportunities') {
    return (
      <div className="console-scene console-scene--offers">
        <div className="console-scene-toolbar"><span>{L('فرص مقترحة لك', 'Suggested opportunities')}</span><b>{scene.consoleStatus}</b></div>
        <div className="console-offer-list">
          {scene.rows.map(([name, commission], index) => (
            <article key={name}>
              <span className="console-row-avatar">{String(index + 1).padStart(2, '0')}</span>
              <div><b>{name}</b><small>{index === 0 ? L('اشتراك سنوي · مبيعات B2B', 'Annual plan · B2B sales') : index === 1 ? L('خدمة جاهزة للتسويق', 'Ready to market') : L('فرصة نشطة الآن', 'Live opportunity')}</small></div>
              <strong dir="ltr">{commission}</strong><em>{L('مفتوحة', 'Open')}</em>
            </article>
          ))}
        </div>
        <div className="console-offer-footer"><span>{L('فلتر حسب العمولة أو المجال', 'Filter by commission or sector')}</span><b>{L('استكشف الكل', 'Browse all')} ←</b></div>
      </div>
    )
  }

  if (scene.kind === 'pipeline') {
    const lanes = [
      [L('جديد', 'New'), scene.rows[0][0], L('عميل جديد', 'New lead')],
      [L('متابعة', 'Follow up'), scene.rows[1][0], L('اتصال اليوم', 'Call today')],
      [L('عرض', 'Proposal'), scene.rows[2][0], L('بانتظار الرد', 'Awaiting reply')],
    ]
    return (
      <div className="console-scene console-scene--pipeline">
        <div className="console-pipeline-summary"><span>{L('رحلة الصفقات', 'Deal journey')}</span><b>{L('كل شيء مرتب في CRM واحد', 'Everything organized in one CRM')}</b></div>
        <div className="console-pipeline-board">
          {lanes.map(([lane, deal, detail], index) => (
            <article key={lane}>
              <header><span><i />{lane}</span><b dir="ltr">{index + 2}</b></header>
              <p><strong>{deal}</strong><small>{detail}</small></p>
              <p className="is-muted"><strong>{L('فرصة جديدة', 'New opportunity')}</strong><small>{L('آخر تواصل: اليوم', 'Last touch: today')}</small></p>
            </article>
          ))}
        </div>
      </div>
    )
  }

  if (scene.kind === 'approval') {
    return (
      <div className="console-scene console-scene--approval">
        <article className="console-approval-summary">
          <div><span>{L('تحتاج قرارك', 'Need your decision')}</span><b dir="ltr">04</b><small>{L('طلبات موثّقة بالكامل', 'Fully documented requests')}</small></div>
          <span className="console-approval-seal"><Icon name="shield" /></span>
        </article>
        <div className="console-approval-list">
          {scene.rows.map(([name, status], index) => (
            <article key={name}>
              <span className="console-row-avatar">{String(index + 1).padStart(2, '0')}</span>
              <div><b>{name}</b><small>{L('بيانات العميل والمرحلة مكتملة', 'Customer details and stage complete')}</small></div>
              <strong>{status}</strong><em>{L('استعراض', 'Review')}</em>
            </article>
          ))}
        </div>
      </div>
    )
  }

  if (scene.kind === 'payout') {
    return (
      <div className="console-scene console-scene--payout">
        <article className="console-payout-hero">
          <span>{scene.metricLabel}</span><b dir="ltr">{scene.metricValue} <small>ر.س</small></b><em><i />{L('محدّث الآن', 'Updated now')}</em>
          <div><span>{L('المستحق', 'Payable')}<b dir="ltr">8,930</b></span><span>{L('الجاري', 'Pending')}<b dir="ltr">{scene.secondaryValue}</b></span></div>
        </article>
        <div className="console-transaction-list">
          {scene.rows.map(([name, amount]) => <p key={name}><span><i />{name}</span><b dir="ltr">{amount} <small>ر.س</small></b><em>{L('اعتُمدت', 'Approved')}</em></p>)}
        </div>
      </div>
    )
  }

  return (
    <div className="console-scene console-scene--analytics">
      <div className="console-analytics-stat"><div><span>{scene.metricLabel}</span><b dir="ltr">{scene.metricValue}</b><small>{scene.metricHint}</small></div><span className="console-analytics-badge"><Icon name="chart" /></span></div>
      <div className="console-analytics-grid">
        <ConsolePlot scene={scene} label={L('اتجاه الأداء', 'Performance trend')} value={scene.metricValue} />
        <article className="console-rank-list">
          <div><span>{L('الأفضل هذا الشهر', 'Top this month')}</span><b>{L('التفاصيل', 'Details')}</b></div>
          {scene.rows.map(([name, growth], index) => <p key={name}><span><i>{index + 1}</i>{name}</span><b dir="ltr">{growth}</b></p>)}
        </article>
      </div>
    </div>
  )
}

function PlatformConsole({ scene }: { scene: StoryStep }) {
  const { L } = useLang()
  const navItems: IconName[] = ['box', 'users', 'brief', 'wallet', 'chart']
  const activeIndex: Record<ConsoleKind, number> = { publish: 0, opportunities: 1, pipeline: 2, approval: 2, payout: 3, analytics: 4 }
  const activity: Record<ConsoleKind, string> = {
    publish: L('شروط الانضمام والعمولة جاهزة للمراجعة', 'Joining terms and commission are ready to review'),
    opportunities: L('العمولة والشروط واضحة قبل أول تواصل', 'Commission and terms are clear before outreach'),
    pipeline: L('آخر تواصل وخطوتك التالية في مكان واحد', 'Last contact and next step in one place'),
    approval: L('بيانات العميل والمرحلة جاهزة للقرار', 'Customer details and stage are ready to decide'),
    payout: L('حالة كل استحقاق ظاهرة لك بوضوح', 'Every payout state is clearly visible'),
    analytics: L('اتجاه الأداء يبيّن أين تركز الآن', 'Performance direction shows where to focus'),
  }

  return (
    <div className="platform-console" aria-label={L('معاينة توضيحية للمنصة', 'Illustrative platform preview')}>
      <div className="platform-console-top">
        <div className="platform-console-brand"><span /><b>SALESUP</b><small>PLATFORM</small></div>
        <div className="console-breadcrumb"><span>{L('منصة سيلز أب', 'SalesUp platform')}</span><i>/</i><b>{scene.audience === 'company' ? L('الشركة', 'Company') : L('المسوّق', 'Marketer')}</b></div>
        <div className="console-utility"><span className="console-search">⌕ {L('بحث', 'Search')}</span><span className="console-avatar">س</span></div>
      </div>
      <div className="platform-console-layout">
        <aside className="platform-console-nav" aria-hidden="true">
          {navItems.map((item, index) => <span className={index === activeIndex[scene.kind] ? 'is-active' : ''} key={item}><Icon name={item} /></span>)}
          <span className="console-nav-avatar">س</span>
        </aside>
        <div className="platform-console-main">
          <div className="platform-console-heading">
            <div><span><i />{scene.consoleStatus}</span><h3>{scene.consoleTitle}</h3></div>
            <span className="platform-console-action"><span>+</span>{scene.consoleAction}</span>
          </div>
          <ConsoleScene scene={scene} />
          <div className="console-activity"><span><i />{activity[scene.kind]}</span><small>{L('حالة موثّقة', 'Documented state')}</small></div>
        </div>
      </div>
    </div>
  )
}

function PlatformStory() {
  const { L } = useLang()
  const steps = createStory(L)
  const { trackRef, active, visible, goTo } = useStoryScroll(steps.length)
  const current = steps[active]
  const railLabels = [
    L('منتج', 'Product'),
    L('فرصة', 'Opportunity'),
    L('صفقة', 'Deal'),
    L('قرار', 'Decision'),
    L('عمولة', 'Payout'),
    L('نمو', 'Growth'),
  ]

  return (
    <section className="platform-story" id="platform-journey">
      <div className="platform-story-track" ref={trackRef}>
        <div className="platform-story-viewport">
          <div className="platform-story-intro">
            <span>{L('من المنتج إلى النتيجة', 'From product to outcome')}</span>
            <p>{L('مرّر لتشوف كيف تتصل كل خطوة باللي بعدها.', 'Scroll to see how every step connects to the next.')}</p>
          </div>
          <div className="platform-story-grid">
            <div className="platform-story-copy">
              <div className="platform-story-rail" aria-label={L('خطوات المنصة', 'Platform steps')}>
                {steps.map((step, index) => (
                  <m.button
                    type="button"
                    className={index === active ? 'is-active' : ''}
                    aria-current={index === active ? 'step' : undefined}
                    key={step.title}
                    onClick={() => goTo(index)}
                    whileTap={{ scale: 0.96 }}
                  >
                    <span dir="ltr">{String(index + 1).padStart(2, '0')}</span>
                    <b>{railLabels[index]}</b>
                    <i />
                  </m.button>
                ))}
              </div>
              <div className="platform-story-steps">
                {steps.map((step, index) => (
                  <m.article
                    className={['platform-story-step', index === active && 'is-active', index < active && 'is-passed'].filter(Boolean).join(' ')}
                    initial={false}
                    animate={{ opacity: index === active ? 1 : 0, y: index === active ? 0 : index < active ? -12 : 16 }}
                    transition={{ duration: 0.28, ease: [0.22, 0.8, 0.2, 1] }}
                    key={step.title}
                  >
                    <div className="platform-story-step-icon"><Icon name={step.icon} /></div>
                    <span className="platform-story-step-audience">{step.eyebrow}</span>
                    <h2>{step.title}</h2>
                    <p>{step.desc}</p>
                    <div className="platform-story-proof"><Check />{step.proof}</div>
                  </m.article>
                ))}
              </div>
            </div>
            <div className="platform-story-stage">
              <ActiveFx variant={current.fx} active={visible} />
              <AnimatePresence mode="wait" initial={false}>
                <m.div
                  className="platform-console-transition"
                  key={current.kind}
                  initial={{ opacity: 0, scale: 0.985 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.01 }}
                  transition={{ duration: 0.3, ease: [0.22, 0.8, 0.2, 1] }}
                >
                  <PlatformConsole scene={current} />
                </m.div>
              </AnimatePresence>
              <div className="platform-stage-chip"><span><Icon name={current.icon} /></span>{current.audience === 'company' ? L('واجهة الشركة', 'Company view') : L('واجهة المسوّق', 'Marketer view')}</div>
            </div>
          </div>
          <div className="platform-story-progress" aria-hidden="true"><span style={{ transform: 'scaleX(' + ((active + 1) / steps.length) + ')' }} /></div>
        </div>
      </div>
    </section>
  )
}

function createFeatures(L: Localize): Record<Audience, Feature[]> {
  return {
    marketer: [
      { icon: 'box', title: L('منتجات تنضم لها', 'Products to join'), desc: L('تتصفّح المتاح، تشوف عمولة كل منتج وشروطه، وتنضم للي تعرف تبيعه.', 'Browse what is available, see each commission and term, then join what you can sell.') },
      { icon: 'wallet', title: L('عمولات محسوبة', 'Clear commissions'), desc: L('المستحق والجاري وإجمالي ما كسبته، محدّث لحظياً بدون ما تسأل أحد.', 'Payable, pending and total earnings—updated live without asking anyone.') },
      { icon: 'users', title: L('CRM خاص فيك', 'Your own CRM'), desc: L('عملاؤك وصفقاتك منظّمة، وتعرف كل صفقة وين وصلت ومتى آخر تواصل.', 'Customers and deals stay organized, with every stage and last contact clear.') },
      { icon: 'cup', title: L('لوحة المتصدّرين', 'Leaderboard'), desc: L('ترتيبك بين المسوّقين قدامك، تعرف وين تقف ووش يحتاج منك جهد أكثر.', 'See your rank among marketers and where more effort will make a difference.') },
      { icon: 'chart', title: L('تقارير أدائك', 'Performance reports'), desc: L('عمولاتك شهرياً، نسبة إقفالك، وأي منتج يجيب لك أكثر.', 'Monthly commissions, close rate and the products that earn you the most.') },
      { icon: 'bell', title: L('تنبيهات تسبقك', 'Proactive alerts'), desc: L('صفقة اعتُمدت، عمولة نُزّلت، أو صفقة وقفت، يوصلك أول بأول.', 'Get notified when a deal is approved, paid, or needs attention.') },
    ],
    company: [
      { icon: 'box', title: L('انشر منتجك', 'Publish your product'), desc: L('تضيف منتجك بوصفه وشروطه وتحدّد عمولته، ويظهر للمسوّقين في ثوانٍ.', 'Add its details and terms, set a commission, and make it visible in seconds.') },
      { icon: 'users', title: L('فريق بيع جاهز', 'A ready sales team'), desc: L('مسوّقون ينضمون لمنتجك ويبدأون البيع، بدون توظيف ولا رواتب ثابتة.', 'Marketers join your product and start selling—without fixed hiring or salaries.') },
      { icon: 'wallet', title: L('تدفع على النتيجة', 'Pay for outcomes'), desc: L('العمولة تُستحق فقط عند إقفال الصفقة، والمنصة تتولّى الاحتساب.', 'Commission is due only when a deal closes, and the platform handles the math.') },
      { icon: 'chart', title: L('أداء منتجاتك', 'Product performance'), desc: L('تشوف أي منتج يتحرّك، وكم صفقة وصلتك، ومن أي مسوّق جات.', 'See which product is moving, how many deals arrive, and who brought them.') },
      { icon: 'brief', title: L('صفقات موثّقة', 'Documented deals'), desc: L('كل صفقة تصلك بتفاصيل عميلها ومرحلتها، وتعتمدها بضغطة.', 'Every deal arrives with customer details and status, ready to approve in one click.') },
      { icon: 'shield', title: L('شروط تحميك', 'Terms that protect you'), desc: L('أنت تكتب شروط العمولة.', 'You write the commission terms.') },
    ],
  }
}

function featureVisualFor(audience: Audience, index: number): FeatureVisualKind {
  const marketer: FeatureVisualKind[] = ['offers', 'balance', 'pipeline', 'leaderboard', 'report', 'alerts']
  const company: FeatureVisualKind[] = ['publish', 'team', 'outcome', 'report', 'approvals', 'terms']
  return (audience === 'marketer' ? marketer : company)[index] ?? 'offers'
}

function FeaturePreview({ kind }: { kind: FeatureVisualKind }) {
  const { L } = useLang()

  if (kind === 'offers') {
    return <div className="feature-preview feature-preview--offers" aria-hidden="true">
      <p><span>CRM</span><b>{L('منصة CRM', 'CRM platform')}</b><em dir="ltr">18%</em></p>
      <p><span>EC</span><b>{L('متجر إلكتروني', 'E-commerce')}</b><em dir="ltr">14%</em></p>
    </div>
  }

  if (kind === 'balance') {
    return <div className="feature-preview feature-preview--balance" aria-hidden="true">
      <div><span>{L('إجمالي عمولاتك', 'Total commissions')}</span><b dir="ltr">12,480 <small>ر.س</small></b></div>
      <p><span><i />{L('مستحق', 'Payable')}<b dir="ltr">8,930</b></span><span>{L('جاري', 'Pending')}<b dir="ltr">3,150</b></span></p>
    </div>
  }

  if (kind === 'pipeline') {
    return <div className="feature-preview feature-preview--pipeline" aria-hidden="true">
      <p><span>{L('جديد', 'New')}</span><i /><i /></p><p><span>{L('متابعة', 'Follow up')}</span><i /></p><p><span>{L('عرض', 'Proposal')}</span><i /><i /></p>
    </div>
  }

  if (kind === 'leaderboard') {
    return <div className="feature-preview feature-preview--leaderboard" aria-hidden="true">
      <p><b>01</b><span>{L('رنا العتيبي', 'Rana Alotaibi')}</span><i style={{ width: '78%' }} /></p>
      <p><b>02</b><span>{L('أنت', 'You')}</span><i style={{ width: '62%' }} /></p>
      <p><b>03</b><span>{L('سارة حسن', 'Sarah Hassan')}</span><i style={{ width: '48%' }} /></p>
    </div>
  }

  if (kind === 'report') {
    return <div className="feature-preview feature-preview--report" aria-hidden="true">
      <div><i style={{ height: '36%' }} /><i style={{ height: '58%' }} /><i style={{ height: '43%' }} /><i style={{ height: '76%' }} /><i style={{ height: '94%' }} /></div><p><span>Apr</span><span>May</span><span>Jun</span></p>
    </div>
  }

  if (kind === 'alerts') {
    return <div className="feature-preview feature-preview--alerts" aria-hidden="true">
      <p><i /><span>{L('تم اعتماد صفقة', 'Deal approved')}</span><b>الآن</b></p>
      <p><i /><span>{L('عمولة مستحقة', 'Commission payable')}</span><b>2س</b></p>
    </div>
  }

  if (kind === 'publish') {
    return <div className="feature-preview feature-preview--publish" aria-hidden="true">
      <p><span>{L('المنتج', 'Product')}</span><b>{L('نظام نقاط بيع', 'POS system')}</b></p>
      <p><span>{L('العمولة', 'Commission')}</span><b dir="ltr">12%</b></p>
      <em><i />{L('جاهز للنشر', 'Ready to publish')}</em>
    </div>
  }

  if (kind === 'team') {
    return <div className="feature-preview feature-preview--team" aria-hidden="true">
      <div><span>ر</span><span>ن</span><span>س</span><span>ع</span><i>+32</i></div><p><b dir="ltr">86</b><span>{L('مسوّق مهتم', 'interested marketers')}</span></p>
    </div>
  }

  if (kind === 'outcome') {
    return <div className="feature-preview feature-preview--outcome" aria-hidden="true">
      <p><span>{L('صفقات مقفلة', 'Closed deals')}</span><b dir="ltr">27</b></p><p><span>{L('يتم احتساب العمولة عند الإقفال', 'Commission is counted on close')}</span><i>✓</i></p>
    </div>
  }

  if (kind === 'approvals') {
    return <div className="feature-preview feature-preview--approvals" aria-hidden="true">
      <p><span>01</span><b>{L('متجر نُوى', 'Nuwa Store')}</b><em>{L('مراجعة', 'Review')}</em></p>
      <p><span>02</span><b>{L('مؤسسة أفق', 'Ofoq Co.')}</b><em>{L('جديد', 'New')}</em></p>
    </div>
  }

  return <div className="feature-preview feature-preview--terms" aria-hidden="true">
    <p><i />{L('تحديد الاستحقاق', 'Set eligibility')}</p><p><i />{L('اعتماد واضح للصفقة', 'Clear approval')}</p><p><i />{L('شروط يراها الجميع', 'Terms everyone sees')}</p>
  </div>
}

function featureSignalFor(kind: FeatureVisualKind, L: Localize) {
  const signals: Record<FeatureVisualKind, { label: string; value: string }> = {
    offers: { label: L('قرار الانضمام', 'Join decision'), value: L('العمولة والشروط أولاً', 'Terms and commission first') },
    balance: { label: L('حالة الاستحقاق', 'Payout state'), value: L('مستحق وجاري بوضوح', 'Payable and pending, clearly') },
    pipeline: { label: L('الخطوة التالية', 'Next action'), value: L('متابعة اليوم', 'Follow up today') },
    leaderboard: { label: L('مؤشر التقدّم', 'Progress signal'), value: L('اعرف موقعك والفرق', 'Know your rank and gap') },
    report: { label: L('اتجاه الأداء', 'Performance direction'), value: L('ركّز على ما يتحرّك', 'Focus on what moves') },
    alerts: { label: L('أولوية العمل', 'Work priority'), value: L('التحديث الأهم يصل أولاً', 'The important update arrives first') },
    publish: { label: L('جاهزية العرض', 'Offer readiness'), value: L('تفاصيل واضحة قبل النشر', 'Clear details before publishing') },
    team: { label: L('وصول الفريق', 'Team reach'), value: L('المسوّق المناسب يشوف منتجك', 'The right marketer sees your offer') },
    outcome: { label: L('منطق الاستحقاق', 'Payout logic'), value: L('تدفع عند إقفال الصفقة', 'Pay only when a deal closes') },
    approvals: { label: L('قرار موثّق', 'Documented decision'), value: L('كل صفقة جاهزة للمراجعة', 'Every deal is review-ready') },
    terms: { label: L('حماية الاتفاق', 'Agreement protection'), value: L('شروط يراها الجميع', 'Terms both sides can see') },
  }
  return signals[kind]
}

function FeatureSwitch() {
  const { L } = useLang()
  const [audience, setAudience] = useState<Audience>('marketer')
  const [activeIndex, setActiveIndex] = useState(0)
  const features = createFeatures(L)[audience]
  const activeFeature = features[activeIndex] ?? features[0]
  const visual = featureVisualFor(audience, activeIndex)
  const signal = featureSignalFor(visual, L)

  const selectAudience = (next: Audience) => {
    setAudience(next)
    setActiveIndex(0)
  }

  const handleAudienceKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return
    event.preventDefault()
    selectAudience(event.key === 'Home' ? 'marketer' : event.key === 'End' ? 'company' : audience === 'marketer' ? 'company' : 'marketer')
  }

  return (
    <section className="platform-features" id="platform-workspace">
      <div className="platform-workspace-head">
        <div className="platform-section-head">
          <span>{L('كل أداة تحتاجها موجودة بمنصتنا', 'Every tool you need, in one platform')}</span>
          <h2>{audience === 'marketer' ? L('تبيع بثقة، وتتابع حقك بوضوح', 'Sell confidently and track every earning') : L('خلّ فريقك يبيع أكثر بدون تعقيد', 'Help your sales network do more')}</h2>
          <p>{L('واجهة واحدة مرتبة، لكن تفاصيلها تتغير بحسب دورك في البيع.', 'One orderly workspace, tailored to your role in every sale.')}</p>
        </div>
        <div className="platform-audience" role="tablist" aria-label={L('اختر نوع الحساب', 'Choose account type')}>
          <m.button id="marketer-tab" className={audience === 'marketer' ? 'is-active' : ''} onClick={() => selectAudience('marketer')} onKeyDown={handleAudienceKeyDown} role="tab" aria-selected={audience === 'marketer'} aria-controls="platform-features-panel" whileTap={{ scale: 0.97 }}><Icon name="users" />{L('للمسوّق', 'For marketers')}</m.button>
          <m.button id="company-tab" className={audience === 'company' ? 'is-active' : ''} onClick={() => selectAudience('company')} onKeyDown={handleAudienceKeyDown} role="tab" aria-selected={audience === 'company'} aria-controls="platform-features-panel" whileTap={{ scale: 0.97 }}><Icon name="brief" />{L('للشركة', 'For companies')}</m.button>
        </div>
      </div>
      <div className="platform-workspace-shell">
        <nav className="platform-feature-nav" aria-label={L('أدوات المنصة', 'Platform tools')}>
          {features.map((feature, index) => {
            const featureVisual = featureVisualFor(audience, index)
            const featureSignal = featureSignalFor(featureVisual, L)
            const isActive = activeIndex === index
            return (
              <m.button
                type="button"
                layout
                className={isActive ? 'is-active' : ''}
                aria-current={isActive ? 'true' : undefined}
                aria-label={feature.title + ': ' + feature.desc}
                key={feature.title}
                onClick={() => setActiveIndex(index)}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.985 }}
              >
                <span className="platform-feature-nav-icon"><Icon name={feature.icon} /></span>
                <span><b>{feature.title}</b><small>{featureSignal.label}</small></span>
                <em dir="ltr">{String(index + 1).padStart(2, '0')}</em>
                {isActive ? <m.i className="platform-feature-nav-active" layoutId="platform-feature-nav-active" /> : null}
              </m.button>
            )
          })}
        </nav>
        <div className="platform-feature-stage" id="platform-features-panel" role="tabpanel" aria-labelledby={audience === 'marketer' ? 'marketer-tab' : 'company-tab'}>
          <AnimatePresence mode="wait" initial={false}>
            <m.article
              className={['platform-feature-focus', 'platform-feature-focus--' + visual].join(' ')}
              key={audience + '-' + activeFeature.title}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.28, ease: [0.22, 0.8, 0.2, 1] }}
            >
              <div className="platform-feature-focus-copy">
                <div className="platform-feature-focus-top"><span className="platform-icon-shell"><Icon name={activeFeature.icon} /></span><span>{audience === 'marketer' ? L('مساحة المسوّق', 'Marketer workspace') : L('مساحة الشركة', 'Company workspace')}</span><b dir="ltr">{String(activeIndex + 1).padStart(2, '0')}</b></div>
                <h3>{activeFeature.title}</h3>
                <p>{activeFeature.desc}</p>
                <div className="platform-feature-signal"><span>{signal.label}</span><b>{signal.value}</b></div>
              </div>
              <div className="platform-feature-focus-artifact"><FeaturePreview kind={visual} /></div>
              <m.svg className="platform-signal-path" viewBox="0 0 620 340" preserveAspectRatio="none" aria-hidden="true">
                <m.path d="M18 274C146 274 173 76 320 76c134 0 135 196 282 196" initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 0.72 }} transition={{ duration: 0.72, ease: 'easeOut' }} />
                <m.circle cx="18" cy="274" r="5" initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1, duration: 0.25 }} />
                <m.circle cx="602" cy="272" r="5" initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.54, duration: 0.25 }} />
              </m.svg>
            </m.article>
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}

function Faq() {
  const { L } = useLang()
  const items = [
    [L('كيف تشتغل المنصة؟', 'How does the platform work?'), L('الشركات تعرض منتجاتها وفرصها، والمسوقون يختارون الفرص المناسبة لهم. ومن خلال المنصة يقدر الطرفان يتابعون الصفقات والعمولات من مكان واحد.', 'Companies list offers and marketers choose opportunities that fit. Both sides follow deals and commissions in one place.')],
    [L('كيف تنحسب العمولة؟', 'How are commissions calculated?'), L('كل منتج أو فرصة يكون لها عمولة محددة وواضحة من البداية، بحيث يعرف المسوّق عمولته وتعرف الشركة تكلفة كل صفقة قبل بدء التسويق.', 'Every product or opportunity has a clear commission from the start, so marketers know their earnings and companies know the cost of each deal.')],
    [L('كيف يتم اعتماد الصفقة؟', 'How is a deal approved?'), L('بعد تسجيل الصفقة، تتم مراجعتها واعتمادها حسب تفاصيل العملية. وبعد الاعتماد تظهر حالة الصفقة والعمولة بشكل واضح للطرفين.', 'After recording a deal, it is reviewed and approved according to its details. Both sides then see deal and commission status clearly.')],
    [L('متى تُصرف العمولة؟', 'When is a commission paid?'), L('بعد اعتماد الصفقة تنتقل العمولة إلى حالة الاستحقاق، ويتم صرفها بحسب دورة الدفع المحددة في المنصة.', 'Once a deal is approved, its commission becomes payable and is issued according to the platform payment cycle.')],
    [L('هل أقدر أتعامل مع أكثر من منتج أو مسوّق؟', 'Can I work with more than one product or marketer?'), L('نعم. المسوّق يقدر يشارك في أكثر من فرصة، والشركة تقدر تعرض أكثر من منتج وتتعامل مع عدة مسوقين من خلال حساب واحد.', 'Yes. Marketers can join more than one opportunity, while companies can list multiple products and work with several marketers from one account.')],
    [L('كيف أتابع الصفقات والعمولات؟', 'How do I follow deals and commissions?'), L('كل طرف عنده لوحة تحكم توضح له الصفقات وحالتها والعمولات المرتبطة فيها، عشان تكون رحلة البيع واضحة من البداية للنهاية.', 'Each side has a dashboard showing deals, their status and related commissions, making the sales journey clear end to end.')],
    [L('وش أحتاج عشان أبدأ؟', 'What do I need to start?'), L('اختر نوع حسابك، أكمل بياناتك، وبعدها تقدر تبدأ بعرض منتجاتك كشركة أو اكتشاف فرص التسويق كمسوّق.', 'Choose your account type, complete your details, then list products as a company or discover opportunities as a marketer.')],
  ]
  const [open, setOpen] = useState(0)

  return (
    <section className="platform-faq">
      <div className="platform-faq-copy">
        <span>{L('أسئلة قبل ما تبدأ', 'Before you start')}</span>
        <h2>{L('كل شيء واضح من أول خطوة', 'Clear from the first step')}</h2>
        <p>{L('بنينا المنصة عشان يكون البيع والتعاون أبسط للطرفين.', 'We built the platform to make selling and collaboration simpler for both sides.')}</p>
      </div>
      <div className="platform-faq-list">
        {items.map(([question, answer], index) => (
          <article className={open === index ? 'is-open' : ''} key={question}>
            <button onClick={() => setOpen(open === index ? -1 : index)} aria-expanded={open === index}>
              <span>{question}</span><b>+</b>
            </button>
            <div><p>{answer}</p></div>
          </article>
        ))}
      </div>
    </section>
  )
}

function FinalCta() {
  const { L } = useLang()

  return (
    <section className="platform-final">
      <FinalCtaFx />
      <div className="platform-final-copy">
        <span>{L('جاهز تبدأ؟', 'Ready to begin?')}</span>
        <h2>{L('سجّل بخطوة وحدة، واختر أول منتج', 'Sign up, then choose your first product')}</h2>
        <p>{L('وابدأ تكسب من أول صفقة تقفلها.', 'Start earning from your first closed deal.')}</p>
        <a href="/#contact" className="platform-primary">{L('ابدأ مجاناً', 'Start for free')}<Arrow /></a>
      </div>
    </section>
  )
}

export default function PlatformPage() {
  return (
    <PageShell active="platform">
      <LazyMotion features={domAnimation} strict>
        <MotionConfig reducedMotion="user">
          <PlatformHero />
          <RoleCards />
          <PlatformStory />
          <FeatureSwitch />
          <Faq />
          <FinalCta />
        </MotionConfig>
      </LazyMotion>
    </PageShell>
  )
}
