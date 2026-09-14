import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { ActiveFx, HeroFx } from '../components/CardFx'
import { PageShell } from '../shared/PageShell'
import { useLang } from '../shared/i18n'
import { usePageTheme } from '../shared/theme'

type IconName = 'box' | 'wallet' | 'users' | 'cup' | 'chart' | 'bell' | 'brief' | 'shield' | 'spark'
type Audience = 'marketer' | 'company'
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
      <div className="platform-hero-halo platform-hero-halo--one" aria-hidden="true" />
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
      title: L('للشركة صاحبة المنتج أو الخدمة', 'For product businesses'),
      lead: L('فريق بيع جاهز، بدون توظيف ولا رواتب ثابتة.', 'A sales network, without fixed hiring overhead.'),
      points: [
        L('تعرض منتجك وتحدّد العمولة والشروط بنفسك', 'Set your product, commission and terms'),
        L('مسوّقون ينضمون له ويبدأون البيع', 'Marketers join and start selling'),
        L('تشوف كل صفقة وصلتك', 'See every deal that reaches you'),
      ],
    },
    {
      icon: 'users' as const,
      index: '02',
      title: L('للمسوّق', 'For marketers'),
      lead: L('ابدأ من مكانك بدون رأس مال.', 'Start from anywhere, without capital.'),
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
      <div className="platform-role-grid">
        {roles.map((role) => (
          <article className="platform-role-card" key={role.title}>
            <div className="platform-role-top">
              <span className="platform-role-index" dir="ltr">{role.index}</span>
              <span className="platform-icon-shell"><Icon name={role.icon} /></span>
            </div>
            <h3>{role.title}</h3>
            <p>{role.lead}</p>
            <ul>{role.points.map((point) => <li key={point}><Check />{point}</li>)}</ul>
            <span className="platform-role-line" aria-hidden="true" />
          </article>
        ))}
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
    const target = window.scrollY + el.getBoundingClientRect().top + (total * index / count)
    window.scrollTo({ top: target, behavior: 'smooth' })
  }

  return { trackRef, active, visible, goTo }
}

function PlatformConsole({ scene }: { scene: StoryStep }) {
  return (
    <div className="platform-console" aria-label="معاينة لوحة المنصة">
      <div className="platform-console-top">
        <div className="platform-console-brand"><span /><b>SALESUP</b><small>PLATFORM</small></div>
        <div className="platform-console-window"><i /><i /><i /></div>
      </div>
      <div className="platform-console-layout">
        <aside className="platform-console-nav" aria-hidden="true">
          <span className="is-active"><Icon name={scene.icon} /></span>
          <span><Icon name="brief" /></span>
          <span><Icon name="wallet" /></span>
          <span><Icon name="chart" /></span>
        </aside>
        <div className="platform-console-main">
          <div className="platform-console-heading">
            <div><span>{scene.consoleStatus}</span><h3>{scene.consoleTitle}</h3></div>
            <span className="platform-console-action"><span>+</span>{scene.audience === 'company' ? 'إجراء جديد' : 'إضافة صفقة'}</span>
          </div>
          <div className="platform-console-metrics">
            <article>
              <span>{scene.metricLabel}</span>
              <b dir="ltr">{scene.metricValue}</b>
              <small>{scene.metricHint}</small>
            </article>
            <article>
              <span>{scene.secondaryLabel}</span>
              <b dir="ltr">{scene.secondaryValue}</b>
              <small><i /> مباشر</small>
            </article>
          </div>
          <div className="platform-console-insights">
            <article className="platform-console-chart">
              <div className="platform-console-chart-head"><span>{scene.audience === 'company' ? 'نظرة الأداء' : 'اتجاهك هذا الشهر'}</span><b dir="ltr">+24.8%</b></div>
              <div className="platform-console-bars">{scene.bars.map((height, index) => <i key={index} style={{ height: height + '%' }} className={index === scene.bars.length - 1 ? 'is-last' : ''} />)}</div>
              <div className="platform-console-axis"><span>أبريل</span><span>مايو</span><span>يونيو</span></div>
            </article>
            <article className="platform-console-list">
              <div><span>{scene.audience === 'company' ? 'آخر المنتجات' : 'آخر النشاطات'}</span><b>عرض الكل</b></div>
              {scene.rows.map(([name, detail]) => <p key={name}><span><i />{name}</span><b>{detail}</b></p>)}
            </article>
          </div>
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
                  <button
                    type="button"
                    className={index === active ? 'is-active' : ''}
                    aria-current={index === active ? 'step' : undefined}
                    key={step.title}
                    onClick={() => goTo(index)}
                  >
                    <span dir="ltr">{String(index + 1).padStart(2, '0')}</span>
                    <i />
                  </button>
                ))}
              </div>
              <div className="platform-story-steps">
                {steps.map((step, index) => (
                  <article className={['platform-story-step', index === active && 'is-active', index < active && 'is-passed'].filter(Boolean).join(' ')} key={step.title}>
                    <div className="platform-story-step-icon"><Icon name={step.icon} /></div>
                    <span className="platform-story-step-audience">{step.eyebrow}</span>
                    <h2>{step.title}</h2>
                    <p>{step.desc}</p>
                    <div className="platform-story-proof"><Check />{step.proof}</div>
                  </article>
                ))}
              </div>
            </div>
            <div className="platform-story-stage">
              <ActiveFx variant={current.fx} active={visible} />
              <PlatformConsole scene={current} />
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

