import { useState } from 'react'
import type { ReactNode } from 'react'
import { HeroFx } from '../components/CardFx'
import { PageShell } from '../shared/PageShell'
import { useLang } from '../shared/i18n'
import { usePageTheme } from '../shared/theme'

type IconName = 'box' | 'wallet' | 'users' | 'cup' | 'chart' | 'bell' | 'brief' | 'shield'

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
    ['س', 'استضافة سحابية · سُهيل', '96'],
  ]
  return (
    <div className="commission-board" aria-label="لوحة العمولات">
      <div className="board-top"><span>لوحة العمولات</span><i /><i /><i /></div>
      <div className="board-total"><span>إجمالي عمولاتك</span><b dir="ltr">14,456 <small>ر.س</small></b></div>
      <div className="board-live"><span><i /> مباشر</span><em>محدّث الآن</em></div>
      <div className="board-list">
        {rows.map(([initial, label, amount]) => <div className="board-row" key={label}>
          <span className="board-avatar">{initial}</span><span>{label}<small>اعتُمدت</small></span><b dir="ltr">{amount}</b>
        </div>)}
      </div>
      <div className="board-badge">+1,400 مسوّق نشط <Icon name="users" /></div>
    </div>
  )
}

function PlatformHero() {
  const { dark } = usePageTheme()
  const { L } = useLang()
  return <section className="platform-native-hero">
    <div className="platform-native-fx" aria-hidden="true"><HeroFx dark={dark} /></div>
    <div className="platform-native-wrap">
      <div className="platform-hero-copy">
        <span className="platform-kicker">{L('منصة سيلز أب', 'SalesUp Platform')}</span>
        <h1>{L('الشركات والمسوّقين', 'Companies and marketers')} <em>{L('في مكان واحد', 'in one place')}</em></h1>
        <p>{L('اعرض منتجاتك، اكتشف فرص التسويق بعمولة، وأدر الصفقات والعمولات بسهولة عبر منصة تجمع الطرفين.', 'List your products, discover commission opportunities and manage deals in one shared platform.')}</p>
        <a className="platform-primary" href="#platform-roles">{L('ابدأ مجاناً', 'Start for free')}<Arrow /></a>
        <div className="platform-proof"><span><Check />{L('بدون رسوم للبدء', 'No fee to get started')}</span><span><Check />{L('كل شيء في مكان واحد', 'Everything in one place')}</span></div>
      </div>
      <div className="platform-visual"><div className="platform-orbit platform-orbit-a" /><div className="platform-orbit platform-orbit-b" /><CommissionBoard /></div>
    </div>
  </section>
}

function RoleCards() {
  const { L } = useLang()
  const roles = [
    { icon: 'brief' as const, title: L('للشركة صاحبة المنتج أو الخدمة', 'For product businesses'), lead: L('فريق بيع جاهز.', 'A sales force, ready.'), points: [L('تعرض منتجك وتحدّد العمولة والشروط بنفسك', 'Set your product, commission and terms'), L('مسوّقون ينضمون له ويبدأون البيع', 'Marketers join and start selling'), L('تشوف كل صفقة وصلتك', 'See every deal that reaches you')] },
    { icon: 'users' as const, title: L('للمسوّق', 'For marketers'), lead: L('ابدأ من مكانك بدون رأس مال.', 'Start from anywhere, without capital.'), points: [L('تتصفّح المنتجات وتشوف عمولة كل واحد قبل ما تنضم', 'Browse products and compare commissions'), L('تسجّل عملاءك وصفقاتك في CRM خاص فيك', 'Track customers and deals in your own CRM'), L('تتابع المستحق والجاري وإجمالي ما كسبته', 'Follow earned, pending and total commissions')] },
  ]
  return <section className="platform-roles" id="platform-roles"><div className="platform-section-head"><span>{L('طرفين على نفس المنصة', 'Two sides, one platform')}</span><h2>{L('مسار واضح من العرض إلى العمولة', 'A clear path from offer to commission')}</h2></div><div className="platform-role-grid">
    {roles.map((role) => <article className="platform-role-card" key={role.title}><div className="platform-icon-shell"><Icon name={role.icon} /></div><h3>{role.title}</h3><p>{role.lead}</p><ul>{role.points.map((point) => <li key={point}><Check />{point}</li>)}</ul></article>)}
  </div></section>
}

