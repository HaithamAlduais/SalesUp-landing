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
  {
    ar: string
    en: string
    icon: string
    fx: number
    /** one-line teaser for the landing cards (the long desc clipped) */
    cardAr: string
    cardEn: string
    descAr: string
    descEn: string
  }
> = {
  technology: {
    ar: 'تقنية المعلومات',
    en: 'Information Technology',
    icon: iconTech,
    fx: 7,
    cardAr:
      'حلول تقنية تشمل تطوير البرمجيات، إدارة البيانات، والحلول السحابية',
    cardEn:
      'Technology solutions: custom software, data management, and cloud',
    descAr:
      'تقدم منصة Salesup حلولًا تقنية مبتكرة تشمل تطوير البرمجيات المخصصة، إدارة البيانات، الحلول السحابية، وأمن المعلومات. ونعمل مع العملاء في مجال تقنية المعلومات لتحقيق أهدافهم',
    descEn:
      'The SalesUp platform delivers innovative technology solutions — custom software development, data management, cloud services, and information security. We work with IT companies to help them reach their goals.',
  },
  fintech: {
    ar: 'تقنية مالية',
    en: 'Financial Technology',
    icon: iconFintech,
    fx: 4,
    cardAr:
      'نساعد شركات التقنية المالية توصل لعملائها بثقة وتسرّع قرار الاشتراك',
    cardEn:
      'We help fintech companies reach customers with confidence and speed up sign-ups',
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
    cardAr:
      'حلول برمجية مرنة عبر الإنترنت: CRM، إدارة المشاريع، والتعاون',
    cardEn:
      'Flexible online software: CRM, project management, and collaboration',
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
    cardAr:
      'شريك للوكالات: تطوير الحملات، إدارة السوشال، وتحليل البيانات',
    cardEn:
      'A partner for agencies: campaigns, social management, and data analysis',
    descAr:
      'نحن شركاء للوكالات الإعلانية، حيث نقدم حلولًا تسويقية مبتكرة وإبداعية تشمل تطوير الحملات الإعلانية، وإدارة الوسائط الاجتماعية، وتحليل البيانات لتحقيق أهداف التسويق بنجاح.',
    descEn:
      'We partner with advertising agencies to deliver creative, innovative marketing solutions — campaign development, social media management, and data analysis that hit marketing goals.',
  },
}
