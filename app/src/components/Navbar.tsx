import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Github, Globe, Menu, Moon, Search, Sun, Wrench, X } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useLang, useTheme } from '@/contexts/PreferencesContext'
import GlobalSearch from './GlobalSearch'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const location = useLocation()
  const { t, lang, toggleLang } = useLang()
  const { theme, toggleTheme } = useTheme()

  const navLinks = [
    { path: '/', label: t('nav.home') },
    { path: '/moments', label: t('nav.moments') },
    { path: '/notes', label: t('nav.obsidian') },
  ]

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 32)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => { setMobileOpen(false) }, [location.pathname])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault()
        setSearchOpen((open) => !open)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const iconClass = 'inline-flex h-8 w-8 items-center justify-center rounded-full text-Ink/70 transition-colors hover:text-Amber focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-Amber dark:text-white/70'

  return (
    <>
      <nav className={`fixed inset-x-0 top-0 z-50 border-b transition-colors ${scrolled ? 'border-Sand/60 bg-Parchment/95 shadow-sm backdrop-blur dark:border-white/10 dark:bg-Graphite/95' : 'border-transparent bg-Parchment/80 backdrop-blur-sm dark:bg-Graphite/85'}`}>
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6 md:px-12">
          <Link to="/" aria-label="Jasper 首页" className="group shrink-0 leading-none">
            <span className="block font-display text-[1.75rem] font-semibold tracking-[-0.04em] text-Ink transition-colors group-hover:text-Amber dark:text-white">Jasper</span>
            <span className="mt-1 hidden font-ui text-[0.625rem] tracking-[0.08em] text-Slate lg:block">{t('homeExtra.brandNote')}</span>
          </Link>
          <div className="hidden items-center gap-9 md:flex">
            {navLinks.map((link) => (
              <Link key={link.path} to={link.path} className={`group relative font-ui text-label font-medium tracking-[0.04em] transition-colors ${location.pathname === link.path ? 'text-Amber' : 'text-Ink/75 hover:text-Amber dark:text-white/75'}`}>
                {link.label}
                <span className={`absolute -bottom-1.5 left-0 h-px w-full origin-left bg-Amber transition-transform ${location.pathname === link.path ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`} />
              </Link>
            ))}
          </div>
          <div className="hidden items-center gap-2 md:flex">
            <a href="https://github.com/WU928-spec" target="_blank" rel="noopener noreferrer" aria-label="GitHub" className={iconClass}><Github size={17} /></a>
            <button onClick={() => setSearchOpen(true)} aria-label={t('nav.search')} title={`${t('nav.search')} (⌘K)`} className={iconClass}><Search size={17} /></button>
            <button onClick={toggleLang} className="inline-flex h-8 items-center gap-1.5 rounded-full px-2 font-ui text-label text-Ink/70 transition-colors hover:text-Amber focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-Amber dark:text-white/70" title={t('nav.switchLanguage')}><Globe size={14} />{lang === 'zh' ? 'EN' : '中'}</button>
            <button onClick={toggleTheme} aria-label={theme === 'light' ? t('theme.switchToDark') : t('theme.switchToLight')} className={iconClass}>{theme === 'light' ? <Moon size={15} /> : <Sun size={15} />}</button>
          </div>
          <button className="inline-flex h-9 w-9 items-center justify-center text-Ink dark:text-white md:hidden" onClick={() => setMobileOpen(!mobileOpen)} aria-label={t('nav.toggleMenu')}>{mobileOpen ? <X size={23} /> : <Menu size={23} />}</button>
        </div>
      </nav>

      <GlobalSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 24 }} transition={{ duration: 0.2 }} className="fixed inset-y-0 right-0 z-[60] flex w-72 flex-col bg-Parchment p-8 shadow-deep dark:bg-Graphite">
            <button className="mb-10 self-end text-Ink dark:text-white" onClick={() => setMobileOpen(false)} aria-label={t('nav.closeMenu')}><X size={23} /></button>
            <div className="flex flex-col gap-7">
              {navLinks.map((link) => <Link key={link.path} to={link.path} className={`font-display text-2xl ${location.pathname === link.path ? 'text-Amber' : 'text-Ink dark:text-white'}`}>{link.label}</Link>)}
            </div>
            <div className="mt-8 border-t border-Sand/70 pt-6 dark:border-white/10">
              <Link to="/tools" className="inline-flex items-center gap-2 text-caption text-Slate transition-colors hover:text-Amber"><Wrench size={15} />{t('nav.tools')}</Link>
            </div>
            <div className="mt-auto flex items-center gap-3">
              <a href="https://github.com/WU928-spec" target="_blank" rel="noopener noreferrer" aria-label="GitHub" className={iconClass}><Github size={18} /></a>
              <button onClick={() => { setMobileOpen(false); setSearchOpen(true) }} aria-label={t('nav.search')} className={iconClass}><Search size={18} /></button>
              <button onClick={toggleLang} className={iconClass} aria-label={t('nav.switchLanguage')}><Globe size={17} /></button>
              <button onClick={toggleTheme} className={iconClass} aria-label={theme === 'light' ? t('theme.switchToDark') : t('theme.switchToLight')}>{theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
