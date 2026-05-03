import type { ReactNode } from 'react'
import { useEffect, useRef } from 'react'
import Navbar from './Navbar.tsx'
import Footer from './Footer.tsx'
import { AuthProvider } from '@/contexts/AuthContext'
import { LangProvider } from '@/contexts/LangContext'
import Lenis from 'lenis'

interface LayoutProps {
  children: ReactNode
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
    <LangProvider>
      <AuthProvider>
        <div className="relative">
          <Navbar />
          <main>{children}</main>
          <Footer />
        </div>
      </AuthProvider>
    </LangProvider>
  )
}
