import { useEffect, useRef, useState } from 'react'
import type { MouseEvent } from 'react'
import { Theme, ThemeOrigin, ThemeToggle } from './theme'
import { useLang } from './i18n'
import { appPath } from './base'
import { COARSE_POINTER } from '../components/pointer'
import navChevron from '../assets/nav-chevron.svg'
import logoHeader from '../assets/logo-header.webp'
import logoHeaderDark from '../assets/logo-header-dark.webp'

export type NavKey = 'home' | 'about' | 'services' | 'platform' | 'blog' | 'jobs'

type NavItem = { href: string; ar: string; en: string; descAr: string; descEn: string; icon: 'brief' | 'users' }

const NAV_LINKS: { key: NavKey; ar: string; en: string; href: string; menu?: boolean; items?: NavItem[] }[] = [
  { key: 'home', ar: 'الرئيسية', en: 'Home', href: '/' },
  { key: 'about', ar: 'من نحن', en: 'About Us', href: '/#about', menu: true },
  { key: 'services', ar: 'الخدمات', en: 'Services', href: '/services', menu: true },
  {
    key: 'platform',
    ar: 'الحلول الرقمية',
    en: 'Digital Solutions',
    href: '/platform',
    items: [
      { href: '/platform/business', ar: 'للشركات', en: 'For companies', descAr: 'اعرض منتجك وخلّ المسوّقين يبيعونه', descEn: 'List your product and let marketers sell it', icon: 'brief' },
      { href: '/platform/affiliate', ar: 'للمسوّقين', en: 'For marketers', descAr: 'بِع وخذ عمولتك', descEn: 'Sell and earn your commission', icon: 'users' },
    ],
  },
  { key: 'blog', ar: 'المدونة', en: 'Blog', href: '/blog' },
  { key: 'jobs', ar: 'انضم لنا', en: 'Join Us', href: '/jobs' },
]

/* the main links, with each dropdown's items right after their parent */
const SHEET_LINKS = NAV_LINKS.flatMap((n) => [
  { ar: n.ar, en: n.en, href: n.href, item: undefined as NavItem | undefined },
  ...(n.items ?? []).map((item) => ({ ar: item.ar, en: item.en, href: item.href, item })),
])

function NavIcon({ name }: { name: NavItem['icon'] }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {name === 'brief'
        ? <><rect x="3" y="7.5" width="18" height="12" rx="2.5" /><path d="M9 7.5V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1.5M3 12.5h18" /></>
        : <><circle cx="9" cy="8" r="3.2" /><path d="M3 20c0-3.3 2.7-5.4 6-5.4s6 2.1 6 5.4" /><path d="M16 5.2A3.2 3.2 0 0 1 16 11M18 20c0-2.6-1-4.3-2.6-5.1" /></>}
    </svg>
  )
}

const currentPath = () => appPath(window.location.pathname).replace(/\/+$/, '') || '/'

