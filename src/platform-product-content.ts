/**
 * Public product copy checked against the SalesUp application, 2026-09-15.
 * Sources: packages/core/src/copy/{voice,products,leads,money,dashboard}.ts;
 * apps/web/components/modules/dashboard/{affiliate-dashboard,brand/dashboard}.tsx;
 * products/admin/share-terms.tsx; products/brand/decide-relayed-deal.tsx;
 * apps/web/lib/modules/products/publish.ts; app/(auth)/login/page.tsx.
 * Preview figures belong to explicitly labelled demonstration data, not this copy.
 */

export type Bi = { ar: string; en: string }
export type ProductAudience = 'company' | 'marketer'
export type ProductPreviewView =
  | 'products'
  | 'company'
  | 'customers'
  | 'commissions'
  | 'dashboard'
  | 'materials'
  | 'leaderboard'
export type ProductContentIcon = 'cube' | 'brief' | 'users' | 'wallet' | 'chart' | 'trophy' | 'bell'

export const APP_LOGIN_URL = 'https://app.salesup.sa/login'
export const COMPANY_SIGNUP_URL = `${APP_LOGIN_URL}?intent=brand`
export const MARKETER_SIGNUP_URL = `${APP_LOGIN_URL}?intent=affiliate`

export const productHero: {
  eyebrow: Bi
  title: Bi
  accent: Bi
  description: Bi
} = {
  eyebrow: { ar: 'منصة SalesUp', en: 'The SalesUp platform' },
  title: { ar: 'من المنتج إلى الصفقة.', en: 'From product to sale.' },
  accent: { ar: 'كل خطوة في حسابك.', en: 'Every step, in your workspace.' },
  description: {
    ar: 'منتجات ومواد بيع، إدارة عملاء، صفقات وعمولات. منصة تجمع الشركات والمسوّقين، وكل طرف يشوف الأدوات والتفاصيل اللي تخصّه.',
    en: 'Products, sales materials, CRM, deals and commissions. One platform for companies and agents, with a workspace built around each role.',
  },
}

export const accountContent: {
  audience: ProductAudience
  label: Bi
  title: Bi
  accent: Bi
  description: Bi
  benefits: { title: Bi; description: Bi }[]
}[] = [
  {
    audience: 'company',
    label: { ar: 'للشركات', en: 'For companies' },
    title: { ar: 'منتجاتك.', en: 'Your products.' },
    accent: { ar: 'وكل صفقة تخصّها.', en: 'And the sales behind them.' },
    description: {
      ar: 'أضف منتجك ومواد البيع، وتابع طلبات الصفقات وأداء منتجاتك من حساب الشركة.',
      en: 'Add your product and sales materials, then follow deal requests and product performance in your company workspace.',
    },
    benefits: [
      {
        title: { ar: 'جهّز منتجك للمراجعة', en: 'Prepare your product for review' },
        description: { ar: 'أضف التفاصيل والشروط والملفات، وأرسلها لمراجعة SalesUp.', en: 'Add details, terms and files, then submit them for SalesUp review.' },
      },
      {
        title: { ar: 'تابع صفقات منتجاتك', en: 'Follow your product sales' },
        description: { ar: 'راجع طلبات الصفقات، وشوف قيمة المبيعات وأداء كل منتج.', en: 'Review deal requests and see sales value and performance by product.' },
      },
      {
        title: { ar: 'الفوترة واضحة', en: 'Keep billing in view' },
        description: { ar: 'من الفوترة، تابع المستحق عليك لـ SalesUp وما سددته.', en: 'Use Billing to track what you owe SalesUp and what you have paid.' },
      },
    ],
  },
  {
    audience: 'marketer',
    label: { ar: 'للمسوّقين', en: 'For agents' },
    title: { ar: 'منتج تختاره.', en: 'A product you choose.' },
    accent: { ar: 'ومبيعات تتابعها.', en: 'A sales journey you manage.' },
    description: {
      ar: 'تعرّف على المنتج وعمولتك، جهّز نفسك بمواد البيع، وتابع عملاءك وصفقاتك من حسابك.',
      en: 'Understand the product and your commission, prepare with sales materials, and manage your leads and deals from your workspace.',
    },
    benefits: [
      {
        title: { ar: 'اعرف المنتج قبل ما تبدأ', en: 'Know the product before you start' },
        description: { ar: 'راجع عمولتك والشروط ومواد البيع ومتطلبات الانضمام.', en: 'Review your commission, terms, sales materials and joining requirements.' },
      },
      {
        title: { ar: 'إدارة العملاء', en: 'CRM' },
        description: { ar: 'سجّل العملاء المحتملين، وحدّد المتابعة، وتابع انتقالهم بين المراحل.', en: 'Record leads, set follow-ups and track their progress through your pipeline.' },
      },
      {
        title: { ar: 'العمولات وحالتها', en: 'Commissions and their status' },
        description: { ar: 'شوف عمولاتك وتحت الإجراء، وتابع طلبات التحويل من صفحة العمولات.', en: 'See your commissions and amounts in progress, and follow payout requests on Commissions.' },
      },
    ],
  },
]

