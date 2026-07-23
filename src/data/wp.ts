/*
 * WordPress REST data layer. salesup.sa's WordPress is the content
 * brain (posts authored in wp-admin); this reads it from the public
 * REST API. When the app is served BY that WordPress (as the theme)
 * the calls are same-origin; on Vercel previews / local dev they go
 * cross-origin to the live site, which WP core's REST CORS allows.
 */

export type WpPost = {
  id: number
  /** decoded slug (Arabic-readable); encode when building URLs/queries */
  slug: string
  /** rendered HTML title (entities included — render as HTML) */
  title: string
  /** plain-text excerpt, tags and trailing ellipsis shortcodes stripped */
  excerpt: string
  /** rendered HTML body — present only when fetched by slug */
  content?: string
  date: string
  image?: string
  category?: string
  /** hover-scene variant, stable per post */
  fx: number
}

const WP_ORIGIN =
  typeof window !== 'undefined' && window.location.hostname.endsWith('salesup.sa')
    ? ''
    : 'https://salesup.sa'

const LIST_FIELDS = 'id,slug,date,title,excerpt,_links,_embedded'
const FULL_FIELDS = 'id,slug,date,title,excerpt,content,_links,_embedded'
const EMBED = '_embed=wp:featuredmedia,wp:term'

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&hellip;|\[&hellip;\]|\[…\]/g, '…')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim()
}

type RawPost = {
  id: number
  slug: string
  date: string
  title?: { rendered?: string }
  excerpt?: { rendered?: string }
  content?: { rendered?: string }
  _embedded?: {
    'wp:featuredmedia'?: { source_url?: string }[]
    'wp:term'?: { taxonomy?: string; name?: string }[][]
  }
}

function toPost(raw: RawPost): WpPost {
  const media = raw._embedded?.['wp:featuredmedia']?.[0]
  const category = (raw._embedded?.['wp:term'] ?? [])
    .flat()
    .find((t) => t.taxonomy === 'category' && t.name && t.name !== 'Uncategorized')?.name
  let slug = raw.slug
  try {
    slug = decodeURIComponent(raw.slug)
  } catch {
    /* keep as is */
  }
  return {
    id: raw.id,
    slug,
    title: raw.title?.rendered ?? '',
    excerpt: stripHtml(raw.excerpt?.rendered ?? ''),
    content: raw.content?.rendered,
    date: raw.date,
    image: media?.source_url,
    category,
    fx: raw.id % 7,
  }
}

async function wpGet(path: string): Promise<unknown> {
  const resp = await fetch(`${WP_ORIGIN}/wp-json/wp/v2/${path}`, {
    signal: AbortSignal.timeout ? AbortSignal.timeout(15000) : undefined,
  })
  if (!resp.ok) throw new Error(`wp ${resp.status}`)
  return resp.json()
}

let postsCache: WpPost[] | null = null

export async function fetchPosts(): Promise<WpPost[]> {
  if (postsCache) return postsCache
  const raw = (await wpGet(`posts?per_page=100&${EMBED}&_fields=${LIST_FIELDS}`)) as RawPost[]
  postsCache = raw.map(toPost)
  return postsCache
}

export async function fetchPost(slug: string): Promise<WpPost | null> {
  const encoded = encodeURIComponent(slug)
  const raw = (await wpGet(`posts?slug=${encoded}&${EMBED}&_fields=${FULL_FIELDS}`)) as RawPost[]
  if (!raw.length) return null
  return toPost(raw[0])
}

/* rough reading time for Arabic long-form (≈180 wpm) */
export function readMins(contentHtml: string): number {
  const words = stripHtml(contentHtml).split(' ').length
  return Math.max(1, Math.round(words / 180))
}

export function formatDate(iso: string, lang: 'ar' | 'en'): string {
  try {
    return new Date(iso).toLocaleDateString(lang === 'ar' ? 'ar-u-ca-gregory' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch {
    return iso.slice(0, 10)
  }
}
