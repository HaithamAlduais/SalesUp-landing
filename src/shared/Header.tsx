import { useEffect, useRef, useState } from 'react'
import { Theme, ThemeOrigin, ThemeToggle } from './theme'
import { useLang } from './i18n'
import navChevron from '../assets/nav-chevron.svg'
import logoHeader from '../assets/logo-header.png'
import logoHeaderDark from '../assets/logo-header-dark.png'

export type NavKey = 'home' | 'about' | 'services' | 'platform' | 'blog' | 'jobs'

const NAV_LINKS: { key: NavKey; ar: string; en: string; href: string; menu?: boolean }[] = [
  { key: 'home', ar: 'الرئيسية', en: 'Home', href: '/' },
  { key: 'about', ar: 'من نحن', en: 'About Us', href: '/#about', menu: true },
  { key: 'services', ar: 'الخدمات', en: 'Services', href: '/services', menu: true },
  { key: 'platform', ar: 'الحلول الرقمية', en: 'Digital Solutions', href: '/platform' },
  { key: 'blog', ar: 'المدونة', en: 'Blog', href: '/blog' },
  { key: 'jobs', ar: 'الوظائف', en: 'Careers', href: '/jobs' },
]

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
          {NAV_LINKS.map((n) => (
            <a
              key={n.key}
              href={n.href}
              className={n.key === active ? 'active' : undefined}
              onPointerEnter={(e) => moveInkTo(e.currentTarget)}
            >
              {L(n.ar, n.en)}
              {n.menu ? <img className="nav-chevron" src={navChevron} alt="" /> : null}
            </a>
          ))}
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
          {NAV_LINKS.map((n, i) => (
            <a
              key={n.key}
              href={n.href}
              style={{ transitionDelay: menuOpen ? `${70 + i * 45}ms` : '0ms' }}
              onClick={() => setMenuOpen(false)}
            >
              {L(n.ar, n.en)}
            </a>
          ))}
        </nav>
        <a
          className="sheet-cta"
          href="/#contact"
          style={{ transitionDelay: menuOpen ? `${70 + NAV_LINKS.length * 45}ms` : '0ms' }}
          onClick={() => setMenuOpen(false)}
        >
          {L('احصل على استشارة مجانية', 'Get a Free Consultation')}
        </a>
      </div>
    </header>
  )
}
