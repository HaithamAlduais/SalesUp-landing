import { PageShell } from '../shared/PageShell'
import { StandaloneShell } from '../shared/StandaloneShell'
import { useLang } from '../shared/i18n'
import {
  APP_COMPANY, APP_MARKETER, CommissionsScene, CompanyPerformanceScene, CrmScene, Cross, Duo, Faq,
  Features, Final, Hero, InboundScene, LeaderboardScene, PerformanceScene, PlatformBody, ProductsScene,
  Story, companyFeatures, faqItems, marketerFeatures, storySteps,
} from './platformKit'
import type { FaqItem, Feature, Side } from './platformKit'

/*
 * The platform's audience pages, ported from the client's references
 * (Sep 2026): business.html → /platform/business, affiliate.html →
 * /platform/affiliate (both in the الحلول الرقمية dropdown), and
 * students.html → /platform/students, a standalone page with its own
 * slim header and footer that the site never links to.
 */

export type Audience = 'business' | 'affiliate' | 'students'

function Business() {
  const { L } = useLang()
  const steps = storySteps(L)
  const faq = faqItems(L)
  const cta = { href: APP_COMPANY, label: L('ابدأ الآن مجاناً', 'Start now for free') }

  return (
    <PlatformBody>
      <Hero
        title={[L('فريق مبيعات', 'A sales team'), L('بدون توظيف', 'without hiring')]}
        lead={[
          L('تنشر منتجك وتحدّد عمولته، ويبدأ المسوّقين البيع من أول يوم ', 'Publish your product and set its commission, and marketers start selling from day one, '),
          L('والعمولة تُستحق عند الإقفال.', 'with commission due only when a deal closes.'),
        ]}
        cta={cta}
        scenes={[<ProductsScene />, <InboundScene />, <CompanyPerformanceScene />]}
      />
      <Duo
        title={L('ليش تعرض منتجك معنا', 'Why list your product with us')}
        sides={[
          {
            icon: 'users',
            title: L('فريق بيع بدون توظيف', 'A sales team without hiring'),
            points: [
              L('مسوّقون ينضمون لمنتجك ويبدأون البيع', 'Marketers join your product and start selling'),
              L('أنت تكتب الشروط والعمولة', 'You write the terms and the commission'),
              L('توقف أو تعدّل متى ما حبيت', 'Pause or change it whenever you like'),
            ],
          },
          {
            icon: 'target',
            title: L('تدفع على النتيجة', 'Pay for outcomes'),
            points: [
              L('تشوف كل صفقة وصلتك ومرحلتها', 'See every deal that reaches you and its stage'),
              L('تعتمد الصفقة بضغطة', 'Approve a deal in one click'),
              L('تقارير أداء كل منتج', 'Performance reports for every product'),
            ],
          },
        ]}
      />
      <Story steps={[steps.publish, steps.approval, { ...steps.performance, scene: <CompanyPerformanceScene /> }]} />
      <Features sets={[{ key: 'company', label: L('للشركة', 'For companies'), items: companyFeatures(L, ['انشر منتجك', 'Publish your product'], ['فريق بيع بالعمولة', 'A commission-based sales team']) }]} />
      <Faq items={[faq.how, faq.commission, faq.approval, faq.many, faq.follow]} />
      <Final text={L('انشر منتجك اليوم وخلّ المسوّقين يبيعونه لك', 'Publish your product today and let marketers sell it for you')} cta={cta} />
      <Cross
        href="/platform/affiliate"
        title={L('أنت مسوّق وودّك بمصدر دخل؟', 'Are you a marketer looking for an income?')}
        desc={L('اختر منتج، تدرّب، بِع، وخذ عمولتك.', 'Pick a product, get trained, sell, and earn your commission.')}
        button={L('صفحة المسوّقين', 'Marketers page')}
      />
    </PlatformBody>
  )
}

/* the marketer pages share the hero board, the story and the tools */
function MarketerBody({ title, lead, duo, features, faq, final, cross }: {
  title: [string, string]
  lead: [string, string]
  duo: { title: string; sides: Side[] }
  /* a page's own wording for the tools section (defaults to the shared cards) */
  features?: { title: string; items: Feature[] }
  faq: FaqItem[]
  final: string
  cross?: boolean
}) {
  const { L } = useLang()
  const steps = storySteps(L)
  const cta = { href: APP_MARKETER, label: L('ابدأ الآن مجاناً', 'Start now for free') }

  return (
    <PlatformBody>
      <Hero title={title} lead={lead} cta={cta} scenes={[<CommissionsScene live />, <CrmScene />, <LeaderboardScene />, <PerformanceScene />]} />
      <Duo {...duo} />
      <Story steps={[steps.opportunities, steps.crm, steps.commissions]} />
      <Features title={features?.title} sets={[{ key: 'marketer', label: L('للمسوّق', 'For marketers'), items: features?.items ?? marketerFeatures(L) }]} />
      <Faq items={faq} />
      <Final text={final} cta={cta} />
      {cross ? (
        <Cross
          href="/platform/business"
          title={L('عندك منتج أو خدمة تبي من يبيعها؟', 'Have a product or service you want sold?')}
          desc={L('اعرضه على المنصة وحدّد عمولته وتلقى مسوّقين يبيعونه لك', 'List it on the platform, set its commission, and get marketers who sell it for you')}
          button={L('صفحة الشركات', 'Companies page')}
        />
      ) : null}
    </PlatformBody>
  )
}

