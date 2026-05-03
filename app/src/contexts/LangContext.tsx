import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { t, type Lang } from '@/i18n/translations'

interface LangContextType {
  lang: Lang
  setLang: (lang: Lang) => void
  toggleLang: () => void
  t: (key: string) => string
}

const LangContext = createContext<LangContextType | null>(null)

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = localStorage.getItem('vibecoding_lang') as Lang | null
    return saved === 'zh' || saved === 'en' ? saved : 'zh'
  })

  const setLang = (l: Lang) => {
    setLangState(l)
    localStorage.setItem('vibecoding_lang', l)
  }

  const toggleLang = () => {
    const next = lang === 'zh' ? 'en' : 'zh'
    setLang(next)
  }

  const translate = (key: string) => t(key, lang)

  return (
    <LangContext.Provider value={{ lang, setLang, toggleLang, t: translate }}>
      {children}
    </LangContext.Provider>
  )
}

export function useLang() {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error('useLang must be used within LangProvider')
  return ctx
}