function FeatureSwitch() {
  const { L } = useLang()
  const [audience, setAudience] = useState<Audience>('marketer')
  const features = createFeatures(L)[audience]
  const spotlight = features[0]

  return (
    <section className="platform-features" id="platform-workspace">
      <div className="platform-section-head">
        <span>{L('كل أداة تحتاجها موجودة بمنصتنا', 'Every tool you need, in one platform')}</span>
        <h2>{audience === 'marketer' ? L('تبيع بثقة، وتتابع حقك بوضوح', 'Sell confidently and track every earning') : L('خلّ فريقك يبيع أكثر بدون تعقيد', 'Help your sales network do more')}</h2>
      </div>
      <div className="platform-audience" role="tablist" aria-label={L('اختر نوع الحساب', 'Choose account type')}>
        <button id="marketer-tab" className={audience === 'marketer' ? 'is-active' : ''} onClick={() => setAudience('marketer')} role="tab" aria-selected={audience === 'marketer'} aria-controls="platform-features-panel">{L('للمسوّق', 'For marketers')}</button>
        <button id="company-tab" className={audience === 'company' ? 'is-active' : ''} onClick={() => setAudience('company')} role="tab" aria-selected={audience === 'company'} aria-controls="platform-features-panel">{L('للشركة', 'For companies')}</button>
      </div>
      <div className="platform-feature-layout" id="platform-features-panel" role="tabpanel" aria-labelledby={audience === 'marketer' ? 'marketer-tab' : 'company-tab'}>
        <article className="platform-feature-spotlight">
          <div className="platform-feature-spotlight-icon"><Icon name={spotlight.icon} /></div>
          <span>{audience === 'marketer' ? L('لوحة المسوّق', 'Marketer workspace') : L('لوحة الشركة', 'Company workspace')}</span>
          <h3>{spotlight.title}</h3>
          <p>{spotlight.desc}</p>
          <div className="platform-feature-preview" aria-hidden="true">
            <div><i /><span>{audience === 'marketer' ? L('فرص متاحة', 'Live opportunities') : L('منتجات نشطة', 'Active products')}</span><b dir="ltr">{audience === 'marketer' ? '12' : '08'}</b></div>
            <div><i /><span>{audience === 'marketer' ? L('عمولة هذا الشهر', 'This month') : L('صفقات مقفلة', 'Closed deals')}</span><b dir="ltr">{audience === 'marketer' ? '12,480' : '27'}</b></div>
          </div>
        </article>
        <div className="platform-feature-grid">
          {features.slice(1).map((feature) => (
            <article className="platform-feature-card" key={feature.title}>
              <div className="platform-icon-shell"><Icon name={feature.icon} /></div>
              <h3>{feature.title}</h3>
              <p>{feature.desc}</p>
            </article>
          ))}
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
      <div>
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
      <PlatformHero />
      <RoleCards />
      <PlatformStory />
      <FeatureSwitch />
      <Faq />
      <FinalCta />
    </PageShell>
  )
}
