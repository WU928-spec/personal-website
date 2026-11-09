import { createRoot, type Root } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { MotionConfig } from 'framer-motion'
import { PreferencesProvider } from '@/contexts/PreferencesContext'
import LegacyToolsApp from './LegacyToolsApp'
import './index.css'

let root: Root | null = null

declare global {
  interface Window {
    legacyToolsMount: () => void
    legacyToolsUnmount: () => void
  }
}

window.legacyToolsMount = () => {
  const container = document.getElementById('legacy-tools-root')
  if (!container) return
  root?.unmount()
  root = createRoot(container)
  root.render(
    <HelmetProvider>
      <MotionConfig reducedMotion="user">
        <PreferencesProvider>
          <BrowserRouter>
            <LegacyToolsApp />
          </BrowserRouter>
        </PreferencesProvider>
      </MotionConfig>
    </HelmetProvider>,
  )
}

window.legacyToolsUnmount = () => {
  root?.unmount()
  root = null
}

window.legacyToolsMount()
