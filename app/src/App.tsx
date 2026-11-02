import { Navigate, Routes, Route, useLocation } from 'react-router-dom'
import { lazy } from 'react'
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
const Tools = lazy(() => import('./pages/Tools.tsx'))
const GitCondaGuide = lazy(() => import('./pages/GitCondaGuide.tsx'))
import ErrorBoundary from './components/ErrorBoundary.tsx'
import LazyPage, { PageTransition } from './components/LazyPage.tsx'
import Preloader from './components/Preloader.tsx'
import StarryMusic from './components/StarryMusic.tsx'

const Notes = lazy(() => import('./pages/NotesPage.tsx'))
const Moments = lazy(() => import('./pages/Moments.tsx'))
const InternshipDecision = lazy(() => import('./pages/InternshipDecision.tsx'))
const TextSegmenter = lazy(() => import('./pages/TextSegmenter.tsx'))
const MovieRecommender = lazy(() => import('./pages/MovieRecommender.tsx'))
const DevTools = lazy(() => import('./pages/DevTools.tsx'))

function LegacyNotesRedirect() {
  const location = useLocation()
  return <Navigate replace to={{ pathname: '/notes', search: location.search }} />
}

function App() {
  const location = useLocation()

  if (location.pathname === '/starry' || location.pathname.startsWith('/starry/')) {
    return (
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
    )
  }

  return (
    <ErrorBoundary>
      <Layout>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<PageTransition><Home /></PageTransition>} />
            <Route path="/blog/*" element={<LazyPage component={Moments} />} />
            <Route path="/moments" element={<LazyPage component={Moments} />} />
            <Route path="/notes" element={<LazyPage component={Notes} />} />
            <Route path="/obsidian" element={<LegacyNotesRedirect />} />
            <Route path="/tools" element={<PageTransition><Tools /></PageTransition>} />
            <Route path="/internship" element={<LazyPage component={InternshipDecision} />} />
            <Route path="/text-segmenter" element={<LazyPage component={TextSegmenter} />} />
            <Route path="/movie-recommender" element={<LazyPage component={MovieRecommender} />} />
            <Route path="/devtools" element={<LazyPage component={DevTools} />} />
            <Route path="/git-conda-guide" element={<LazyPage component={GitCondaGuide} />} />
            <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
            <Route path="/profile" element={<PageTransition><Profile /></PageTransition>} />
            <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
          </Routes>
        </AnimatePresence>
      </Layout>
    </ErrorBoundary>
  )
}

export default App
