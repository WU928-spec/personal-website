import { Routes, Route, useLocation } from 'react-router-dom'
import { lazy, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import Layout from './components/Layout.tsx'
import Home from './pages/Home.tsx'
const Login = lazy(() => import('./pages/Login.tsx'))
const Profile = lazy(() => import('./pages/Profile.tsx'))
const NotFound = lazy(() => import('./pages/NotFound.tsx'))
const StarryEasterEgg = lazy(() => import('./pages/StarryEasterEgg.tsx'))
const StarryEpilogue = lazy(() => import('./pages/StarryEpilogue.tsx'))
const StarryMemoir = lazy(() => import('./pages/StarryMemoir.tsx'))
const StarrySecret = lazy(() => import('./pages/StarrySecret.tsx'))
const EasterEggs = lazy(() => import('./pages/EasterEggs.tsx'))
const Tools = lazy(() => import('./pages/Tools.tsx'))
import ErrorBoundary from './components/ErrorBoundary.tsx'
import LazyPage, { PageTransition } from './components/LazyPage.tsx'
import Preloader from './components/Preloader.tsx'
import StarryMusic from './components/StarryMusic.tsx'
import { seedDemoDataIfEmpty } from './utils/projectSeed.ts'

const Calendar = lazy(() => import('./pages/Calendar.tsx'))
const Projects = lazy(() => import('./pages/Projects.tsx'))
const ObsidianBrowser = lazy(() => import('./pages/ObsidianBrowser.tsx'))
const Moments = lazy(() => import('./pages/Moments.tsx'))
const InternshipDecision = lazy(() => import('./pages/InternshipDecision.tsx'))
const TextSegmenter = lazy(() => import('./pages/TextSegmenter.tsx'))
const MovieRecommender = lazy(() => import('./pages/MovieRecommender.tsx'))

function App() {
  const location = useLocation()

  useEffect(() => {
    seedDemoDataIfEmpty()
  }, [])

  if (location.pathname === '/starry' || location.pathname.startsWith('/starry/')) {
    return (
      <>
        <ErrorBoundary>
          <Preloader>
            <StarryMusic />
            <Routes location={location} key={location.pathname}>
              <Route path="/starry" element={<StarryEasterEgg />} />
              <Route path="/starry/secret" element={<StarrySecret />} />
              <Route path="/starry/epilogue" element={<StarryEpilogue />} />
              <Route path="/starry/:id" element={<StarryMemoir />} />
            </Routes>
          </Preloader>
        </ErrorBoundary>
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
              <Route path="/tools" element={<PageTransition><Tools /></PageTransition>} />
              <Route path="/internship" element={<LazyPage component={InternshipDecision} />} />
              <Route path="/text-segmenter" element={<LazyPage component={TextSegmenter} />} />
              <Route path="/movie-recommender" element={<LazyPage component={MovieRecommender} />} />
              <Route path="/easter-eggs" element={<PageTransition><EasterEggs /></PageTransition>} />
              <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
              <Route path="/profile" element={<PageTransition><Profile /></PageTransition>} />
              <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
            </Routes>
          </AnimatePresence>
        </Layout>
      </ErrorBoundary>
    </>
  )
}

export default App
