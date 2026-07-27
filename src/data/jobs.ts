/*
 * انضم لنا — careers data (Figma section "اضافه الوظائف": hub 220:930,
 * listings 223:1250, detail 208:838, application form 210:973).
 *
 * Arabic for "أخصائي تسويق" is verbatim from the Figma detail frame.
 * The other openings follow the same structure with authored copy —
 * flagged for client review. Editing this file is how a role is
 * opened, closed, or changed; `postedAt` drives the relative dates so
 * listings never go stale.
 */

export type Bi = { ar: string; en: string }

/** خريجين = graduate roles · طلاب = co-op training */
export type JobTrack = 'graduates' | 'students'

export type Job = {
  slug: string
  track: JobTrack
  title: Bi
  /** shown under the title on the detail page */
  titleEn: string
  category: Bi
  location: Bi
  type: Bi
  experience: Bi
  education: Bi
  /** ISO date — relative "منذ يوم" text is computed from it */
  postedAt: string
  summary: Bi
  responsibilities: Bi[]
  skills: Bi[]
}

export const TRACKS: {
  key: JobTrack
  badge: Bi
  title: Bi
  desc: Bi
}[] = [
  {
    key: 'students',
    badge: { ar: 'طلاب', en: 'Students' },
    title: { ar: 'التدريب التعاوني', en: 'Co-op Training' },
    desc: { ar: 'فرص تدريب تعاوني للطلاب', en: 'Co-op training opportunities for students' },
  },
  {
    key: 'graduates',
    badge: { ar: 'خريجين', en: 'Graduates' },
    title: { ar: 'وظائف', en: 'Jobs' },
    desc: { ar: 'فرص وظائف للخريجين', en: 'Job opportunities for graduates' },
  },
]

const RIYADH: Bi = { ar: 'الرياض', en: 'Riyadh' }
const FULL_TIME: Bi = { ar: 'دوام كامل', en: 'Full-time' }
const BACHELOR: Bi = { ar: 'بكالوريوس', en: "Bachelor's" }

