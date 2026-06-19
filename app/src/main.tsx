import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import 'katex/dist/katex.min.css'
import './index.css'
import Preloader from './components/Preloader.tsx'

createRoot(document.getElementById('root')!).render(
  <HashRouter>
    <Preloader />
  </HashRouter>,
)