const marketerFeatures = [
  ['box', 'منتجات تنضم لها', 'تتصفّح المتاح، تشوف عمولة كل منتج وشروطه، وتنضم للي تعرف تبيعه.'],
  ['wallet', 'عمولات محسوبة', 'المستحق والجاري وإجمالي ما كسبته، محدّث لحظياً بدون ما تسأل أحد.'],
  ['users', 'CRM خاص فيك', 'عملاؤك وصفقاتك منظّمة، وتعرف كل صفقة وين وصلت ومتى آخر تواصل.'],
  ['cup', 'لوحة المتصدّرين', 'ترتيبك بين المسوّقين قدامك، تعرف وين تقف ووش يحتاج منك جهد أكثر.'],
  ['chart', 'تقارير أدائك', 'عمولاتك شهرياً، نسبة إقفالك، وأي منتج يجيب لك أكثر.'],
  ['bell', 'تنبيهات تسبقك', 'صفقة اعتُمدت، عمولة نُزّلت، أو صفقة وقفت، يوصلك أول بأول.'],
] as const
const companyFeatures = [
  ['box', 'انشر منتجك', 'تضيف منتجك بوصفه وشروطه وتحدّد عمولته، ويظهر للمسوّقين في ثوانٍ.'],
  ['users', 'فريق بيع جاهز', 'مسوّقون ينضمون لمنتجك ويبدأون البيع، بدون توظيف ولا رواتب ثابتة.'],
  ['wallet', 'تدفع على النتيجة', 'العمولة تُستحق فقط عند إقفال الصفقة، والمنصة تتولّى الاحتساب.'],
  ['chart', 'أداء منتجاتك', 'تشوف أي منتج يتحرّك، وكم صفقة وصلتك، ومن أي مسوّق جات.'],
  ['brief', 'صفقات موثّقة', 'كل صفقة تصلك بتفاصيل عميلها ومرحلتها، وتعتمدها بضغطة.'],
  ['shield', 'شروط تحميك', 'أنت تكتب شروط العمولة.'],
] as const

function FeatureSwitch() {
  const { L } = useLang()
  const [audience, setAudience] = useState<'marketer' | 'company'>('marketer')
  const features = audience === 'marketer' ? marketerFeatures : companyFeatures
  return <section className="platform-features"><div className="platform-section-head"><span>{L('كل أداة تحتاجها موجودة بمنصتنا', 'Everything you need, in one platform')}</span><h2>{audience === 'marketer' ? L('تبيع بثقة، وتتابع حقك بوضوح', 'Sell confidently and track every earning') : L('خلّ فريقك يبيع أكثر بدون تعقيد', 'Help your sales network do more')}</h2></div><div className="platform-audience" role="tablist" aria-label={L('اختر نوع الحساب', 'Choose account type')}><button className={audience === 'marketer' ? 'is-active' : ''} onClick={() => setAudience('marketer')} role="tab" aria-selected={audience === 'marketer'}>{L('للمسوّق', 'For marketers')}</button><button className={audience === 'company' ? 'is-active' : ''} onClick={() => setAudience('company')} role="tab" aria-selected={audience === 'company'}>{L('للشركة', 'For companies')}</button></div><div className="platform-feature-grid">
    {features.map(([icon, title, desc]) => <article className="platform-feature-card" key={title}><div className="platform-icon-shell"><Icon name={icon} /></div><h3>{title}</h3><p>{desc}</p></article>)}
  </div></section>
}

