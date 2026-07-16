/*
 * Shared blog data (posts list + article bodies).
 * Created by the blog-article session (5) since the blog-index session
 * hadn't run yet — the index session should consume BLOG_POSTS from
 * here. Arabic copy is verbatim from Figma (cards 5:1408-5:1410,
 * article 5:1467); English is authored marketing copy per the handbook.
 */
import imgAiInSales from '../assets/blog-ai-in-sales.png'
import iconAi from '../assets/blog-icon-ai.png'
import imgAffiliate from '../assets/blog-affiliate-platforms.png'
import iconAffiliate from '../assets/blog-icon-affiliate.png'
import imgObjections from '../assets/blog-customer-objections.png'
import iconObjections from '../assets/blog-icon-objections.png'

export type Bi = { ar: string; en: string }

export type BlogPost = {
  slug: string
  title: Bi
  /** one-line teaser for the index cards */
  excerpt: Bi
  /** topic chip shown on cards and the article header */
  category: Bi
  /** estimated reading time in minutes */
  readMins: number
  /** article hero / related-card image */
  image: string
  /** small 3D icon for the index cards */
  icon: string
  /** CardFx scene variant for the index hover reveal */
  fx: number
}

export type ArticleBlock =
  | { type: 'heading'; text: Bi }
  | { type: 'paragraph'; lines: Bi[]; bold?: boolean }
  | { type: 'list'; items: Bi[]; bold?: boolean }

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'ai-in-sales',
    title: {
      ar: 'تعرف على الذكاء الاصطناعي في المبيعات دليل شامل من سيلزاب',
      en: 'AI in Sales: A Complete Guide from SalesUp',
    },
    excerpt: {
      ar: 'كيف يغيّر الذكاء الاصطناعي طريقة البيع — من فهم العملاء إلى أتمتة المتابعة وتحسين النتائج',
      en: 'How AI is changing the way you sell — from understanding customers to automating follow-up and improving results',
    },
    category: { ar: 'الذكاء الاصطناعي', en: 'AI & Sales' },
    readMins: 6,
    image: imgAiInSales,
    icon: iconAi,
    fx: 6,
  },
  {
    slug: 'affiliate-marketing-platforms',
    title: {
      ar: 'منصات التسويق بالعمولة للشركات ما هي ولماذا تحتاجها شركتك؟',
      en: 'Affiliate Marketing Platforms for Businesses: What Are They and Why Does Your Company Need One?',
    },
    excerpt: {
      ar: 'نموذج تسويق تدفع فيه مقابل النتائج فقط — تعرف على المنصات ولماذا تحتاجها شركتك الآن',
      en: 'A marketing model where you pay for results only — what these platforms are and why your company needs one now',
    },
    category: { ar: 'تسويق', en: 'Marketing' },
    readMins: 7,
    image: imgAffiliate,
    icon: iconAffiliate,
    fx: 2,
  },
  {
    slug: 'handling-customer-objections',
    title: {
      ar: 'كيف تتعامل مع اعتراضات العملاء؟ دليل عملي لإغلاق عملية البيع',
      en: 'How to Handle Customer Objections: A Practical Guide to Closing the Sale',
    },
    excerpt: {
      ar: 'دليل عملي للتعامل مع اعتراضات العملاء وتحويلها إلى فرص حقيقية لإغلاق الصفقة',
      en: 'A practical guide to handling customer objections and turning them into real opportunities to close',
    },
    category: { ar: 'مبيعات', en: 'Sales' },
    readMins: 5,
    image: imgObjections,
    icon: iconObjections,
    fx: 0,
  },
]

