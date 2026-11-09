import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { MotionConfig } from 'framer-motion'
import { PreferencesProvider } from '@/contexts/PreferencesContext'
import LegacyToolsApp from './LegacyToolsApp'
import './index.css'

createRoot(document.getElementById('legacy-tools-root')!).render(
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