export function Header({
  theme,
  onToggleTheme,
  active = 'home',
}: {
  theme: Theme
  onToggleTheme: (origin?: ThemeOrigin) => void
  active?: NavKey
}) {
  const { lang, L, toggleLang } = useLang()
  /* island: past the first fold the bar detaches into a floating glass
     capsule */
  const [island, setIsland] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const navRef = useRef<HTMLElement>(null)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const here = currentPath()

  /* dropdowns open on hover and keyboard focus (CSS); touch screens
     have no hover, so there the first tap opens the list instead of
     following the link, and a tap anywhere else closes it */
  const [dropdown, setDropdown] = useState<NavKey | null>(null)
  useEffect(() => {
    if (!dropdown) return
    const onDown = (e: PointerEvent) => {
      if (!(e.target as Element).closest('.nav-dd')) setDropdown(null)
    }
    document.addEventListener('pointerdown', onDown)
    return () => document.removeEventListener('pointerdown', onDown)
  }, [dropdown])
  const onDropdownClick = (key: NavKey) => (e: MouseEvent) => {
    if (COARSE_POINTER && dropdown !== key) {
      e.preventDefault()
      setDropdown(key)
    }
  }

  /* magic-ink: one highlight pill slides between nav links; it rests on
     the active link and follows the cursor */
  const [ink, setInk] = useState({ x: 0, w: 0, ready: false })

  const moveInkTo = (el: HTMLElement | null) => {
    const nav = navRef.current
    if (!nav || !el) return
    const navRect = nav.getBoundingClientRect()
    const rect = el.getBoundingClientRect()
    setInk({ x: rect.left - navRect.left, w: rect.width, ready: true })
  }
  const restInk = () => moveInkTo(navRef.current?.querySelector<HTMLElement>('a.active') ?? null)

  useEffect(() => {
    const onScroll = () => setIsland(window.scrollY > 64)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    restInk()
    const nav = navRef.current
    if (!nav) return
    const observer = new ResizeObserver(() => restInk())
    observer.observe(nav)
    return () => observer.disconnect()
  }, [])

  /* the island transition animates paddings — re-measure after it lands */
  useEffect(() => {
    const t = window.setTimeout(restInk, 420)
    return () => window.clearTimeout(t)
  }, [island])

  /* mobile sheet: scroll lock + Escape closes and returns focus */
  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuOpen(false)
        menuButtonRef.current?.focus()
      }
    }
    document.documentElement.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.documentElement.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [menuOpen])

  return (
    <header className={`site-header${island ? ' is-island' : ''}${menuOpen ? ' menu-open' : ''}`}>
      <div className="header-shell">
        <a className="brand-logo" href="/" aria-label={L('SalesUp - الرئيسية', 'SalesUp — Home')}>
          <img className="logo-on-light" src={logoHeader} alt="SalesUp" width={128} height={57} />
          <img className="logo-on-dark" src={logoHeaderDark} alt="SalesUp" width={128} height={57} />
        </a>
        <nav className="desktop-nav" aria-label={L('التنقل الرئيسي', 'Main navigation')} ref={navRef} onPointerLeave={restInk}>
          <span
            className="nav-ink"
            style={{ transform: `translateX(${ink.x}px)`, width: ink.w, opacity: ink.ready ? 1 : 0 }}
            aria-hidden="true"
          />
          {NAV_LINKS.map((n) => {
            const link = (
              <a
                key={n.key}
                href={n.href}
                className={n.key === active ? 'active' : undefined}
                onPointerEnter={(e) => moveInkTo(e.currentTarget)}
                onClick={n.items ? onDropdownClick(n.key) : undefined}
                aria-haspopup={n.items ? 'true' : undefined}
                aria-expanded={n.items ? dropdown === n.key : undefined}
              >
                {L(n.ar, n.en)}
                {n.menu || n.items ? <img className="nav-chevron" src={navChevron} alt="" /> : null}
              </a>
            )
            if (!n.items) return link
            return (
              <span className={`nav-dd${dropdown === n.key ? ' is-open' : ''}`} key={n.key}>
                {link}
                <span className="nav-dd-menu">
                  {n.items.map((item) => (
                    <a
                      key={item.href}
                      href={item.href}
                      className={`nav-dd-item${here === item.href ? ' is-current' : ''}`}
                      aria-current={here === item.href ? 'page' : undefined}
                    >
                      <NavIcon name={item.icon} />
                      <span>
                        <b>{L(item.ar, item.en)}</b>
                        <span>{L(item.descAr, item.descEn)}</span>
                      </span>
                    </a>
                  ))}
                </span>
              </span>
            )
          })}
        </nav>
        <div className="header-actions">
          <a className="header-cta" href="/#contact">
            <span>{L('احصل على استشارة مجانية', 'Get a Free Consultation')}</span>
            <svg className="cta-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M19 12H5m0 0 6-6m-6 6 6 6" />
            </svg>
          </a>
          <button
            className="language-link"
            type="button"
            lang={lang === 'ar' ? 'en' : 'ar'}
            onClick={toggleLang}
            aria-label={L('التبديل إلى الإنجليزية', 'Switch to Arabic')}
            title={L('English', 'العربية')}
          >
            {L('EN', 'ع')}
          </button>
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
          <button
            ref={menuButtonRef}
            className={`menu-toggle${menuOpen ? ' is-open' : ''}`}
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={L('القائمة', 'Menu')}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>
      <div
        className={`menu-backdrop${menuOpen ? ' is-open' : ''}`}
        onClick={() => setMenuOpen(false)}
        aria-hidden="true"
      />
      <div className={`mobile-sheet${menuOpen ? ' is-open' : ''}`} id="mobile-menu">
        <nav aria-label={L('التنقل عبر الجوال', 'Mobile navigation')}>
          {SHEET_LINKS.map((n, i) => (
            <a
              key={n.href}
              href={n.href}
              className={n.item ? `sheet-sub${here === n.href ? ' is-current' : ''}` : undefined}
              aria-current={here === n.href ? 'page' : undefined}
              style={{ transitionDelay: menuOpen ? `${70 + i * 45}ms` : '0ms' }}
              onClick={() => setMenuOpen(false)}
            >
              {n.item ? <NavIcon name={n.item.icon} /> : null}
              {L(n.ar, n.en)}
            </a>
          ))}
        </nav>
        <a
          className="sheet-cta"
          href="/#contact"
          style={{ transitionDelay: menuOpen ? `${70 + SHEET_LINKS.length * 45}ms` : '0ms' }}
          onClick={() => setMenuOpen(false)}
        >
          {L('احصل على استشارة مجانية', 'Get a Free Consultation')}
        </a>
      </div>
    </header>
  )
}
