import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { ThemeProvider, ThemeToggle, useTheme } from './theme'
import { LangProvider, useLang } from './i18n'
import { Footer } from './Footer'
import logoHeader from '../assets/logo-header.webp'
import logoHeaderDark from '../assets/logo-header-dark.webp'

type Cta = { href: string; ar: string; en: string }

/*
 * Shell for pages that stand apart from the site (the students page):
 * the same theme and language system and the same floating header
 * material, but no site navigation, an unlinked logo, the page's own
 * CTA, and the slim footer.
 */
function Shell({ cta, children }: { cta: Cta; children: ReactNode }) {
  const [theme, toggleTheme] = useTheme()
  const { lang, L, toggleLang } = useLang()
  const [island, setIsland] = useState(false)

  useEffect(() => {
    const onScroll = () => setIsland(window.scrollY > 64)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <ThemeProvider value={theme}>
      <div className="page">
        <a className="skip-link" href="#main-content">{L('تجاوز إلى المحتوى', 'Skip to content')}</a>
        <header className={`site-header site-header--standalone${island ? ' is-island' : ''}`}>
          <div className="header-shell">
            <span className="brand-logo" role="img" aria-label="SalesUp">
              <img className="logo-on-light" src={logoHeader} alt="" width={128} height={57} />
              <img className="logo-on-dark" src={logoHeaderDark} alt="" width={128} height={57} />
            </span>
            <div className="header-actions">
              <a className="header-cta" href={cta.href}>
                <span>{L(cta.ar, cta.en)}</span>
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
              <ThemeToggle theme={theme} onToggle={toggleTheme} />
            </div>
          </div>
        </header>
        <main id="main-content">{children}</main>
        <Footer minimal />
      </div>
    </ThemeProvider>
  )
}

export function StandaloneShell({ cta, children }: { cta: Cta; children: ReactNode }) {
  return (
    <LangProvider>
      <Shell cta={cta}>{children}</Shell>
    </LangProvider>
  )
}
