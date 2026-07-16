import iconFintech from '../assets/icon-fintech.png'
import iconSaas from '../assets/icon-saas.png'
import iconAgencies from '../assets/icon-agencies.png'
import iconTech from '../assets/icon-tech.png'

/*
 * Sector identities shared by the landing cards, the sector pages, and
 * the router's slug validation. Lives outside the page module so the
 * landing chunk and the router never pull SectorPage code.
 * Arabic copy verbatim from Figma (5:1530/5:1944/5:2089/5:2234) except
 * fintech, whose Figma copy was design-industry text — rewritten as
 * fintech copy pending client verification.
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
      'نساعد شركات التقنية المالية توصل لعملائها بثقة — من بناء مسار المبيعات وتوليد العملاء المحتملين، إلى شرح المنتج المالي بشكل واضح يكسب ثقة العميل ويسرّع قرار الاشتراك.',
    descEn:
      'We help fintech companies reach their customers with confidence — from building the sales pipeline and generating qualified leads, to explaining financial products clearly in a way that earns trust and speeds up sign-up decisions.',
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
