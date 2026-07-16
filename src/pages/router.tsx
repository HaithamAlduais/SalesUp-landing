import { lazy, ReactNode, Suspense } from 'react'
import { SECTORS } from '../data/sectors'

/*
 * Route-level code splitting: each screen ships as its own chunk (and
 * the shaders engine as another — see components/fxScenes.tsx), so a
 * page's initial load carries only its own code.
 */
const LandingPage = lazy(() => import('../App'))
const ServicesPage = lazy(() => import('./ServicesPage'))
const MarketersPage = lazy(() => import('./MarketersPage'))
const SectorPage = lazy(() => import('./SectorPage'))
const BlogPage = lazy(() => import('./BlogPage'))
const BlogArticlePage = lazy(() => import('./BlogArticlePage'))
const PlatformPage = lazy(() => import('./PlatformPage'))
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
  if (path === '/marketers') return <MarketersPage />
  if (path === '/marketers/apply' || path === '/marketers/request') return <MarketersPage apply />

  const sectorSlug = path.match(/^\/sectors\/([^/]+)$/)?.[1]
  if (sectorSlug) {
    const slug = SECTOR_ALIASES[sectorSlug] ?? sectorSlug
    if (SECTORS[slug]) return <SectorPage slug={slug} />
  }

  if (path === '/blog') return <BlogPage />
  const articleSlug = path.match(/^\/blog\/([^/]+)$/)?.[1]
  if (articleSlug) return <BlogArticlePage slug={articleSlug} />

  if (path === '/platform') return <PlatformPage />
  if (path === '/jobs') return <JobsPage />

  /* unknown routes land on the home page */
  return <LandingPage />
}

export default function Root() {
  return <Suspense fallback={null}>{resolvePage(window.location.pathname)}</Suspense>
}
