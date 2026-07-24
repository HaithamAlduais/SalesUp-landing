/*
 * Route-base awareness. On Vercel the app lives at the domain root and
 * all of this is inert. Served as the WordPress theme, the app may run
 * in a subdirectory (a staging clone at /test); routes and links must
 * stay inside it.
 *
 * The base is derived from the bundle's own URL — it is served from
 * <base>/wp-content/themes/salesup/assets/..., so whatever precedes
 * /wp-content/ IS the install base. Self-contained and immune to
 * script-injection order; the window.__SALESUP_BASE__ global printed
 * by functions.php remains as a fallback only.
 */

declare global {
  interface Window {
    __SALESUP_BASE__?: string
  }
}

function detectBase(): string {
  if (typeof window === 'undefined') return ''
  try {
    const modulePath = new URL(import.meta.url).pathname
    const wp = modulePath.indexOf('/wp-content/')
    if (wp >= 0) return modulePath.slice(0, wp).replace(/\/+$/, '')
  } catch {
    /* fall through to the injected global */
  }
  return window.__SALESUP_BASE__ ? window.__SALESUP_BASE__.replace(/\/+$/, '') : ''
}

/** '' at the root; '/test' (no trailing slash) under a subdirectory */
export const ROUTE_BASE: string = detectBase()

/** strip the install base from a pathname before route matching */
export function appPath(pathname: string): string {
  if (ROUTE_BASE && (pathname === ROUTE_BASE || pathname.startsWith(ROUTE_BASE + '/'))) {
    return pathname.slice(ROUTE_BASE.length) || '/'
  }
  return pathname
}

/** prefix a root-absolute path with the install base (for programmatic
    navigation / history updates) */
export function withBase(path: string): string {
  if (!ROUTE_BASE || path[0] !== '/' || path.startsWith('//')) return path
  if (path === ROUTE_BASE || path.startsWith(ROUTE_BASE + '/')) return path
  return ROUTE_BASE + path
}

function fixAnchor(a: Element) {
  const href = a.getAttribute('href')
  if (!href || href[0] !== '/' || href.startsWith('//')) return
  if (href === ROUTE_BASE || href.startsWith(ROUTE_BASE + '/')) return
  a.setAttribute('href', ROUTE_BASE + href)
}

/*
 * Keep every root-absolute link inside the install base. Three layers,
 * because a staging escape lands users on the LIVE site: an initial
 * sweep, a MutationObserver that re-fixes anchors as React renders
 * them, and a capture-phase click guard as the last line. All inert
 * when ROUTE_BASE is ''.
 */
export function installLinkInterceptor() {
  if (!ROUTE_BASE || typeof document === 'undefined') return

  const sweep = () => document.querySelectorAll('a[href^="/"]').forEach(fixAnchor)
  const observer = new MutationObserver(sweep)
  const start = () => {
    observer.observe(document.documentElement, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['href'],
    })
    sweep()
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start)
  } else {
    start()
  }

  document.addEventListener(
    'click',
    (e) => {
      const anchor = (e.target as Element | null)?.closest?.('a')
      if (anchor) fixAnchor(anchor)
    },
    true
  )
}
