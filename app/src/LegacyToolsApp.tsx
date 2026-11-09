import { useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Tools from '@/pages/Tools'
import InternshipDecision from '@/pages/InternshipDecision'
import TextSegmenter from '@/pages/TextSegmenter'
import MovieRecommender from '@/pages/MovieRecommender'
import DevTools from '@/pages/DevTools'
import GitCondaGuide from '@/pages/GitCondaGuide'
import { usePreferences } from '@/contexts/PreferencesContext'

function StaticThemeSync() {
  const { theme, setTheme } = usePreferences()

  useEffect(() => {
    const root = document.documentElement
    const sync = () => {
      const nextTheme = root.dataset.theme === 'dark' ? 'dark' : 'light'
      if (nextTheme !== theme) setTheme(nextTheme)
    }
    sync()
    const observer = new MutationObserver(sync)
    observer.observe(root, { attributes: true, attributeFilter: ['data-theme'] })
    return () => observer.disconnect()
  }, [theme, setTheme])

  return null
}

export default function LegacyToolsApp() {
  return (
    <>
      <StaticThemeSync />
      <Routes>
        <Route path="/tools" element={<Tools />} />
        <Route path="/tools/internship" element={<InternshipDecision />} />
        <Route path="/tools/text-segmenter" element={<TextSegmenter />} />
        <Route path="/tools/movie-recommender" element={<MovieRecommender />} />
        <Route path="/tools/devtools" element={<DevTools />} />
        <Route path="/tools/git-conda-guide" element={<GitCondaGuide />} />
        <Route path="*" element={<Navigate to="/tools" replace />} />
      </Routes>
    </>
  )
}