export const journeyContent: {
  audience: ProductAudience
  title: Bi
  description: Bi
  proof: Bi
  view: ProductPreviewView
  icon: ProductContentIcon
}[] = [
  {
    audience: 'company',
    title: { ar: 'جهّز منتجك وارسله للمراجعة', en: 'Prepare your product for review' },
    description: { ar: 'أضف وصف المنتج وتفاصيله وشروطه ومواد البيع. بعد الإرسال تراجع SalesUp المنتج قبل إتاحته للمسوّقين.', en: 'Add product details, terms and sales materials. SalesUp reviews the submission before it becomes available to agents.' },
    proof: { ar: 'الإرسال للمراجعة مو نشر مباشر.', en: 'Submitting for review does not make the product live.' },
    view: 'company',
    icon: 'cube',
  },
  {
    audience: 'marketer',
    title: { ar: 'اختر المنتج وأنت عارف تفاصيله', en: 'Choose a product with the details in view' },
    description: { ar: 'تصفّح المنتجات، واقرأ تفاصيل كل منتج وعمولتك وشروطه قبل ما تنضم له.', en: 'Browse products and review each product’s details, your commission and its terms before joining.' },
    proof: { ar: 'عمولتك الخاصة تظهر لك داخل المنتج.', en: 'The product shows your own commission terms.' },
    view: 'products',
    icon: 'cube',
  },
  {
    audience: 'marketer',
    title: { ar: 'تعرّف على المنتج من مواد البيع', en: 'Get to know the product through sales materials' },
    description: { ar: 'اقرأ الملفات المتاحة للمنتج. إذا عليه اختبار، تكمل متطلباته قبل الانضمام.', en: 'Read the product’s available materials. If it has a quiz, complete the required steps before joining.' },
    proof: { ar: 'متطلبات الانضمام تختلف حسب المنتج.', en: 'Joining requirements depend on the product.' },
    view: 'materials',
    icon: 'brief',
  },
  {
    audience: 'marketer',
    title: { ar: 'تابع العميل من أول تواصل', en: 'Follow the lead from the first contact' },
    description: { ar: 'سجّل العميل المحتمل على منتجك، وحدّد موعد المتابعة، وانقله بين المراحل حسب تقدّم البيع.', en: 'Add a lead to your product, set a follow-up date and move them through the stages as the sale progresses.' },
    proof: { ar: 'بيانات العميل وسجل المراحل في إدارة العملاء.', en: 'Lead details and stage history stay in CRM.' },
    view: 'customers',
    icon: 'users',
  },
  {
    audience: 'company',
    title: { ar: 'راجع طلب الصفقة وتفاصيله', en: 'Review the deal request and its details' },
    description: { ar: 'لما يرسل المسوّق طلب الصفقة، يظهر للشركة في الفوترة. تراجع البيانات، وتعتمد مع إرفاق الإيصال أو ترفض الطلب.', en: 'When an agent submits a deal request, it appears in the company’s Billing. Review the details, then approve with a receipt or reject the request.' },
    proof: { ar: 'قرار الصفقة وإيصالها جزء من السجل.', en: 'The decision and receipt are part of the deal record.' },
    view: 'company',
    icon: 'brief',
  },
  {
    audience: 'marketer',
    title: { ar: 'تابع العمولة لين تتحوّل لك', en: 'Follow the commission through to payment' },
    description: { ar: 'بعد اعتماد الشركة للصفقة مع الإيصال، تتابع تحويل عمولتك من SalesUp. صفحة العمولات تفرّق بين اللي تحوّل لك واللي تحت الإجراء.', en: 'After the company approves the deal with its receipt, follow your commission transfer from SalesUp. Commissions distinguishes money transferred to you from amounts still in progress.' },
    proof: { ar: 'اعتماد الصفقة مو نفس تحويل العمولة.', en: 'Deal approval and commission payment are separate steps.' },
    view: 'commissions',
    icon: 'wallet',
  },
]

