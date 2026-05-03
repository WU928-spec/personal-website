import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { List, X } from 'lucide-react'
import { useLang } from '@/contexts/LangContext'
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
  const observerRef = useRef<IntersectionObserver | null>(null)

  // Scroll-spy with IntersectionObserver
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

  // Also update active on scroll (fallback when no headings intersecting)
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
      {/* Desktop sidebar */}
      <aside className="hidden lg:block lg:col-span-3">
        <div className="sticky top-[100px] max-h-[calc(100dvh-120px)] overflow-y-auto pr-2">
          <h5 className="font-ui text-[1rem] font-semibold leading-[1.4] tracking-[0.08em] text-Slate uppercase mb-4">
            Contents
          </h5>
          <nav className="flex flex-col">
            {items.map((item) => {
              const isActive = activeId === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => handleClick(item.id)}
                  className={`text-left text-[0.9375rem] leading-[1.65] py-[6px] transition-all duration-200 border-l-2 ${
                    isActive
                      ? 'text-Amber border-Amber pl-3'
                      : 'text-Slate border-transparent hover:text-Ink pl-0'
                  } ${item.level === 3 ? 'pl-4' : ''} ${
                    isActive && item.level === 3 ? '!pl-7' : ''
                  }`}
                >
                  {item.text}
                </button>
              )
            })}
          </nav>
        </div>
      </aside>

      {/* Mobile floating button */}
      <div className="lg:hidden fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setMobileOpen(true)}
          className="w-12 h-12 rounded-full bg-Ink text-Parchment flex items-center justify-center shadow-deep hover:scale-105 transition-transform duration-200"
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
              className="fixed inset-0 bg-Ink/40 backdrop-blur-sm z-[60] lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              className="fixed bottom-0 left-0 right-0 bg-Parchment rounded-t-2xl z-[70] lg:hidden max-h-[70dvh] flex flex-col"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-Sand">
                <h5 className="font-ui text-[1rem] font-semibold leading-[1.4] tracking-[0.08em] text-Slate uppercase">
                  Contents
                </h5>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="text-Ink hover:text-Amber transition-colors"
                  aria-label={t('toc.close')}
                >
                  <X size={20} />
                </button>
              </div>
              <nav className="flex flex-col overflow-y-auto px-6 py-4">
                {items.map((item) => {
                  const isActive = activeId === item.id
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleClick(item.id)}
                      className={`text-left text-[0.9375rem] leading-[1.65] py-[8px] transition-all duration-200 border-l-2 ${
                        isActive
                          ? 'text-Amber border-Amber pl-3'
                          : 'text-Slate border-transparent hover:text-Ink pl-0'
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