function Affiliate() {
  const { L } = useLang()
  const faq = faqItems(L)
  return (
    <MarketerBody
      title={[L('بِع منتجات', 'Sell products'), L('وخذ عمولتك', 'and earn your commission')]}
      lead={[
        L('اختر من المنتجات المعروضة والموضحة عمولتها، سجّل وتابع صفقاتك، ', 'Choose from listed products with their commission shown, record and track your deals, '),
        L('وعمولتك تُحسب وتُصرف لك تلقائيًا.', 'and your commission is calculated and paid to you automatically.'),
      ]}
      duo={{
        title: L('ليش تبدأ معنا', 'Why start with us'),
        sides: [
          {
            icon: 'pin',
            title: L('تبدأ من مكانك', 'Start from where you are'),
            points: [
              L('ما تحتاج سجل تجاري ولا ترخيص', 'No commercial registration or license needed'),
              L('تختار المنتجات اللي تعرف تبيعها', 'Choose the products you know how to sell'),
              L('تشتغل بوقتك وعلى جوالك', 'Work on your own time, from your phone'),
            ],
          },
          clearSide(L),
        ],
      }}
      faq={[
        /* marketer-page wording per the client's review (Sep 28) */
        [faq.how[0], L('الشركات تعرض منتجاتها وفرصها والمسوّقين يختارون الي يناسبهم منها، ومن خلال المنصة يتابع الطرفين صفقاتهم وعمولاتهم من مكان واحد.', 'Companies list their products and opportunities, marketers choose the ones that suit them, and both sides follow their deals and commissions on the platform from one place.')],
        [L('كيف تُحسب العمولة؟', 'How is the commission calculated?'), faq.commission[1]],
        [L('ماهو CRM؟', 'What is a CRM?'), L('CRM يعني إدارة علاقات العملاء: صفحة خاصة فيك داخل المنصة تتابع فيها عملاءك وصفقاتك بكل تفاصيلها، وتعرف كل صفقة وين وصلت ومتى آخر تواصل.', 'CRM stands for customer relationship management: your own page on the platform where you follow your customers and deals in full detail, and see where each deal stands and when you last spoke.')],
        faq.payout, faq.many, faq.follow, faq.start,
      ]}
      final={L('سجّل بخطوة واحدة، اختر أول منتج واكسب مع أول صفقة تقفلها', 'Sign up in one step, choose your first product, and earn from the first deal you close')}
      cross
    />
  )
}

function clearSide(L: (ar: string, en: string) => string): Side {
  return {
    icon: 'eye',
    title: L('كل شي واضح قدامك', 'Everything is clear in front of you'),
    points: [
      L('عمولة كل منتج ظاهرة قبل الانضمام', 'Every product’s commission is shown before you join'),
      L('تتابع المستحق والجاري لحظياً', 'Track payable and pending earnings live'),
      L('تنزل بموعدها بدون ما تطالب أحد', 'Paid on schedule, without chasing anyone'),
    ],
  }
}

/* students page wording per the client's review (Sep 28): students want
   work experience before they graduate, so the page leads with it */
