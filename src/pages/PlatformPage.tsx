import { PageShell } from '../shared/PageShell'
import { useLang } from '../shared/i18n'
import {
  APP_LOGIN, CommissionsScene, CrmScene, Duo, Faq, Features, Final, Hero, LeaderboardScene,
  PerformanceScene, PlatformBody, Story, companyFeatures, faqItems, marketerFeatures, storySteps,
} from './platformKit'

/*
 * الحلول الرقمية — ported from the client's platform.html reference:
 * the overview for both sides. Each side has its own page too
 * (/platform/business, /platform/affiliate, see PlatformAudiencePage).
 */
function Platform() {
  const { L } = useLang()
  const steps = storySteps(L)
  const faq = faqItems(L)
  const cta = { href: APP_LOGIN, label: L('ابدأ مجاناً', 'Start for free') }

  return (
    <PlatformBody>
      <Hero
        title={[L('الشركات والمسوّقين', 'Companies and marketers'), L('في مكان واحد', 'in one place')]}
        lead={[
          L('اعرض منتجاتك، اكتشف فرص التسويق بعمولة، وأدر الصفقات والعمولات بسهولة ', 'List your products, discover commission opportunities, and manage deals and commissions with ease '),
          L('عبر منصة تجمع الطرفين.', 'on one platform for both sides.'),
        ]}
        cta={cta}
        grow
        scenes={[<CommissionsScene live />, <CrmScene />, <LeaderboardScene />, <PerformanceScene />]}
      />
      <Duo
        title={L('طرفين على نفس المنصة', 'Two sides, one platform')}
        sides={[
          {
            icon: 'brief',
            title: L('للشركة صاحبة المنتج أو الخدمة', 'For the company behind the product or service'),
            lead: L('فريق بيع جاهز.', 'A ready sales team.'),
            points: [
              L('تعرض منتجك وتحدّد العمولة والشروط بنفسك', 'List your product and set the commission and terms yourself'),
              L('مسوّقون ينضمون له ويبدأون البيع', 'Marketers join it and start selling'),
              L('تشوف كل صفقة وصلتك', 'See every deal that reaches you'),
            ],
          },
          {
            icon: 'users',
            title: L('للمسوّق', 'For the marketer'),
            lead: L('ابدأ من مكانك بدون رأس مال.', 'Start from where you are, with no capital.'),
            points: [
              L('تتصفّح المنتجات وتشوف عمولة كل واحد قبل ما تنضم', 'Browse products and see each commission before you join'),
              L('تسجّل عملاءك وصفقاتك في CRM خاص فيك', 'Record your customers and deals in your own CRM'),
              L('تتابع المستحق والجاري وإجمالي ما كسبته', 'Track what is payable, pending, and your total earnings'),
              L('تشوف ترتيبك بين المسوّقين في لوحة المتصدّرين', 'See your rank among marketers on the leaderboard'),
            ],
          },
        ]}
      />
      <Story steps={[steps.publish, steps.opportunities, steps.crm, steps.approval, steps.commissions, steps.performance]} />
      <Features
        sets={[
          { key: 'marketer', label: L('للمسوّق', 'For marketers'), items: marketerFeatures(L) },
          /* first title per client revision (Sep 13): «انشر منصتك» */
          { key: 'company', label: L('للشركة', 'For companies'), items: companyFeatures(L, ['انشر منصتك', 'Publish your platform'], ['فريق بيع جاهز', 'A ready sales team']) },
        ]}
      />
      <Faq items={[faq.how, faq.commission, faq.approval, faq.payout, faq.many, faq.follow, faq.start]} />
      <Final text={L('سجّل بخطوة وحدة، اختر أول منتج، وابدأ تكسب من أول صفقة تقفلها', 'Sign up in one step, choose your first product, and start earning from your first closed deal')} cta={cta} />
    </PlatformBody>
  )
}

export default function PlatformPage() {
  return (
    <PageShell active="platform">
      <Platform />
    </PageShell>
  )
}
