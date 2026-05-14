import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { t, type Lang } from '@/i18n/translations'
import { createStorageKey } from '@/utils/storage'

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

interface StoredPreferences {
  theme: Theme
  lang: Lang
}

const prefStorage = createStorageKey<StoredPreferences>('vibecoding_preferences', {
  theme: getSystemTheme(),
  lang: 'zh',
})

function loadPreferences(): StoredPreferences {
  const data = prefStorage.load()
  // Validate values
  const theme: Theme = data.theme === 'light' || data.theme === 'dark' ? data.theme : getSystemTheme()
  const lang: Lang = data.lang === 'zh' || data.lang === 'en' ? data.lang : 'zh'

  // Migrate from old format
  if (theme === getSystemTheme() && lang === 'zh') {
    const oldTheme = localStorage.getItem('vibecoding_theme') as Theme | null
    const oldLang = localStorage.getItem('vibecoding_lang') as Lang | null
    if (oldTheme || oldLang) {
      const migrated: StoredPreferences = {
        theme: oldTheme === 'light' || oldTheme === 'dark' ? oldTheme : getSystemTheme(),
        lang: oldLang === 'zh' || oldLang === 'en' ? oldLang : 'zh',
      }
      localStorage.removeItem('vibecoding_theme')
      localStorage.removeItem('vibecoding_lang')
      prefStorage.save(migrated)
      return migrated
    }
  }

  return { theme, lang }
}

function savePreferences(prefs: StoredPreferences) {
  prefStorage.save(prefs)
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
      const saved = prefStorage.load()
      if (saved.theme === getSystemTheme() && saved.lang === 'zh') {
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
