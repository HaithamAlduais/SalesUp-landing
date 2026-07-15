import iconObjections from '../assets/blog-icon-objections.png'
import iconAffiliate from '../assets/blog-icon-affiliate.png'
import iconAi from '../assets/blog-icon-ai.png'

/*
 * Blog posts (Figma frame 5:1392 — the three unique cards; the frame
 * repeats them as filler). Shared with the blog-article session.
 * Arabic titles are verbatim from Figma.
 */
export type BlogPost = {
  slug: string
  titleAr: string
  titleEn: string
  icon: string
  /** CardFx scene variant for the hover reveal */
  fx: number
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'handling-customer-objections',
    titleAr: 'كيف تتعامل مع اعتراضات العملاء؟ دليل عملي لإغلاق عملية البيع',
    titleEn: 'How to Handle Customer Objections: A Practical Guide to Closing the Sale',
    icon: iconObjections,
    fx: 0,
  },
  {
    slug: 'affiliate-marketing-platforms',
    titleAr: 'منصات التسويق بالعمولة للشركات ما هي ولماذا تحتاجها شركتك؟',
    titleEn: 'Affiliate Marketing Platforms: What They Are and Why Your Company Needs One',
    icon: iconAffiliate,
    fx: 2,
  },
  {
    slug: 'ai-in-sales-guide',
    titleAr: 'تعرف على الذكاء الاصطناعي في المبيعات دليل شامل من سيلزاب',
    titleEn: 'AI in Sales: A Complete Guide from SalesUp',
    icon: iconAi,
    fx: 6,
  },
]
