import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { useLang } from '@/contexts/PreferencesContext'
import { loadHero, type HeroData } from '@/data/site'
import { fetchNotes } from '@/services/noteClient'
import { selectLatestNotes } from '@/utils/noteContent'
import type { NoteMeta } from '@/types'

export default function HeroSection() {
  const { t, lang } = useLang()
  const reduceMotion = useReducedMotion()
  const [hero, setHero] = useState<HeroData>(() => loadHero(lang))
  const [latestNote, setLatestNote] = useState<NoteMeta | null>(null)

  useEffect(() => { setHero(loadHero(lang)) }, [lang])

  useEffect(() => {
    let active = true
    const loadLatest = async () => {
      try {
        const notes = await fetchNotes()
        if (active) setLatestNote(selectLatestNotes(notes, 1)[0] || null)
      } catch {
        if (active) setLatestNote(null)
      }
    }
    void loadLatest()
    return () => { active = false }
  }, [])

  return (
    <section className="border-b border-Sand/70 dark:border-white/10">
      <motion.div
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: reduceMotion ? 0 : 0.2 }}
        className="mx-auto max-w-6xl px-6 py-20 md:px-12 md:py-28"
      >
        <p className="font-ui text-label uppercase tracking-[0.16em] text-Amber">{t('homeExtra.brandNote')}</p>
        <h1 className="mt-6 max-w-5xl font-display text-[clamp(2.75rem,6.2vw,5.5rem)] font-medium leading-[1.13] tracking-[-0.035em] text-Ink dark:text-white">
          {t('homeExtra.blogHeroTitle')}
        </h1>
        <p className="mt-7 max-w-xl text-body leading-[1.85] text-Slate">{hero.tagline}</p>

        <div className="mt-16 border-t border-Sand/80 pt-7 dark:border-white/10 md:mt-20">
          {latestNote ? (
            <Link to={`/notes?note=${encodeURIComponent(latestNote.slug)}`} className="group grid gap-5 md:grid-cols-[10rem_1fr_auto] md:items-start">
              <div className="font-ui text-caption text-Slate">
                <span className="block text-Amber">{t('homeExtra.latestLabel')}</span>
                <time className="mt-2 block">{latestNote.date}</time>
              </div>
              <div>
                <h2 className="font-display text-3xl leading-snug text-Ink transition-colors group-hover:text-Amber dark:text-white md:text-4xl">{latestNote.title}</h2>
                <p className="mt-3 max-w-2xl text-body leading-relaxed text-Slate">{latestNote.excerpt}</p>
              </div>
              <span className="inline-flex items-center gap-2 font-ui text-caption text-Amber md:pt-2">{t('homeExtra.readLatest')}<ArrowUpRight size={16} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></span>
            </Link>
          ) : (
            <Link to="/notes" className="group inline-flex items-center gap-2 border-b border-Amber/40 pb-1 font-ui text-body text-Amber">
              {t('homeExtra.readNotes')}<ArrowUpRight size={17} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          )}
        </div>
      </motion.div>
    </section>
  )
}
