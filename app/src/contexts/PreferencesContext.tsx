import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { t, type Lang } from '@/i18n/translations'

type Theme = 'light' | 'dark'

interface PreferencesContextType {
  // Theme
  theme: Theme
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
  // Language
  lang: Lang
  setLang: (lang: Lang) => void
  toggleLang: () => void
  t: (key: string) => string
}

const PreferencesContext = createContext<PreferencesContextType | null>(null)

const STORAGE_KEY = 'vibecoding_preferences'

interface StoredPreferences {
  theme: Theme
  lang: Lang
}

function loadPreferences(): StoredPreferences {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved) as Partial<StoredPreferences>
      return {
        theme: parsed.theme === 'light' || parsed.theme === 'dark' ? parsed.theme : getSystemTheme(),
        lang: parsed.lang === 'zh' || parsed.lang === 'en' ? parsed.lang : 'zh',
      }
    }
  } catch {
    // Migrate from old format
    const oldTheme = localStorage.getItem('vibecoding_theme') as Theme | null
    const oldLang = localStorage.getItem('vibecoding_lang') as Lang | null

    if (oldTheme || oldLang) {
      const migrated: StoredPreferences = {
        theme: oldTheme === 'light' || oldTheme === 'dark' ? oldTheme : getSystemTheme(),
        lang: oldLang === 'zh' || oldLang === 'en' ? oldLang : 'zh',
      }

      // Clean up old keys
      localStorage.removeItem('vibecoding_theme')
      localStorage.removeItem('vibecoding_lang')

      savePreferences(migrated)
      return migrated
    }
  }

  return {
    theme: getSystemTheme(),
    lang: 'zh',
  }
}

function savePreferences(prefs: StoredPreferences) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs))
}

function getSystemTheme(): Theme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<StoredPreferences>(loadPreferences)

  // Apply theme to DOM
  useEffect(() => {
    const root = window.document.documentElement
    if (preferences.theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [preferences.theme])

  // Save to localStorage whenever preferences change
  useEffect(() => {
    savePreferences(preferences)
  }, [preferences])

  // Listen to system theme changes
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e: MediaQueryListEvent) => {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (!saved) {
        setPreferences(prev => ({ ...prev, theme: e.matches ? 'dark' : 'light' }))
      }
    }
    media.addEventListener('change', handleChange)
    return () => media.removeEventListener('change', handleChange)
  }, [])

  const toggleTheme = () => {
    setPreferences(prev => ({ ...prev, theme: prev.theme === 'light' ? 'dark' : 'light' }))
  }

  const setTheme = (theme: Theme) => {
    setPreferences(prev => ({ ...prev, theme }))
  }

  const toggleLang = () => {
    setPreferences(prev => ({ ...prev, lang: prev.lang === 'zh' ? 'en' : 'zh' }))
  }

  const setLang = (lang: Lang) => {
    setPreferences(prev => ({ ...prev, lang }))
  }

  const translate = (key: string) => t(key, preferences.lang)

  return (
    <PreferencesContext.Provider
      value={{
        theme: preferences.theme,
        toggleTheme,
        setTheme,
        lang: preferences.lang,
        setLang,
        toggleLang,
        t: translate,
      }}
    >
      {children}
    </PreferencesContext.Provider>
  )
}

export function usePreferences() {
  const ctx = useContext(PreferencesContext)
  if (!ctx) throw new Error('usePreferences must be used within PreferencesProvider')
  return ctx
}

// Backward compatibility hooks
export function useTheme() {
  const { theme, toggleTheme, setTheme } = usePreferences()
  return { theme, toggleTheme, setTheme }
}

export function useLang() {
  const { lang, setLang, toggleLang, t } = usePreferences()
  return { lang, setLang, toggleLang, t }
}
