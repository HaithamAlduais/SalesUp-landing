import { ReactNode } from 'react'
import LandingPage from '../App'
import ServicesPage from './ServicesPage'
import MarketersPage from './MarketersPage'
import SectorPage, { SECTORS } from './SectorPage'
import BlogPage from './BlogPage'
import BlogArticlePage from './BlogArticlePage'
import PlatformPage from './PlatformPage'
import JobsPage from './JobsPage'

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
  return <>{resolvePage(window.location.pathname)}</>
}
