import { createContext, ReactNode, useContext, useEffect, useState } from 'react'

export type Lang = 'ar' | 'en'

type LangValue = {
  lang: Lang
  /** pick the current language's variant: L(arabic, english) */
  L: <T>(ar: T, en: T) => T
  toggleLang: () => void
}

const LangCtx = createContext<LangValue>({
  lang: 'ar',
  L: (ar) => ar,
  toggleLang: () => {},
})

export function useLang(): LangValue {
  return useContext(LangCtx)
}

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => {
    const saved = localStorage.getItem('salesup-lang')
    return saved === 'en' ? 'en' : 'ar'
  })

  useEffect(() => {
    document.documentElement.lang = lang
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
    localStorage.setItem('salesup-lang', lang)
  }, [lang])

  const L = <T,>(ar: T, en: T): T => (lang === 'ar' ? ar : en)
  const toggleLang = () => setLang((l) => (l === 'ar' ? 'en' : 'ar'))

  return <LangCtx.Provider value={{ lang, L, toggleLang }}>{children}</LangCtx.Provider>
}
