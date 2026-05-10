import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Link2, ArrowRight } from 'lucide-react'
import { fetchObsidianNotes } from '@/services/obsidianClient'
import type { ObsidianNoteMeta } from '@/types'
import { findBacklinks } from '@/services/linkParser'
import { useLang } from '@/contexts/PreferencesContext'

interface BacklinksProps {
  currentSlug: string
}

export default function Backlinks({ currentSlug }: BacklinksProps) {
  const { t } = useLang()
  const navigate = useNavigate()
  const [backlinks, setBacklinks] = useState<ObsidianNoteMeta[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      const notes = await fetchObsidianNotes()
      if (!cancelled) {
        const inbound = findBacklinks(currentSlug, notes)
        setBacklinks(inbound)
        setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [currentSlug])

  if (loading) {
    return (
      <div className="mt-12 pt-8 border-t border-Sand">
        <div className="flex items-center gap-2 mb-4">
          <Link2 size={16} className="text-Slate" />
          <h3 className="font-display text-[1.125rem] font-semibold text-Ink dark:text-white">
            {t('obsidian.backlinks')}
          </h3>
        </div>
        <div className="flex gap-3">
          <div className="h-16 w-full bg-Linen/50 rounded-lg animate-pulse dark:bg-white/5" />
          <div className="h-16 w-full bg-Linen/50 rounded-lg animate-pulse dark:bg-white/5" />
        </div>
      </div>
    )
  }

  if (backlinks.length === 0) {
    return (
      <div className="mt-12 pt-8 border-t border-Sand">
        <div className="flex items-center gap-2 mb-2">
          <Link2 size={16} className="text-Slate" />
          <h3 className="font-display text-[1.125rem] font-semibold text-Ink dark:text-white">
            {t('obsidian.backlinks')}
          </h3>
        </div>
        <p className="text-[0.9375rem] text-Slate">{t('obsidian.noBacklinks')}</p>
      </div>
    )
  }

  return (
    <div className="mt-12 pt-8 border-t border-Sand">
      <div className="flex items-center gap-2 mb-4">
        <Link2 size={16} className="text-Amber" />
        <h3 className="font-display text-[1.125rem] font-semibold text-Ink dark:text-white">
          {t('obsidian.backlinks')}
        </h3>
        <span className="text-[0.75rem] text-Slate bg-Linen px-2 py-0.5 rounded-full dark:bg-white/10">
          {backlinks.length}
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {backlinks.map((note, i) => (
          <motion.button
            key={note.slug}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
            onClick={() => navigate(`/blog/${note.slug}`)}
            className="text-left p-4 rounded-lg border border-Sand bg-Linen/40 hover:bg-Linen hover:shadow-soft transition-all duration-200 group dark:bg-white/5 dark:border-white/10 dark:hover:bg-white/10"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[0.6875rem] font-medium text-Sage">{note.category}</span>
              <span className="text-[0.6875rem] text-Slate">{note.date}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-display text-[0.9375rem] font-medium text-Ink group-hover:text-Amber transition-colors dark:text-white">
                {note.title}
              </span>
              <ArrowRight
                size={14}
                className="text-Slate opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
              />
            </div>
            <p className="mt-1 text-[0.8125rem] text-Slate line-clamp-1">{note.excerpt}</p>
          </motion.button>
        ))}
      </div>
    </div>
  )
}
