/*
 * Jobs come from WordPress (post type `salesup_job`, managed in
 * wp-admin under "الوظائف"). Same REST pattern as the blog: same-origin
 * when the app is served as the theme, salesup.sa otherwise.
 *
 * The seed roles in data/jobs.ts remain the fallback for when the API
 * can't be reached at all — a network failure must not empty the
 * careers page. An API call that SUCCEEDS with zero jobs is respected:
 * that means the team closed every opening, and the empty state is the
 * honest answer.
 */
import { Bi, Job, JobTrack, JOBS as SEED_JOBS } from './jobs'
import { ROUTE_BASE } from '../shared/base'

const WP_ORIGIN =
  typeof window !== 'undefined' && window.location.hostname.endsWith('salesup.sa')
    ? ROUTE_BASE
    : 'https://salesup.sa'

type RawJob = {
  id: number
  slug: string
  date: string
  title?: { rendered?: string }
  meta?: Record<string, string>
}

function decodeEntities(html: string): string {
  if (typeof document === 'undefined') return html
  const el = document.createElement('textarea')
  el.innerHTML = html
  return el.value
}

/** one item per line; blank lines and stray bullets dropped */
function toList(value: string): string[] {
  return (value || '')
    .split(/\r?\n/)
    .map((l) => l.replace(/^\s*[-•*]\s*/, '').trim())
    .filter(Boolean)
}

/** pair two same-length lists; falls back to the Arabic when EN is absent */
function pairLists(ar: string, en: string): Bi[] {
  const a = toList(ar)
  const e = toList(en)
  return a.map((item, i) => ({ ar: item, en: e[i] ?? item }))
}

function bi(ar: string, en: string, fallback: Bi): Bi {
  const arV = (ar || '').trim()
  const enV = (en || '').trim()
  if (!arV && !enV) return fallback
  return { ar: arV || enV, en: enV || arV }
}

function toJob(raw: RawJob): Job {
  const m = raw.meta ?? {}
  const titleAr = decodeEntities(raw.title?.rendered ?? '').trim()
  const titleEn = (m.su_title_en || '').trim() || titleAr
  let slug = raw.slug
  try {
    slug = decodeURIComponent(raw.slug)
  } catch {
    /* keep as-is */
  }
  return {
    slug,
    track: m.su_track === 'students' ? 'students' : 'graduates',
    title: { ar: titleAr, en: titleEn },
    titleEn,
    category: bi(m.su_category_ar, m.su_category_en, { ar: 'وظيفة', en: 'Role' }),
    location: bi(m.su_location_ar, m.su_location_en, { ar: 'الرياض', en: 'Riyadh' }),
    type: bi(m.su_type_ar, m.su_type_en, { ar: 'دوام كامل', en: 'Full-time' }),
    experience: bi(m.su_experience_ar, m.su_experience_en, { ar: '', en: '' }),
    education: bi(m.su_education_ar, m.su_education_en, { ar: '', en: '' }),
    postedAt: raw.date,
    summary: bi(m.su_summary_ar, m.su_summary_en, { ar: '', en: '' }),
    responsibilities: pairLists(m.su_responsibilities_ar, m.su_responsibilities_en),
    skills: pairLists(m.su_skills_ar, m.su_skills_en),
  }
}

let cache: Job[] | null = null

/**
 * All published roles. Resolves to the WordPress list when the API
 * answers (even if empty), or the seed roles when it cannot be reached.
 */
export async function fetchJobs(): Promise<Job[]> {
  if (cache) return cache
  try {
    const resp = await fetch(
      `${WP_ORIGIN}/wp-json/wp/v2/jobs?per_page=100&_fields=id,slug,date,title,meta`,
      { signal: AbortSignal.timeout ? AbortSignal.timeout(12000) : undefined }
    )
    if (!resp.ok) throw new Error(`wp jobs ${resp.status}`)
    const raw = (await resp.json()) as RawJob[]
    cache = raw.map(toJob).filter((j) => j.title.ar || j.title.en)
    return cache
  } catch {
    /* API unreachable — never blank the careers page */
    return SEED_JOBS
  }
}

export function sortByPosted(jobs: Job[]): Job[] {
  return [...jobs].sort((a, b) => Date.parse(b.postedAt) - Date.parse(a.postedAt))
}

export function inTrack(jobs: Job[], track: JobTrack): Job[] {
  return sortByPosted(jobs.filter((j) => j.track === track))
}
