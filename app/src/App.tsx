import { Routes, Route } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import Layout from './components/Layout.tsx'
import Home from './pages/Home.tsx'
import Login from './pages/Login.tsx'
import Profile from './pages/Profile.tsx'
import NewPost from './pages/NewPost.tsx'

const Blog = lazy(() => import('./pages/Blog.tsx'))
const BlogPost = lazy(() => import('./pages/BlogPost.tsx'))
const Projects = lazy(() => import('./pages/Projects.tsx'))
const About = lazy(() => import('./pages/About.tsx'))

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/blog"
          element={
            <Suspense fallback={<div className="min-h-[60dvh] flex items-center justify-center text-Slate font-body">Loading...</div>}>
              <Blog />
            </Suspense>
          }
        />
        <Route
          path="/blog/:slug"
          element={
            <Suspense fallback={<div className="min-h-[60dvh] flex items-center justify-center text-Slate font-body">Loading...</div>}>
              <BlogPost />
            </Suspense>
          }
        />
        <Route
          path="/projects"
          element={
            <Suspense fallback={<div className="min-h-[60dvh] flex items-center justify-center text-Slate font-body">Loading...</div>}>
              <Projects />
            </Suspense>
          }
        />
        <Route
          path="/about"
          element={
            <Suspense fallback={<div className="min-h-[60dvh] flex items-center justify-center text-Slate font-body">Loading...</div>}>
              <About />
            </Suspense>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/blog/new" element={<NewPost />} />
      </Routes>
    </Layout>
  )
}

export default App
