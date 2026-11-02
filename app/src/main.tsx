import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import { MotionConfig } from 'framer-motion'
import 'katex/dist/katex.min.css'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <MotionConfig reducedMotion="user">
    <HashRouter>
      <App />
    </HashRouter>
  </MotionConfig>,
)
