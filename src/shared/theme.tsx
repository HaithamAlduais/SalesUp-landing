import { createContext, useContext, useEffect, useState } from 'react'
import { flushSync } from 'react-dom'

export type Theme = 'light' | 'dark'
export type ThemeOrigin = { x: number; y: number }

export function useTheme(): [Theme, (origin?: ThemeOrigin) => void] {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('salesup-theme')
    if (saved === 'light' || saved === 'dark') return saved
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('salesup-theme', theme)
  }, [theme])

  /* theme switch as a circular reveal from the click point (View
     Transitions API); plain toggle where unsupported or reduced-motion */
  const toggle = (origin?: ThemeOrigin) => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    const doc = document as Document & {
      startViewTransition?: (cb: () => void) => { ready: Promise<void> }
    }
    if (
      !doc.startViewTransition ||
      !origin ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      setTheme(next)
      return
    }
    const vt = doc.startViewTransition(() => {
      document.documentElement.dataset.theme = next
      flushSync(() => setTheme(next))
    })
    vt.ready
      .then(() => {
        const r = Math.hypot(
          Math.max(origin.x, window.innerWidth - origin.x),
          Math.max(origin.y, window.innerHeight - origin.y)
        )
        document.documentElement.animate(
          {
            clipPath: [
              `circle(0px at ${origin.x}px ${origin.y}px)`,
              `circle(${r}px at ${origin.x}px ${origin.y}px)`,
            ],
          },
          { duration: 480, easing: 'ease-in-out', pseudoElement: '::view-transition-new(root)' }
        )
      })
      .catch(() => {})
  }
  return [theme, toggle]
}

export function ThemeToggle({ theme, onToggle }: { theme: Theme; onToggle: (origin?: ThemeOrigin) => void }) {
  const en = document.documentElement.lang === 'en'
  const label = theme === 'dark' ? (en ? 'Light mode' : 'الوضع الفاتح') : (en ? 'Dark mode' : 'الوضع الداكن')
  return (
    <button
      className="theme-toggle"
      type="button"
      onClick={(e) => onToggle(e.detail === 0 ? undefined : { x: e.clientX, y: e.clientY })}
      aria-label={label}
      title={label}
    >
      <svg className="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
        <circle cx="12" cy="12" r="4.4" />
        <path d="M12 2.8v2.4M12 18.8v2.4M2.8 12h2.4M18.8 12h2.4M5.1 5.1l1.7 1.7M17.2 17.2l1.7 1.7M18.9 5.1l-1.7 1.7M6.8 17.2l-1.7 1.7" />
      </svg>
      <svg className="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20.2 14.2A8.2 8.2 0 0 1 9.8 3.8a8.2 8.2 0 1 0 10.4 10.4Z" />
      </svg>
    </button>
  )
}

/* page theme for components that tune WebGL scenes per mode */
const ThemeCtx = createContext<Theme>('light')
export const ThemeProvider = ThemeCtx.Provider

export function usePageTheme(): { theme: Theme; dark: boolean } {
  const theme = useContext(ThemeCtx)
  return { theme, dark: theme === 'dark' }
}
