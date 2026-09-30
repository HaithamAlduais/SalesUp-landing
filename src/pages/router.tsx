import { lazy, ReactNode, Suspense } from 'react'
import { SECTORS } from '../data/sectors'
import { appPath, withBase } from '../shared/base'

/*
 * Route-level code splitting: each screen ships as its own chunk (and
 * the shaders engine as another — see components/fxScenes.tsx), so a
 * page's initial load carries only its own code.
 */
const LandingPage = lazy(() => import('../App'))
const ServicesPage = lazy(() => import('./ServicesPage'))
const SectorPage = lazy(() => import('./SectorPage'))
const BlogPage = lazy(() => import('./BlogPage'))
const BlogArticlePage = lazy(() => import('./BlogArticlePage'))
const PlatformAudiencePage = lazy(() => import('./PlatformAudiencePage'))
const JobsPage = lazy(() => import('./JobsPage'))

function normalizePath(pathname: string) {
  const clean = pathname.split('?')[0].split('#')[0]
  if (clean === '/') return clean
  return clean.replace(/\/+$/, '') || '/'
}

const SECTOR_ALIASES: Record<string, string> = {
  it: 'technology',
  'information-technology': 'technology',
  advertising: 'agencies',
  'advertising-agencies': 'agencies',
}

export function resolvePage(pathname: string): ReactNode {
  const path = normalizePath(pathname)

  if (path === '/') return <LandingPage />
  if (path === '/services' || /^\/services\/[^/]+$/.test(path)) return <ServicesPage />

  const sectorSlug = path.match(/^\/sectors\/([^/]+)$/)?.[1]
  if (sectorSlug) {
    const slug = SECTOR_ALIASES[sectorSlug] ?? sectorSlug
    if (SECTORS[slug]) return <SectorPage slug={slug} />
  }

  if (path === '/blog') return <BlogPage />
  const articleSlug = path.match(/^\/blog\/([^/]+)$/)?.[1]
  if (articleSlug) return <BlogArticlePage slug={articleSlug} />

  /* the combined platform page was retired (client, Sep 30):
     الحلول الرقمية opens the companies page. Old links land there too,
     with the address corrected so it can be shared/bookmarked */
  if (path === '/platform') {
    window.history.replaceState(null, '', withBase('/platform/business') + window.location.search + window.location.hash)
    return <PlatformAudiencePage audience="business" />
  }
  /* the platform's audience pages; /platform/students is standalone
     (its own header and footer) and deliberately not linked anywhere */
  const audience = path.match(/^\/platform\/(business|affiliate|students)$/)?.[1]
  if (audience === 'business' || audience === 'affiliate' || audience === 'students') {
    return <PlatformAudiencePage audience={audience} />
  }

  /* انضم لنا: hub, per-track listings, the application form, and role
     detail — 'students'/'graduates'/'apply' are reserved, anything else
     is a role slug */
  if (path === '/jobs') return <JobsPage />
  const jobsSeg = path.match(/^\/jobs\/([^/]+)$/)?.[1]
  if (jobsSeg) {
    /* a malformed escape (e.g. /jobs/%E0%A4%A) would throw here and
       blank the page — an undecodable slug simply matches no role */
    let seg = jobsSeg
    try {
      seg = decodeURIComponent(jobsSeg)
    } catch {
      /* keep the raw segment */
    }
    if (seg === 'students' || seg === 'graduates') return <JobsPage view="track" slug={seg} />
    if (seg === 'apply') return <JobsPage view="apply" />
    return <JobsPage view="detail" slug={seg} />
  }

  /* unknown routes land on the home page */
  return <LandingPage />
}

export default function Root() {
  /* appPath strips the install base (subdirectory WordPress installs) */
  return <Suspense fallback={null}>{resolvePage(appPath(window.location.pathname))}</Suspense>
}
