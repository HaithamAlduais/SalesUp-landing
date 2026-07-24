/*
 * Route-base awareness. On Vercel the app lives at the domain root and
 * all of this is inert. Served as the WordPress theme, functions.php
 * injects `window.__SALESUP_BASE__` with WordPress's home path — '/'
 * in production, '/test/' on a staging clone in a subdirectory — so
 * the SAME theme zip runs correctly in both places.
 */

declare global {
  interface Window {
    __SALESUP_BASE__?: string
  }
}

/** '' at the root; '/test' (no trailing slash) under a subdirectory */
export const ROUTE_BASE: string =
  typeof window !== 'undefined' && window.__SALESUP_BASE__
    ? window.__SALESUP_BASE__.replace(/\/+$/, '')
    : ''

/** strip the install base from a pathname before route matching */
export function appPath(pathname: string): string {
  if (ROUTE_BASE && (pathname === ROUTE_BASE || pathname.startsWith(ROUTE_BASE + '/'))) {
    return pathname.slice(ROUTE_BASE.length) || '/'
  }
  return pathname
}

/*
 * The app navigates with plain root-absolute <a href="/..."> links and
 * full page loads. Under a subdirectory install those would escape to
 * the domain root (on staging: the LIVE site), so rewrite them at
 * click time. Does nothing when ROUTE_BASE is ''.
 */
export function installLinkInterceptor() {
  if (!ROUTE_BASE || typeof document === 'undefined') return
  document.addEventListener(
    'click',
    (e) => {
      const anchor = (e.target as Element | null)?.closest?.('a')
      if (!anchor) return
      const href = anchor.getAttribute('href')
      if (!href || href[0] !== '/' || href.startsWith('//')) return
      if (href === ROUTE_BASE || href.startsWith(ROUTE_BASE + '/')) return
      anchor.setAttribute('href', ROUTE_BASE + href)
      /* no preventDefault: the browser follows the corrected href */
    },
    true
  )
}
