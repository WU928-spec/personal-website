import { Routes, Route, useLocation } from 'react-router-dom'
import { Suspense, lazy, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Layout from './components/Layout.tsx'
import Home from './pages/Home.tsx'
import Login from './pages/Login.tsx'
import Profile from './pages/Profile.tsx'
import NotFound from './pages/NotFound.tsx'
import StarryEasterEgg from './pages/StarryEasterEgg.tsx'
import StarryMemoir from './pages/StarryMemoir.tsx'
import ErrorBoundary from './components/ErrorBoundary.tsx'
import MusicPlayer from './components/MusicPlayer.tsx'
import { seedDemoDataIfEmpty } from './utils/projectSeed.ts'

const Calendar = lazy(() => import('./pages/Calendar.tsx'))
const Projects = lazy(() => import('./pages/Projects.tsx'))
const ObsidianBrowser = lazy(() => import('./pages/ObsidianBrowser.tsx'))
const Moments = lazy(() => import('./pages/Moments.tsx'))

function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
    >
      {children}
    </motion.div>
  )
}

const fallback = (
  <div className="min-h-[60dvh] flex items-center justify-center">
    <div className="w-6 h-6 border-2 border-Amber border-t-transparent rounded-full animate-spin" />
  </div>
)

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
              <Route
                path="/blog"
                element={
                  <Suspense fallback={fallback}>
                    <PageTransition><Moments /></PageTransition>
                  </Suspense>
                }
              />
              <Route
                path="/blog/:slug"
                element={
                  <Suspense fallback={fallback}>
                    <PageTransition><Moments /></PageTransition>
                  </Suspense>
                }
              />
              <Route
                path="/calendar"
                element={
                  <Suspense fallback={fallback}>
                    <PageTransition><Calendar /></PageTransition>
                  </Suspense>
                }
              />
              <Route
                path="/projects"
                element={
                  <Suspense fallback={fallback}>
                    <PageTransition><Projects /></PageTransition>
                  </Suspense>
                }
              />
              <Route
                path="/obsidian"
                element={
                  <Suspense fallback={fallback}>
                    <PageTransition><ObsidianBrowser /></PageTransition>
                  </Suspense>
                }
              />
              <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
              <Route path="/profile" element={<PageTransition><Profile /></PageTransition>} />
              <Route path="/blog/new" element={<PageTransition><Moments /></PageTransition>} />
              <Route
                path="/moments"
                element={
                  <Suspense fallback={fallback}>
                    <PageTransition><Moments /></PageTransition>
                  </Suspense>
                }
              />
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