function Students() {
  const { L } = useLang()
  return (
    <MarketerBody
      title={[L('طالب وودّك تجمع بين', 'A student looking to combine'), L('خبرة عملية ومصدر دخل', 'work experience and an income')]}
      lead={[
        L('اختر المنتج الي يناسبك وتعرّف عليه، وبعدها تقدر تبيعه ', 'Pick the product that suits you and get to know it, then sell it '),
        L('من جهازك ومن أي مكان.', 'from your device, from anywhere.'),
      ]}
      duo={{
        title: L('ليش يناسبك كطالب', 'Why it suits you as a student'),
        sides: [
          {
            icon: 'pin',
            title: L('يمشي مع دوامك', 'Fits your schedule'),
            points: [
              L('ما يحتاج دوام ولا التزام بساعات', 'No office hours and no fixed commitment'),
              L('تشتغل بين محاضراتك ومن جهازك', 'Work between lectures, from your device'),
              L('ما تحتاج سجل تجاري ولا رأس مال', 'No commercial registration or capital needed'),
            ],
          },
          {
            icon: 'eye',
            title: L('كل شي واضح قدامك', 'Everything is clear in front of you'),
            points: [
              L('عمولة كل منتج ظاهرة قبل الانضمام', 'Every product’s commission is shown before you join'),
              L('تتابع عمولاتك المستحقة والجارية لحظة بلحظة', 'Track your payable and pending commissions moment by moment'),
              L('عمولاتك تنزل بموعدها تلقائيًا', 'Your commissions are paid on schedule, automatically'),
            ],
          },
        ],
      }}
      features={{
        title: L('كل الأدوات الي تحتاجها موجودة في منصتنا', 'All the tools you need are on our platform'),
        items: [
          { icon: 'box', title: L('منتجات متنوعة تنضم لها', 'A range of products to join'), desc: L('تتصفّح المنتجات المتاحة، تشوف عمولة وشروط كل منتج وتنضم للمنتج الي يناسبك.', 'Browse the available products, see each one’s commission and terms, and join the product that suits you.') },
          { icon: 'wallet', title: L('عمولات محسوبة', 'Commissions, counted'), desc: L('عمولاتك المستحقة والجارية وإجمالي عمولاتك من وقت انضمامك تتحدث تلقائيًا.', 'Your payable and pending commissions, and your total since you joined, update automatically.') },
          { icon: 'users', title: L('CRM خاص فيك', 'Your own CRM'), desc: L('صفحة خاصة تتابع فيها عملاءك وصفقاتك بكل تفاصيلها.', 'Your own page to follow your customers and deals in full detail.') },
          { icon: 'cup', title: L('لوحة المتصدّرين', 'Leaderboard'), desc: L('تقدر تشوف ترتيبك بين المسوّقين وتعرف مستوى أداءك.', 'See your rank among marketers and where your performance stands.') },
          { icon: 'chart', title: L('تقارير أدائك', 'Performance reports'), desc: L('توضح لك نسبة إقفالك للصفقات وأي منتج يجيب لك عمولة أكثر.', 'Shows your deal close rate and which product earns you the most commission.') },
          { icon: 'bell', title: L('تنبيهات تسبقك', 'Alerts ahead of you'), desc: L('صفقة اعتُمدت، صفقة وقفت، أو عمولة نزلت، كل جديد يوصلك أول بأول.', 'A deal approved, a deal on hold, or a commission paid: every update reaches you first.') },
        ],
      }}
      faq={[
        [L('ما عندي خبرة في المبيعات، أقدر أبدأ؟', 'I have no sales experience. Can I start?'), L('أكيد، اختر المنتج الي يناسبك وتعرّف عليه وعلى طريقة بيعه، تدرّب عليه وبعدها تبدأ تبيعه.', 'Of course. Pick the product that suits you, learn it and how to sell it, get trained on it, then start selling.')],
        [L('هل فيه وقت محدد للعمل؟', 'Is there a set time to work?'), L('لا؛ أنت تحدد وقت عملك حسب الي يناسبك.', 'No. You set your working hours to suit you.')],
        [L('أحتاج سجل تجاري أو رأس مال؟', 'Do I need a commercial registration or capital?'), L('لا. تسجّل باسمك وتبدأ، بدون ترخيص ولا مبلغ مقدّم ولا اشتراك.', 'No. Sign up in your own name and start, with no license, no upfront payment and no subscription.')],
        [L('كم ممكن أكسب؟', 'How much can I earn?'), L('حسب المنتج وعدد صفقاتك. كل منتج له عمولة محدّدة تشوفها قبل ما تنضم له.', 'It depends on the product and how many deals you close. Every product has a set commission you see before you join.')],
        [L('متى تنزل عمولتي؟', 'When is my commission paid?'), L('بعد اعتماد الصفقة تنتقل للمستحق، وتُصرف في وقت الصرف المحدد.', 'Once a deal is approved, it moves to payable and is paid on the scheduled payout date.')],
        [L('كيف أبدأ؟', 'How do I start?'), L('سجّل ببريدك، اختر أول منتج يناسبك، وتدرّب عليه ثم ابدأ البيع.', 'Sign up with your email, pick a first product that suits you, get trained on it, then start selling.')],
      ]}
      final={L('سجّل ببريدك، اختر أول منتج، وابدأ من اليوم', 'Sign up with your email, pick your first product, and start today')}
    />
  )
}

export default function PlatformAudiencePage({ audience }: { audience: Audience }) {
  if (audience === 'students') {
    return (
      <StandaloneShell cta={{ href: APP_MARKETER, ar: 'ابدأ الآن مجاناً', en: 'Start now for free' }}>
        <Students />
      </StandaloneShell>
    )
  }
  return (
    <PageShell active="platform">
      {audience === 'business' ? <Business /> : <Affiliate />}
    </PageShell>
  )
}