export type ProductFeatureContent = {
  title: Bi
  description: Bi
  view: ProductPreviewView
  icon: ProductContentIcon
}

export const featureContent: Record<ProductAudience, ProductFeatureContent[]> = {
  company: [
    { title: { ar: 'المنتجات', en: 'Products' }, description: { ar: 'أضف تفاصيل المنتج وشروطه، وأرسله للمراجعة، وتابع حالته من حساب الشركة.', en: 'Add product details and terms, submit for review and follow its status in your company workspace.' }, view: 'company', icon: 'cube' },
    { title: { ar: 'مواد البيع', en: 'Sales materials' }, description: { ar: 'أرفق ملفات المنتج ومواد البيع اللي تساعد المسوّق يفهمه قبل ما يبدأ.', en: 'Attach product files and sales materials that help agents understand what they will sell.' }, view: 'materials', icon: 'brief' },
    { title: { ar: 'لوحة التحكم', en: 'Dashboard' }, description: { ar: 'شوف قيمة الصفقات والصفقات المقفلة والعملاء المحتملين والصفقات المتوقع إغلاقها.', en: 'See sales value, closed deals, lead counts and expected closes.' }, view: 'company', icon: 'chart' },
    { title: { ar: 'أداء المنتجات', en: 'Product performance' }, description: { ar: 'قارن نتائج منتجاتك وعدد المسوّقين المنضمين لكل منتج، بدون عرض هوياتهم.', en: 'Compare product results and joined-agent counts without exposing agent identities.' }, view: 'company', icon: 'chart' },
    { title: { ar: 'طلبات الصفقات', en: 'Deal requests' }, description: { ar: 'راجع طلبات الصفقات اللي توصلك. الاعتماد مع إرفاق الإيصال، والرفض له إجراء واضح.', en: 'Review incoming deal requests. Approve with a receipt or reject through the available action.' }, view: 'company', icon: 'brief' },
    { title: { ar: 'الفوترة', en: 'Billing' }, description: { ar: 'تابع المستحق عليك لـ SalesUp والمدفوع، مع تفاصيل الصفقات والإيصالات.', en: 'Track what you owe SalesUp and what you have paid, alongside deal details and receipts.' }, view: 'company', icon: 'wallet' },
  ],
  marketer: [
    { title: { ar: 'المنتجات', en: 'Products' }, description: { ar: 'تصفّح كل المنتجات، وارجع للمنتجات اللي انضممت لها من «منتجاتي».', en: 'Browse All Products and return to the products you joined in My Products.' }, view: 'products', icon: 'cube' },
    { title: { ar: 'مواد البيع', en: 'Sales materials' }, description: { ar: 'افتح ملفات المنتج ومواد البيع المتاحة، وتابع متطلبات الاختبار إذا كان المنتج يتطلبه.', en: 'Open available product files and sales materials, and follow quiz requirements when a product has them.' }, view: 'materials', icon: 'brief' },
    { title: { ar: 'إدارة العملاء', en: 'CRM' }, description: { ar: 'عميل محتمل، موعد متابعة، وسجل مراحل. تابع كل عميل على المنتج اللي يخصّه.', en: 'Lead details, follow-up dates and stage history. Keep each lead connected to the relevant product.' }, view: 'customers', icon: 'users' },
    { title: { ar: 'العمولات', en: 'Commissions' }, description: { ar: 'راجع حالات عمولاتك، وشوف المبالغ المتاحة للتحويل، وتابع طلباتك.', en: 'Review commission statuses, see amounts available for payout and follow your requests.' }, view: 'commissions', icon: 'wallet' },
    { title: { ar: 'لوحة التحكم', en: 'Dashboard' }, description: { ar: 'عمولاتي، تحت الإجراء، ومنتجات انضممت لها؛ ومعها الصفقات بالشهر وآخر الصفقات.', en: 'My commissions, amounts in progress and products you joined, plus deals by month and your recent deals.' }, view: 'dashboard', icon: 'chart' },
    { title: { ar: 'لوحة الصدارة', en: 'Leaderboard' }, description: { ar: 'شوف ترتيبك ومستواك وأوسمتك، وغيّر الفترة عشان تتابع تقدّمك.', en: 'See your ranking, level and badges, and change the period to follow your progress.' }, view: 'leaderboard', icon: 'trophy' },
  ],
}

