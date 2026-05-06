import { type ReactNode, useState, useEffect, useRef, useCallback } from 'react'
import { HelmetProvider } from 'react-helmet-async'
import Navbar from './Navbar.tsx'
import Footer from './Footer.tsx'
import { AuthProvider } from '@/contexts/AuthContext'
import { LangProvider } from '@/contexts/LangContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import Lenis from 'lenis'
import { ArrowUp } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface LayoutProps {
  children: ReactNode
}

function BackToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 400)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2 }}
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-40 w-10 h-10 rounded-full bg-Ink/80 dark:bg-white/20 backdrop-blur-sm border border-Sand dark:border-white/15 text-Parchment dark:text-white flex items-center justify-center shadow-lg hover:bg-Ink dark:hover:bg-white/30 hover:-translate-y-0.5 transition-all duration-200"
          aria-label="返回顶部"
        >
          <ArrowUp size={18} />
        </motion.button>
      )}
    </AnimatePresence>
  )
}

export default function Layout({ children }: LayoutProps) {
  const lenisRef = useRef<Lenis | null>(null)

  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.08,
    })
    lenisRef.current = lenis

    function raf(time: number) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)

    return () => {
      lenis.destroy()
      lenisRef.current = null
    }
  }, [])

  return (
    <HelmetProvider>
    <ThemeProvider>
      <LangProvider>
        <AuthProvider>
          <div className="relative">
            <Navbar />
            <main className="pt-16">{children}</main>
            <Footer />
            <BackToTop />
          </div>
        </AuthProvider>
      </LangProvider>
    </ThemeProvider>
    </HelmetProvider>
  )
}