export const ARTICLES: Record<string, ArticleBlock[]> = {
  'affiliate-marketing-platforms': [
    {
      type: 'heading',
      text: {
        ar: 'ما هي منصات التسويق بالعمولة للشركات؟ ولماذا تحتاج شركتك منصة تسويق بالعمولة الآن',
        en: 'What are affiliate marketing platforms for businesses — and why does your company need one now?',
      },
    },
    {
      type: 'paragraph',
      lines: [
        {
          ar: 'مع زيادة تكلفة الإعلانات التقليدية وتشتت قنوات التسويق الرقمي، أصبحت الشركات بحاجة إلى طريقة تسويق تدفع فيها مقابل النتائج فقط بدل المجازفة بميزانيات كبيرة دون عائد واضح.',
          en: 'With the rising cost of traditional advertising and the fragmentation of digital marketing channels, businesses need a model where they pay for results only — instead of gambling big budgets with no clear return.',
        },
        {
          ar: 'منصات التسويق بالعمولة للشركات تقدم نموذجًا مختلفًا؛ حيث تربط بين شركتك وبين شبكة من مسوقين بالعمولة يحققون مبيعات فعلية مقابل عمولة محددة سلفًا، مع إمكانية تتبع كل شيء بدقة وشفافية.',
          en: 'Affiliate marketing platforms offer a different model: they connect your company to a network of affiliate marketers who drive real sales for a pre-agreed commission, with everything tracked precisely and transparently.',
        },
        {
          ar: 'هذا النموذج يجعل التسويق بالعمولة للشركات خيارًا جذابًا لكل من يريد توسيع المبيعات دون توظيف فرق كبيرة أو إنفاق مبالغ ضخمة في الإعلانات المدفوعة.',
          en: 'That makes affiliate marketing an attractive option for any business that wants to grow sales without hiring large teams or pouring money into paid ads.',
        },
      ],
    },
    {
      type: 'heading',
      text: {
        ar: 'ما هي منصة التسويق بالعمولة وكيف تخدم الشركات؟',
        en: 'What is an affiliate marketing platform, and how does it serve businesses?',
      },
    },
    {
      type: 'paragraph',
      lines: [
        {
          ar: 'منصة التسويق بالعمولة هي حل تقني يجمع في مكان واحد ثلاث جهات رئيسية:',
          en: 'An affiliate marketing platform is a technical solution that brings three key parties together in one place:',
        },
        {
          ar: 'الشركة التي تقدم المنتج أو الخدمة، المسوقين بالعمولة الذين يروّجون لهذه العروض، ونظام تتبع وحسابات يضمن لكل طرف حقه بشكل منظم وموثوق.',
          en: 'the company offering the product or service, the affiliate marketers promoting those offers, and a tracking-and-accounting system that guarantees each party its due in an organized, trustworthy way.',
        },
        {
          ar: 'الشركة تسجّل في منصة التسويق بالعمولة، تضيف منتجاتها أو خدماتها، وتحدد نوع الإجراء الذي تريد من المسوقين تحقيقه، مثل إتمام عملية شراء، تسجيل في خدمة، حجز موعد، أو حتى تعبئة نموذج.',
          en: 'The company registers on the platform, adds its products or services, and defines the action it wants marketers to drive — completing a purchase, signing up for a service, booking an appointment, or even filling out a form.',
        },
      ],
    },
    {
      type: 'paragraph',
      lines: [
        {
          ar: 'بعد ذلك، تقوم المنصة بإتاحة هذه العروض لقاعدة من مسوقين بالعمولة، كل واحد منهم يمتلك أدواته وقنواته التسويقية، مثل:',
          en: 'The platform then makes these offers available to a base of affiliate marketers, each with their own tools and marketing channels, such as:',
        },
      ],
    },
    {
      type: 'list',
      bold: true,
      items: [
        { ar: 'حسابات على شبكات التواصل الاجتماعي', en: 'Social media accounts' },
        { ar: 'مدونات ومواقع محتوى', en: 'Blogs and content websites' },
        { ar: 'قوائم بريدية أو جروبات خاصة', en: 'Mailing lists and private groups' },
        { ar: 'قنوات على يوتيوب أو منصات الفيديو', en: 'YouTube channels and video platforms' },
      ],
    },
    {
      type: 'paragraph',
      lines: [
        {
          ar: 'كل مسوّق يحصل على رابط تتبع خاص أو كود مميز مرتبط بحسابه داخل المنصة.',
          en: 'Every marketer gets a unique tracking link or code tied to their account inside the platform.',
        },
        {
          ar: 'عندما يروّج المسوق للخدمة ويقوم العميل بالنقر على الرابط أو استخدام الكود وإتمام العملية المطلوبة، يتم تسجيل التحويل في نظام المنصة تلقائيًا.',
          en: 'When a marketer promotes the service and a customer clicks the link or uses the code and completes the required action, the conversion is recorded in the platform automatically.',
        },
        {
          ar: 'هنا يظهر دور منصة التسويق بالعمولة في توثيق كل عملية، ربطها بالمسوق الصحيح، وحساب العمولة المستحقة بدقة.',
          en: "This is where the platform earns its keep: documenting every transaction, attributing it to the right marketer, and calculating the commission owed — precisely.",
        },
      ],
    },
    {
      type: 'paragraph',
      lines: [
        {
          ar: 'هذا يجعل التسويق بالعمولة للشركات عملية واضحة: تعرف كم زائر جاء من كل مسوّق، كم منهم تحوّل إلى عميل، وما هي العائدات الناتجة عن كل مسوّق بالعمولة.',
          en: 'That clarity is the point: you know how many visitors each marketer sent, how many converted into customers, and what revenue each affiliate generated.',
        },
        {
          ar: 'بدل التخمين في نتائج الحملات، تحصل على أرقام حقيقية تساعدك في اتخاذ قرارات مبنية على بيانات، مثل زيادة العمولة لمسوقين مميزين أو إيقاف عروض غير فعالة.',
          en: 'Instead of guessing at campaign results, you get real numbers that support data-driven decisions — raising commissions for top performers or pausing offers that don’t work.',
        },
      ],
    },
    {
      type: 'heading',
      text: {
        ar: 'الفرق بين منصات التسويق بالعمولة للشركات والبرامج التقليدية',
        en: 'Affiliate platforms vs. traditional in-house programs',
      },
    },
    {
      type: 'paragraph',
      lines: [
        {
          ar: 'بعض الشركات تحاول تطبيق التسويق بالعمولة داخليًا بدون منصة متخصصة، كأن تُنشئ برنامج عمولة بسيط يدويًا مع عدد محدود من الشركاء أو المؤثرين.',
          en: 'Some companies try to run affiliate marketing in-house without a dedicated platform — a simple, manually-managed commission program with a handful of partners or influencers.',
        },
        {
          ar: 'هذا الأسلوب التقليدي غالبًا يواجه مشكلات واضحة: صعوبة التتبع، تضارب في البيانات، تأخر في دفع العمولات، ومجهود كبير في التواصل والمتابعة.',
          en: 'That traditional approach usually runs into predictable problems: hard-to-track results, conflicting data, delayed commission payouts, and a heavy load of communication and follow-up.',
        },
      ],
    },
    {
      type: 'paragraph',
      bold: true,
      lines: [
        {
          ar: 'أما منصات التسويق بالعمولة للشركات فتوفر بنية جاهزة ومجربة، وتتميز بعدة نقاط أساسية:',
          en: 'Affiliate marketing platforms, by contrast, give you a proven, ready-made structure with several key advantages:',
        },
      ],
    },
    {
      type: 'list',
      items: [
        {
          ar: 'نظام تتبع آلي: المنصة تتولى تسجيل النقرات والتحويلات وربطها بكل مسوّق بالعمولة، دون الحاجة لجداول يدوية أو مراجعات مرهقة.',
          en: 'Automated tracking: the platform records clicks and conversions and attributes them to each marketer — no manual spreadsheets or exhausting reconciliation.',
        },
        {
          ar: 'واجهة واحدة لكل الأطراف: الشركة، المسوقون، وإدارة المنصة يعملون من خلال نفس النظام، ما يقلل الأخطاء وسوء الفهم.',
          en: 'One interface for everyone: the company, the marketers, and the platform team all work in the same system, which cuts errors and misunderstandings.',
        },
        {
          ar: 'قابلية التوسع: بدل إدارة 5 أو 10 مسوقين يدويًا، يمكنك عبر منصة التسويق بالعمولة التعامل مع عشرات أو مئات المسوقين بالعمولة في نفس الوقت.',
          en: 'Scalability: instead of manually managing 5 or 10 marketers, a platform lets you work with tens or hundreds of affiliates at the same time.',
        },
        {
          ar: 'قواعد واضحة للعمولات: تحدد نسب العمولة حسب المنتج أو الخدمة، مع إمكانية تغييرها أو إطلاق عروض خاصة بسهولة من داخل المنصة.',
          en: 'Clear commission rules: set rates per product or service, change them easily, or launch special offers right from the platform.',
        },
      ],
    },
    {
      type: 'paragraph',
      bold: true,
      lines: [
        {
          ar: 'هذا الفرق يجعل منصات التسويق بالعمولة للشركات خيارًا عمليًا عندما تريد أن يتحول التسويق بالعمولة من تجربة بسيطة إلى قناة بيع رئيسية مبنية على أسس واضحة.',
          en: 'That difference is what makes an affiliate platform the practical choice when you want affiliate marketing to grow from a small experiment into a primary sales channel built on solid foundations.',
        },
      ],
    },
  ],
}
