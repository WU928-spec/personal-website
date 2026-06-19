import { Routes, Route, useLocation } from 'react-router-dom'
import { lazy, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import Layout from './components/Layout.tsx'
import Home from './pages/Home.tsx'
import Login from './pages/Login.tsx'
import Profile from './pages/Profile.tsx'
import NotFound from './pages/NotFound.tsx'
import StarryEasterEgg from './pages/StarryEasterEgg.tsx'
import StarryMemoir from './pages/StarryMemoir.tsx'
import StarrySecret from './pages/StarrySecret.tsx'
import ErrorBoundary from './components/ErrorBoundary.tsx'
import MusicPlayer from './components/MusicPlayer.tsx'
import LazyPage, { PageTransition } from './components/LazyPage.tsx'
import { seedDemoDataIfEmpty } from './utils/projectSeed.ts'

const Calendar = lazy(() => import('./pages/Calendar.tsx'))
const Projects = lazy(() => import('./pages/Projects.tsx'))
const ObsidianBrowser = lazy(() => import('./pages/ObsidianBrowser.tsx'))
const Moments = lazy(() => import('./pages/Moments.tsx'))

function App() {
  const location = useLocation()

  useEffect(() => {
    seedDemoDataIfEmpty()
  }, [])

  if (location.pathname === '/starry' || location.pathname.startsWith('/starry/')) {
    return (
      <>
        <ErrorBoundary>
          <Routes location={location} key={location.pathname}>
            <Route path="/starry" element={<StarryEasterEgg />} />
            <Route path="/starry/secret" element={<StarrySecret />} />
            <Route path="/starry/:id" element={<StarryMemoir />} />
          </Routes>
        </ErrorBoundary>
        <MusicPlayer />
      </>
    )
  }

  return (
    <>
      <ErrorBoundary>
        <Layout>
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<PageTransition><Home /></PageTransition>} />
              <Route path="/blog/*" element={<LazyPage component={Moments} />} />
              <Route path="/moments" element={<LazyPage component={Moments} />} />
              <Route path="/calendar" element={<LazyPage component={Calendar} />} />
              <Route path="/projects" element={<LazyPage component={Projects} />} />
              <Route path="/obsidian" element={<LazyPage component={ObsidianBrowser} />} />
              <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
              <Route path="/profile" element={<PageTransition><Profile /></PageTransition>} />
              <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
            </Routes>
          </AnimatePresence>
        </Layout>
      </ErrorBoundary>
      <MusicPlayer />
    </>
  )
}

export default App