function Faq() {
  const { L } = useLang()
  const items = [
    [L('كيف تشتغل المنصة؟', 'How does the platform work?'), L('الشركات تعرض منتجاتها وفرصها، والمسوقون يختارون الفرص المناسبة لهم. ومن خلال المنصة يقدر الطرفان يتابعون الصفقات والعمولات من مكان واحد.', 'Companies list their offers and marketers choose the opportunities that fit them. Both sides can follow deals and commissions in one place.')],
    [L('كيف تنحسب العمولة؟', 'How are commissions calculated?'), L('كل منتج أو فرصة يكون لها عمولة محددة وواضحة من البداية، بحيث يعرف المسوّق عمولته وتعرف الشركة تكلفة كل صفقة قبل بدء التسويق.', 'Every product or opportunity has a clear commission from the start, so marketers know their earnings and companies know each deal cost before promotion begins.')],
    [L('كيف يتم اعتماد الصفقة؟', 'How is a deal approved?'), L('بعد تسجيل الصفقة، تتم مراجعتها واعتمادها حسب تفاصيل العملية. وبعد الاعتماد تظهر حالة الصفقة والعمولة بشكل واضح للطرفين.', 'After a deal is recorded, it is reviewed and approved according to its details. Both sides then see its deal and commission status clearly.')],
    [L('متى تُصرف العمولة؟', 'When is a commission paid?'), L('بعد اعتماد الصفقة تنتقل العمولة إلى حالة الاستحقاق، ويتم صرفها بحسب دورة الدفع المحددة في المنصة.', 'Once a deal is approved, its commission becomes payable and is issued according to the platform payment cycle.')],
    [L('هل أقدر أتعامل مع أكثر من منتج أو مسوّق؟', 'Can I work with more than one product or marketer?'), L('نعم. المسوّق يقدر يشارك في أكثر من فرصة، والشركة تقدر تعرض أكثر من منتج وتتعامل مع عدة مسوقين من خلال حساب واحد.', 'Yes. Marketers can join more than one opportunity, while companies can list multiple products and work with several marketers from one account.')],
    [L('كيف أتابع الصفقات والعمولات؟', 'How do I follow deals and commissions?'), L('كل طرف عنده لوحة تحكم توضح له الصفقات وحالتها والعمولات المرتبطة فيها، عشان تكون رحلة البيع واضحة من البداية للنهاية.', 'Each side has a dashboard that shows deals, their status and related commissions, keeping the sales journey clear from start to finish.')],
    [L('وش أحتاج عشان أبدأ؟', 'What do I need to start?'), L('اختر نوع حسابك، أكمل بياناتك، وبعدها تقدر تبدأ بعرض منتجاتك كشركة أو اكتشاف فرص التسويق كمسوّق.', 'Choose your account type, complete your details, then start listing products as a company or discovering marketing opportunities as a marketer.')],
  ]
  const [open, setOpen] = useState(0)
  return <section className="platform-faq"><div className="platform-faq-copy"><span>{L('أسئلة قبل ما تبدأ', 'Before you start')}</span><h2>{L('كل شيء واضح من أول خطوة', 'Clear from the first step')}</h2><p>{L('بنينا المنصة عشان يكون البيع والتعاون أبسط للطرفين.', 'We built the platform to make selling and collaboration simpler for both sides.')}</p></div><div className="platform-faq-list">{items.map(([question, answer], index) => <article className={open === index ? 'is-open' : ''} key={question}><button onClick={() => setOpen(open === index ? -1 : index)} aria-expanded={open === index}><span>{question}</span><b>+</b></button><div><p>{answer}</p></div></article>)}</div></section>
}

function FinalCta() {
  const { L } = useLang()
  return <section className="platform-final"><div><span>{L('جاهز تبدأ؟', 'Ready to begin?')}</span><h2>{L('سجّل بخطوة وحدة، واختر أول منتج', 'Sign up, then choose your first product')}</h2><p>{L('وابدأ تكسب من أول صفقة تقفلها.', 'Start earning from your first closed deal.')}</p><a href="/#contact" className="platform-primary">{L('ابدأ مجاناً', 'Start for free')}<Arrow /></a></div></section>
}

export default function PlatformPage() {
  return <PageShell active="platform"><PlatformHero /><RoleCards /><FeatureSwitch /><Faq /><FinalCta /></PageShell>
}