export const faqContent: { question: Bi; answer: Bi }[] = [
  {
    question: { ar: 'مين يستخدم منصة SalesUp؟', en: 'Who is SalesUp for?' },
    answer: { ar: 'الشركات تضيف منتجاتها وتتابع صفقاتها وفوترتها. المسوّقون يتعرّفون على المنتجات، وينضمون لها، ويتابعون عملاءهم وعمولاتهم. كل طرف له حساب وأدوات تخصّه.', en: 'Companies add products and manage their sales and billing. Agents explore and join products, then manage their leads and commissions. Each role has its own workspace and tools.' },
  },
  {
    question: { ar: 'هل المنتج يظهر مباشرة بعد إضافته؟', en: 'Does a product go live as soon as I add it?' },
    answer: { ar: 'إضافة المنتج وإرساله تنقله للمراجعة، مو للنشر المباشر. SalesUp تراجع التفاصيل قبل إتاحة المنتج للمسوّقين، وتقدر تتابع حالته من حساب الشركة.', en: 'Submitting a product sends it for review, not straight to publication. SalesUp reviews its details before it becomes available to agents. Its status is visible in the company workspace.' },
  },
  {
    question: { ar: 'كيف أنضم لمنتج كمسوّق؟', en: 'How do I join a product as an agent?' },
    answer: { ar: 'افتح المنتج وراجع تفاصيله وعمولتك وشروطه. اطّلع على مواد البيع ومتطلبات الانضمام؛ إذا المنتج عليه اختبار، تكمل متطلباته قبل الانضمام.', en: 'Open the product and review its details, your commission and the terms. Check its sales materials and joining requirements. If it has a quiz, complete the required steps before joining.' },
  },
  {
    question: { ar: 'كيف أعرف عمولتي؟', en: 'How do I know my commission?' },
    answer: { ar: 'المنتج يعرض لك عمولتك الخاصة، كنسبة من قيمة البيع أو مبلغ ثابت. SalesUp تحدّد حصة المسوّق، وهي منفصلة عن اتفاقها مع الشركة.', en: 'The product shows your own commission as a percentage of the sale or a fixed amount. SalesUp sets the agent’s share separately from its agreement with the company.' },
  },
  {
    question: { ar: 'وش يصير بعد إرسال طلب الصفقة؟', en: 'What happens after a deal request is submitted?' },
    answer: { ar: 'طلب المسوّق يظهر للشركة في الفوترة. الشركة تراجع التفاصيل، وتعتمد مع إرفاق إيصال السداد أو ترفض الطلب. بعد الاعتماد، المسوّق يتابع تحويل عمولته من صفحة العمولات.', en: 'The agent’s request appears in the company’s Billing. The company reviews the details, then approves with its payment receipt or rejects the request. After approval, the agent follows the commission transfer on Commissions.' },
  },
  {
    question: { ar: 'هل العمولة تتحوّل مع اعتماد الصفقة؟', en: 'Is the commission transferred when the deal is approved?' },
    answer: { ar: 'اعتماد الشركة مع إيصال السداد مو تحويل فوري للمسوّق. SalesUp تتولّى التحويل يدويًا بعدها، وتقدر تتابع حالة المبلغ من صفحة العمولات. طلب التحويل للمبالغ المتاحة يخضع للمتطلبات اللي تظهر لك في الصفحة.', en: 'Company approval with a payment receipt is not an immediate transfer to the agent. SalesUp handles the transfer manually afterward, and its status is visible on Commissions. Payout requests for available amounts follow the requirements shown on that page.' },
  },
  {
    question: { ar: 'هل الشركة تشوف هويات المسوّقين وعمولاتهم؟', en: 'Can companies see agent identities and commissions?' },
    answer: { ar: 'الشركة تشوف نتائج منتجاتها وصفقاتها وأعداد المسوّقين، مو هوياتهم أو حصصهم. SalesUp تتولّى العلاقة مع المسوّقين، وكل مسوّق يشوف عمولته الخاصة من حسابه.', en: 'Companies see product results, deals and agent counts, not agent identities or their individual shares. SalesUp manages the agent relationship, and each agent sees their own commission in their workspace.' },
  },
]
