import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Github, Search, Menu, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const navLinks = [
  { path: '/', label: 'Home' },
  { path: '/blog', label: 'Blog' },
  { path: '/projects', label: 'Projects' },
  { path: '/about', label: 'About' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-Parchment/85 backdrop-blur-md border-b border-Sand'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 md:px-12 flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img src="/logo.svg" alt="Logo" className="h-8 w-auto" />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`relative font-ui text-[0.875rem] font-medium uppercase tracking-[0.06em] transition-colors duration-300 group ${
                  location.pathname === link.path
                    ? 'text-Amber'
                    : 'text-Ink hover:text-Amber'
                }`}
              >
                {link.label}
                <span
                  className={`absolute left-0 -bottom-1 h-[2px] bg-Amber transition-transform duration-300 origin-center ${
                    location.pathname === link.path
                      ? 'w-full scale-x-100'
                      : 'w-full scale-x-0 group-hover:scale-x-100'
                  }`}
                />
              </Link>
            ))}
          </div>

          {/* Right side icons */}
          <div className="hidden md:flex items-center gap-4">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-Ink hover:text-Amber transition-colors duration-300"
              aria-label="GitHub"
            >
              <Github size={20} />
            </a>
            <button
              className="text-Ink hover:text-Amber transition-colors duration-300"
              aria-label="Search"
            >
              <Search size={20} />
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden text-Ink p-1"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile slide-in menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }}
            className="fixed top-0 right-0 bottom-0 w-72 bg-Parchment shadow-deep z-[60] flex flex-col p-8"
          >
            <button
              className="self-end text-Ink mb-8"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
            >
              <X size={24} />
            </button>
            <div className="flex flex-col gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`font-ui text-[0.875rem] font-medium uppercase tracking-[0.06em] ${
                    location.pathname === link.path ? 'text-Amber' : 'text-Ink'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="mt-auto flex items-center gap-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-Ink hover:text-Amber transition-colors"
                aria-label="GitHub"
              >
                <Github size={20} />
              </a>
              <button className="text-Ink hover:text-Amber transition-colors" aria-label="Search">
                <Search size={20} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
