import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { List, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { useLang } from '@/contexts/PreferencesContext'
import type { TocItem } from './MarkdownRenderer.tsx'

interface TableOfContentsProps {
  items: TocItem[]
}

function scrollToHeading(id: string) {
  const el = document.getElementById(id)
  if (el) {
    const offset = 80
    const top = el.getBoundingClientRect().top + window.scrollY - offset
    window.scrollTo({ top, behavior: 'smooth' })
  }
}

export default function TableOfContents({ items }: TableOfContentsProps) {
  const { t } = useLang()
  const [activeId, setActiveId] = useState<string>('')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [desktopCollapsed, setDesktopCollapsed] = useState(false)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (items.length === 0) return

    const headingElements = items
      .map((item) => document.getElementById(item.id))
      .filter(Boolean) as HTMLElement[]

    if (headingElements.length === 0) return

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)

        if (visible.length > 0) {
          setActiveId(visible[0].target.id)
        }
      },
      {
        rootMargin: '-80px 0px -60% 0px',
        threshold: 0,
      }
    )

    headingElements.forEach((el) => observerRef.current?.observe(el))

    return () => {
      observerRef.current?.disconnect()
    }
  }, [items])

  useEffect(() => {
    const handleScroll = () => {
      if (items.length === 0) return
      const headingElements = items
        .map((item) => document.getElementById(item.id))
        .filter(Boolean) as HTMLElement[]

      if (headingElements.length === 0) return

      const scrollPos = window.scrollY + 100
      let current = headingElements[0]?.id || ''

      for (const el of headingElements) {
        if (el.offsetTop <= scrollPos) {
          current = el.id
        }
      }

      setActiveId(current)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [items])

  const handleClick = useCallback(
    (id: string) => {
      scrollToHeading(id)
      setMobileOpen(false)
    },
    []
  )

  if (items.length === 0) return null

  return (
    <>
      {/* Desktop fixed sidebar — collapsed strip */}
      {desktopCollapsed && (
        <div className="hidden lg:block fixed right-0 top-1/2 -translate-y-1/2 z-40">
          <button
            onClick={() => setDesktopCollapsed(false)}
            className="flex items-center justify-center w-8 h-20 rounded-l-lg bg-card border border-r-0 border-border text-primary hover:text-primary transition-colors duration-300"
            title="展开目录"
            aria-label="展开目录"
          >
            <ChevronLeft size={16} />
          </button>
        </div>
      )}

      {/* Desktop fixed sidebar — expanded */}
      <AnimatePresence>
        {!desktopCollapsed && (
          <motion.aside
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }}
            className="hidden lg:block fixed right-0 top-[80px] z-40"
          >
            <div className="flex">
              {/* Collapse toggle strip */}
              <button
                onClick={() => setDesktopCollapsed(true)}
                className="flex items-center justify-center w-7 bg-card border border-r-0 border-border text-primary hover:text-primary transition-colors duration-300 rounded-l-lg shrink-0"
                title="收起目录"
                aria-label="收起目录"
              >
                <ChevronRight size={14} />
              </button>

              {/* TOC content */}
              <div className="w-[220px] max-h-[calc(100dvh-140px)] bg-card border-y border-r border-border rounded-l-lg overflow-hidden flex flex-col">
                <div className="px-5 pt-4 pb-2 shrink-0">
                  <h5 className="font-ui text-label font-semibold leading-[1.4] tracking-wider text-muted uppercase">
                    {t('toc.title') || 'Contents'}
                  </h5>
                </div>
                <div
                  ref={scrollContainerRef}
                  className="flex-1 overflow-y-auto overscroll-contain px-5 pb-4"
                >
                  <nav className="flex flex-col">
                    {items.map((item) => {
                      const isActive = activeId === item.id
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleClick(item.id)}
                          className={`text-left text-caption leading-[1.6] py-1 transition-all duration-200 border-l-2 ${
                            isActive
                              ? 'text-primary border-primary pl-3'
                              : 'text-muted border-transparent hover:text-primary pl-0'
                          } ${item.level === 3 ? 'ml-2' : ''} ${
                            isActive && item.level === 3 ? '!ml-2 !pl-3' : ''
                          }`}
                        >
                          {item.text}
                        </button>
                      )
                    })}
                  </nav>
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Mobile floating button */}
      <div className="lg:hidden fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setMobileOpen(true)}
          className="w-12 h-12 rounded-lg bg-primary text-primary-foreground flex items-center justify-center hover:scale-105 transition-transform duration-200"
          aria-label={t('toc.open')}
        >
          <List size={20} />
        </button>
      </div>

      {/* Mobile bottom sheet */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-Ink/40 z-[60] lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              className="fixed bottom-0 left-0 right-0 bg-card rounded-t-lg z-[70] lg:hidden max-h-[70dvh] flex flex-col"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <h5 className="font-ui text-label font-semibold leading-[1.4] tracking-wider text-muted uppercase">
                  {t('toc.title') || 'Contents'}
                </h5>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="text-primary hover:text-primary transition-colors"
                  aria-label={t('toc.close')}
                >
                  <X size={20} />
                </button>
              </div>
              <nav className="flex flex-col overflow-y-auto overscroll-contain px-6 py-4">
                {items.map((item) => {
                  const isActive = activeId === item.id
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleClick(item.id)}
                      className={`text-left text-caption leading-[1.65] py-2 transition-all duration-200 border-l-2 ${
                        isActive
                          ? 'text-Amber border-Amber pl-3'
                          : 'text-Slate dark:text-white/60 border-transparent hover:text-Ink dark:hover:text-white pl-0'
                      } ${item.level === 3 ? 'pl-4' : ''} ${
                        isActive && item.level === 3 ? '!pl-7' : ''
                      }`}
                    >
                      {item.text}
                    </button>
                  )
                })}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
