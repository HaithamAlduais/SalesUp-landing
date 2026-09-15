import { createContext, useContext, type ReactNode } from 'react'

export type ProductLocale = 'ar' | 'en'

// Portable replacement for the product's app/auth provider. Only locale crosses.
const ProductLocaleContext = createContext<ProductLocale>('ar')

export function ProductUiProvider({ locale, children }: { locale: ProductLocale; children: ReactNode }) {
  return <ProductLocaleContext.Provider value={locale}>{children}</ProductLocaleContext.Provider>
}

export function useUiPrefs() {
  return { locale: useContext(ProductLocaleContext) }
}

export function p(locale: ProductLocale, en: string, ar: string) {
  return locale === 'ar' ? ar : en
}
