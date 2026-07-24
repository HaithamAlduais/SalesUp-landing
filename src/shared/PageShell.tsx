import { ReactNode } from 'react'
import { ThemeProvider, useTheme } from './theme'
import { LangProvider, useLang } from './i18n'
import { Header, NavKey } from './Header'
import { Footer } from './Footer'

/* The theme's own floating WhatsApp button was removed at the client's
   request — the site keeps the old GetButton widget (injected outside
   the theme) as the single chat bubble. Restore from git history if
   they ever want the designed one back. */

function Shell({ active, children }: { active?: NavKey; children: ReactNode }) {
  const [theme, toggleTheme] = useTheme()
  const { L } = useLang()
  return (
    <ThemeProvider value={theme}>
      <div className="page">
        <a className="skip-link" href="#main-content">{L('تجاوز إلى المحتوى', 'Skip to content')}</a>
        <Header theme={theme} onToggleTheme={toggleTheme} active={active} />
        <main id="main-content">{children}</main>
        <Footer />
      </div>
    </ThemeProvider>
  )
}

/*
 * Shared shell for every screen: language (AR RTL / EN LTR), theme
 * system (with circular-reveal toggle), the floating-island header
 * (per-page active link), the design footer, skip link, and the page
 * scaffold. Page bodies read theme via usePageTheme() and language via
 * useLang().L(ar, en).
 */
export function PageShell({ active, children }: { active?: NavKey; children: ReactNode }) {
  return (
    <LangProvider>
      <Shell active={active}>{children}</Shell>
    </LangProvider>
  )
}