export const JOBS: Job[] = [
  {
    slug: 'marketing-specialist',
    track: 'graduates',
    title: { ar: 'أخصائي تسويق', en: 'Marketing Specialist' },
    titleEn: 'Marketing Specialist',
    category: { ar: 'التسويق', en: 'Marketing' },
    location: RIYADH,
    type: FULL_TIME,
    experience: { ar: '+3 خبرة', en: '3+ years' },
    education: BACHELOR,
    postedAt: '2026-07-23',
    summary: {
      ar: 'يتولى أخصائي التسويق تخطيط وتنفيذ الأنشطة والحملات التسويقية التي تدعم أهداف الشركة، وتساهم في زيادة الوعي بالعلامة التجارية وجذب العملاء المحتملين. يعمل على دراسة السوق والجمهور المستهدف، وتحديد القنوات التسويقية المناسبة، والتنسيق مع فرق التصميم والمبيعات والمحتوى لضمان تنفيذ الحملات بشكل متكامل.',
      en: 'The Marketing Specialist plans and runs the marketing activities and campaigns that support company goals, build brand awareness, and attract qualified leads — studying the market and target audience, choosing the right channels, and coordinating with the design, sales, and content teams so every campaign ships as one coherent whole.',
    },
    responsibilities: [
      { ar: 'إعداد وتنفيذ الخطط والحملات التسويقية الرقمية والتقليدية.', en: 'Build and run digital and traditional marketing plans and campaigns.' },
      { ar: 'دراسة السوق والمنافسين وتحليل احتياجات وسلوك العملاء.', en: 'Study the market and competitors; analyze customer needs and behaviour.' },
      { ar: 'تحديد الجمهور المستهدف لكل حملة واختيار القنوات المناسبة للوصول إليه.', en: 'Define each campaign’s target audience and pick the right channels to reach it.' },
      { ar: 'إعداد الأفكار التسويقية وكتابة ملخصات الحملات لفريق التصميم والمحتوى.', en: 'Develop campaign ideas and write briefs for the design and content teams.' },
      { ar: 'إدارة ومتابعة المحتوى المنشور على منصات التواصل الاجتماعي والموقع الإلكتروني.', en: 'Manage and monitor content published on social platforms and the website.' },
      { ar: 'التنسيق مع المصممين وكتاب المحتوى ومزودي الخدمات التسويقية.', en: 'Coordinate with designers, copywriters, and marketing vendors.' },
      { ar: 'متابعة الإعلانات المدفوعة على منصات مثل Google وMeta وSnapchat وTikTok.', en: 'Run and monitor paid ads on Google, Meta, Snapchat, and TikTok.' },
      { ar: 'مراقبة ميزانية الحملات والتأكد من استخدامها بالشكل المناسب.', en: 'Track campaign budgets and make sure they are spent well.' },
      { ar: 'تحليل نتائج الحملات مثل عدد الزيارات، العملاء المحتملين، التفاعل، وتكلفة اكتساب العميل.', en: 'Analyze results — traffic, leads, engagement, and customer acquisition cost.' },
      { ar: 'إعداد تقارير دورية توضح أداء الأنشطة التسويقية والنتائج والتوصيات.', en: 'Produce regular reports on performance, outcomes, and recommendations.' },
      { ar: 'دعم فريق المبيعات بالمواد التسويقية والعروض والمحتوى الذي يساعد على جذب العملاء.', en: 'Support the sales team with marketing material, offers, and content that attracts customers.' },
      { ar: 'المشاركة في تنظيم الفعاليات والمعارض والحملات الترويجية.', en: 'Help organize events, exhibitions, and promotional campaigns.' },
      { ar: 'المحافظة على هوية العلامة التجارية والتأكد من توحيد الرسائل والأسلوب في جميع القنوات.', en: 'Protect brand identity and keep messaging and tone consistent across channels.' },
      { ar: 'اقتراح أفكار وفرص تسويقية جديدة تساعد على نمو الشركة وزيادة المبيعات.', en: 'Propose new marketing ideas and opportunities that grow the company and its sales.' },
    ],
    skills: [
      { ar: 'إدارة الحملات التسويقية', en: 'Campaign management' },
      { ar: 'التسويق الرقمي', en: 'Digital marketing' },
      { ar: 'تحليل السوق', en: 'Market analysis' },
      { ar: 'التعاون بين الفرق', en: 'Cross-team collaboration' },
    ],
  },
  {
    slug: 'graphic-designer',
    track: 'graduates',
    title: { ar: 'مصمم جرافيك', en: 'Graphic Designer' },
    titleEn: 'Graphic Designer',
    category: { ar: 'التصميم', en: 'Design' },
    location: RIYADH,
    type: FULL_TIME,
    experience: { ar: '+2 خبرة', en: '2+ years' },
    education: BACHELOR,
    postedAt: '2026-07-23',
    summary: {
      ar: 'يصمم مصمم الجرافيك الهوية البصرية للحملات والمحتوى التسويقي، ويحوّل الأفكار إلى تصاميم واضحة تخدم رسالة العلامة التجارية عبر المنصات الرقمية والمطبوعة.',
      en: 'The Graphic Designer shapes the visual identity of campaigns and marketing content, turning ideas into clear designs that carry the brand message across digital and print channels.',
    },
    responsibilities: [
      { ar: 'تصميم محتوى بصري لمنصات التواصل الاجتماعي والحملات الإعلانية.', en: 'Design visual content for social platforms and ad campaigns.' },
      { ar: 'تطوير هوية بصرية متسقة عبر جميع القنوات.', en: 'Develop a consistent visual identity across every channel.' },
      { ar: 'تصميم العروض التقديمية والمواد التسويقية المطبوعة والرقمية.', en: 'Design presentations and print/digital marketing material.' },
      { ar: 'التنسيق مع فريق التسويق والمحتوى لتنفيذ الأفكار في الوقت المحدد.', en: 'Work with the marketing and content teams to deliver ideas on schedule.' },
      { ar: 'مراجعة التصاميم وتحسينها بناءً على الملاحظات ونتائج الحملات.', en: 'Review and refine designs based on feedback and campaign results.' },
    ],
    skills: [
      { ar: 'Adobe Illustrator', en: 'Adobe Illustrator' },
      { ar: 'Adobe Photoshop', en: 'Adobe Photoshop' },
      { ar: 'الهوية البصرية', en: 'Brand identity' },
      { ar: 'تصميم المحتوى الرقمي', en: 'Digital content design' },
    ],
  },
  {
    slug: 'sales-executive',
    track: 'graduates',
    title: { ar: 'مسؤول مبيعات', en: 'Sales Executive' },
    titleEn: 'Sales Executive',
    category: { ar: 'المبيعات', en: 'Sales' },
    location: RIYADH,
    type: FULL_TIME,
    experience: { ar: '+1 خبرة', en: '1+ years' },
    education: BACHELOR,
    postedAt: '2026-06-24',
    summary: {
      ar: 'يقود مسؤول المبيعات دورة البيع من التواصل الأول حتى إغلاق الصفقة، ويبني علاقات واضحة مع العملاء تساعدهم يوصلون للحل الأنسب لاحتياجهم.',
      en: 'The Sales Executive owns the sales cycle from first contact to close, building clear relationships that help customers reach the solution that actually fits their need.',
    },
    responsibilities: [
      { ar: 'التواصل مع العملاء المحتملين وتأهيلهم حسب احتياجهم.', en: 'Reach out to prospects and qualify them against their real needs.' },
      { ar: 'عرض خدمات الشركة وشرح القيمة التي تناسب كل عميل.', en: 'Present the company’s services and the value that fits each customer.' },
      { ar: 'متابعة الفرص في المسار البيعي حتى الإغلاق.', en: 'Move opportunities through the pipeline to a close.' },
      { ar: 'تحديث بيانات العملاء والفرص في نظام إدارة العلاقات.', en: 'Keep customer and opportunity data current in the CRM.' },
      { ar: 'إعداد تقارير دورية عن الأداء والفرص المتاحة.', en: 'Report regularly on performance and open opportunities.' },
    ],
    skills: [
      { ar: 'التواصل والإقناع', en: 'Communication and persuasion' },
      { ar: 'إدارة المسار البيعي', en: 'Pipeline management' },
      { ar: 'التفاوض', en: 'Negotiation' },
      { ar: 'أنظمة CRM', en: 'CRM systems' },
    ],
  },
]

