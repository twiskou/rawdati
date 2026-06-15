'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import fr from './messages/fr'
import ar from './messages/ar'
import type { Messages } from './messages/fr'

type Locale = 'fr' | 'ar'

const messages: Record<Locale, Messages> = { fr, ar }

interface LanguageContextValue {
  locale: Locale
  setLocale: (l: Locale) => void
  t: Messages
  isRTL: boolean
}

const LanguageContext = createContext<LanguageContextValue>({
  locale: 'fr',
  setLocale: () => {},
  t: fr,
  isRTL: false,
})

export function LanguageProvider({ children, initialLocale = 'fr' }: { children: ReactNode, initialLocale?: Locale }) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale)

  // Apply lang + dir on <html> whenever locale changes
  useEffect(() => {
    document.documentElement.lang = locale
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr'
  }, [locale])

  function setLocale(l: Locale) {
    setLocaleState(l)
    localStorage.setItem('allo-mama-locale', l)
    document.cookie = `allo-mama-locale=${l}; path=/; max-age=31536000`
  }

  return (
    <LanguageContext.Provider
      value={{
        locale,
        setLocale,
        t: messages[locale],
        isRTL: locale === 'ar',
      }}
    >
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}

/** Shorthand: returns only the translation object */
export function useT() {
  return useContext(LanguageContext).t
}
