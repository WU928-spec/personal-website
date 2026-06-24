import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Github, Search, Menu, X, LogIn, User, Globe, Sun, Moon, Pencil, Eye } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { useLang, useTheme } from '@/contexts/PreferencesContext'
import GlobalSearch from './GlobalSearch'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const location = useLocation()
  const { user, isLoggedIn, isEditMode, setEditMode } = useAuth()
  const { t, lang, toggleLang } = useLang()
  const { theme, toggleTheme } = useTheme()

  const navLinks = [
    { path: '/', label: t('nav.home') },
    { path: '/moments', label: t('nav.moments') },
    { path: '/obsidian', label: t('nav.obsidian') },
    { path: '/calendar', label: t('nav.calendar') },
    { path: '/projects', label: t('nav.projects') },
    { path: '/internship', label: '实习决策' },
    { path: '/easter-eggs', label: t('nav.easterEggs') },
  ]

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen((v) => !v)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const linkClass = (path: string) =>
    `relative font-ui text-[0.875rem] font-medium uppercase tracking-[0.06em] transition-colors duration-300 group ${
      location.pathname === path
        ? 'text-Amber'
        : 'text-Ink hover:text-Amber dark:text-white dark:hover:text-Amber'
    }`

  const iconBtnClass = 'text-Ink hover:text-Amber transition-colors duration-300 dark:text-white dark:hover:text-Amber'

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-Parchment/95 backdrop-blur-xl border-b border-Sand shadow-sm dark:bg-Graphite/95 dark:border-white/10'
            : 'bg-Parchment/30 backdrop-blur-sm dark:bg-Graphite/90 dark:backdrop-blur-md'
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 md:px-12 flex items-center justify-between h-16">
          <Link to="/" className="flex items-center shrink-0">
            <img src="/logo.svg" alt="Logo" className="h-8 w-auto" />
          </Link>
          {/* Back button removed */}

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link key={link.path} to={link.path} className={linkClass(link.path)}>
                {link.label}
                <span
                  className={`absolute left-0 -bottom-1 h-[2px] bg-Amber transition-transform duration-300 origin-center ${
                    location.pathname === link.path ? 'w-full scale-x-100' : 'w-full scale-x-0 group-hover:scale-x-100'
                  }`}
                />
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <a
              href="https://github.com/WU928-spec"
              target="_blank"
              rel="noopener noreferrer"
              className={iconBtnClass}
              aria-label="GitHub"
            >
              <Github size={20} />
            </a>
            <button
              onClick={() => setSearchOpen(true)}
              className={`${iconBtnClass} relative`}
              aria-label={t('nav.search')}
              title="搜索 (Cmd+K)"
            >
              <Search size={20} />
            </button>
            <button
              onClick={toggleLang}
              className="flex items-center gap-1 text-[0.75rem] font-medium text-Ink hover:text-Amber transition-colors duration-300 px-2 py-1 rounded-md border border-Sand hover:border-Amber dark:text-white dark:border-white/30 dark:hover:text-Amber dark:hover:border-Amber"
              title={t('nav.switchLanguage')}
            >
              <Globe size={14} />
              {lang === 'zh' ? 'EN' : '中'}
            </button>
            <button
              onClick={toggleTheme}
              className="flex items-center justify-center w-8 h-8 rounded-md border border-Sand text-Ink hover:text-Amber hover:border-Amber transition-colors duration-300 dark:text-white dark:border-white/30 dark:hover:text-Amber dark:hover:border-Amber"
              title={theme === 'light' ? t('theme.switchToDark') : t('theme.switchToLight')}
            >
              {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
            </button>
            {isLoggedIn ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setEditMode(!isEditMode)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[0.75rem] font-medium border transition-colors ${
                    isEditMode
                      ? 'bg-Amber text-white border-Amber hover:bg-[#b8863d]'
                      : 'bg-Linen text-Ink border-Sand hover:border-Amber hover:text-Amber dark:bg-white/15 dark:text-white dark:border-white/25 dark:hover:text-Amber dark:hover:border-Amber'
                  }`}
                  title={isEditMode ? '切换为浏览模式' : '切换为编辑模式'}
                >
                  {isEditMode ? <Eye size={13} /> : <Pencil size={13} />}
                  {isEditMode ? '浏览模式' : '编辑模式'}
                </button>
                <Link
                  to="/profile"
                  className="flex items-center gap-2 text-Ink hover:text-Amber transition-colors duration-300 dark:text-white dark:hover:text-Amber"
                >
                  <img
                    src={user?.avatar}
                    alt={user?.username}
                    className="w-8 h-8 rounded-full object-cover border border-Sand dark:border-white/25"
                  />
                </Link>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-1.5 text-[0.8125rem] font-medium text-Ink hover:text-Amber transition-colors duration-300 dark:text-white dark:hover:text-Amber"
              >
                <LogIn size={16} />
                {t('nav.login')}
              </Link>
            )}
          </div>

          <button
            className="md:hidden text-Ink p-1 dark:text-white"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={t('nav.toggleMenu')}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      <GlobalSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="fixed top-0 right-0 bottom-0 w-72 bg-Parchment shadow-deep z-[60] flex flex-col p-8 dark:bg-Graphite"
          >
            <button
              className="self-end text-Ink mb-8 dark:text-white"
              onClick={() => setMobileOpen(false)}
              aria-label={t('nav.closeMenu')}
            >
              <X size={24} />
            </button>
            <div className="flex flex-col gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`font-ui text-[0.875rem] font-medium uppercase tracking-[0.06em] ${
                    location.pathname === link.path ? 'text-Amber' : 'text-Ink dark:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="mt-auto flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <a
                  href="https://github.com/WU928-spec"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-Ink hover:text-Amber transition-colors dark:text-white dark:hover:text-Amber"
                  aria-label="GitHub"
                >
                  <Github size={20} />
                </a>
                <button
                  onClick={() => {
                    setMobileOpen(false)
                    setSearchOpen(true)
                  }}
                  className="text-Ink hover:text-Amber transition-colors dark:text-white dark:hover:text-Amber"
                  aria-label={t('nav.search')}
                >
                  <Search size={20} />
                </button>
              </div>
              {isLoggedIn ? (
                <Link
                  to="/profile"
                  className="flex items-center gap-2 text-Ink hover:text-Amber transition-colors dark:text-white dark:hover:text-Amber"
                  onClick={() => setMobileOpen(false)}
                >
                  <User size={18} />
                  <span className="font-ui text-[0.875rem] font-medium">{t('nav.profile')}</span>
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center gap-2 text-Ink hover:text-Amber transition-colors dark:text-white dark:hover:text-Amber"
                  onClick={() => setMobileOpen(false)}
                >
                  <LogIn size={18} />
                  <span className="font-ui text-[0.875rem] font-medium">{t('nav.login')}</span>
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