export function jobsInTrack(track: JobTrack): Job[] {
  return JOBS.filter((j) => j.track === track).sort(
    (a, b) => Date.parse(b.postedAt) - Date.parse(a.postedAt)
  )
}

export function findJob(slug: string): Job | undefined {
  return JOBS.find((j) => j.slug === slug)
}

/*
 * "أمس" / "منذ 3 أيام" / "منذ شهر" — computed so listings never go
 * stale. Arabic counts don't pluralize like English: 2 has its own
 * dual form, 3–10 take the plural, and 11+ return to the singular
 * accusative — so a naive `${n} يوم` reads wrong to every visitor.
 */
function arCount(n: number, dual: string, plural: string, singular: string): string {
  if (n === 2) return `منذ ${dual}`
  if (n <= 10) return `منذ ${n} ${plural}`
  return `منذ ${n} ${singular}`
}

export function postedLabel(iso: string, lang: 'ar' | 'en'): string {
  const days = Math.max(0, Math.floor((Date.now() - Date.parse(iso)) / 86400000))
  if (days <= 0) return lang === 'ar' ? 'اليوم' : 'Today'
  if (days === 1) return lang === 'ar' ? 'أمس' : 'Yesterday'
  if (days < 30) {
    return lang === 'ar' ? arCount(days, 'يومين', 'أيام', 'يومًا') : `${days} days ago`
  }
  if (days >= 365) return lang === 'ar' ? 'منذ أكثر من سنة' : 'Over a year ago'
  const months = Math.floor(days / 30)
  if (months === 1) return lang === 'ar' ? 'منذ شهر' : 'A month ago'
  if (months < 12) {
    return lang === 'ar' ? arCount(months, 'شهرين', 'أشهر', 'شهرًا') : `${months} months ago`
  }
  return lang === 'ar' ? 'منذ أكثر من سنة' : 'Over a year ago'
}

/** a role posted within the last 14 days carries the "جديد" badge */
export function isNew(iso: string): boolean {
  return Date.now() - Date.parse(iso) < 14 * 86400000
}
