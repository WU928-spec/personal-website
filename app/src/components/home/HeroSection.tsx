import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { useLang } from '@/contexts/PreferencesContext'
import { loadHero, type HeroData } from '@/data/site'
import { useTypingEffect } from '@/hooks/useTypingEffect'
import PlutoCharonBadge from '@/components/PlutoCharonBadge'

export default function HeroSection() {
  const { t, lang } = useLang()
  const headline = t('home.heroTitle')
  const { displayed, showCursor, done } = useTypingEffect(headline, 80, 600)
  const [hero, setHero] = useState<HeroData>(() => loadHero(lang))

  useEffect(() => { setHero(loadHero(lang)) }, [lang])

  return (
    <section className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden bg-Parchment dark:bg-Graphite">
      <div className="relative z-10 max-w-4xl mx-auto text-center px-6">
        <PlutoCharonBadge />
        <h1 className="font-display text-[clamp(2.75rem,6vw,5rem)] font-semibold leading-[1.05] tracking-[-0.02em] text-Ink dark:text-white">
          {displayed}
          {showCursor && <span className="text-Amber animate-blink ml-0.5">|</span>}
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={done ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="font-body text-[1.0625rem] leading-[1.75] text-Ink/85 mt-4 dark:text-white"
        >
          {hero.subtitle}
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={done ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="font-body text-[0.9375rem] leading-[1.65] text-Ink/70 max-w-xl mx-auto mt-4 dark:text-white"
        >
          {hero.tagline}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={done ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center justify-center gap-4 mt-8"
        >
          <Link
            to="/moments"
            className="inline-flex items-center bg-Amber text-Parchment font-ui text-[0.875rem] font-semibold uppercase tracking-[0.05em] px-7 py-3 rounded-md hover:bg-[#B06A2F] hover:shadow-amber hover:-translate-y-px transition-all duration-300"
          >
            记忆碎片
          </Link>
          <Link
            to="/projects"
            className="inline-flex items-center border-[1.5px] border-Ink/80 text-Ink font-ui text-[0.875rem] font-semibold uppercase tracking-[0.05em] px-7 py-3 rounded-md hover:bg-Ink/10 hover:-translate-y-px transition-all duration-300 dark:border-white/40 dark:text-white dark:hover:bg-white/10"
          >
            {t('home.viewProjects')}
          </Link>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
      >
        <div className="flex flex-col items-center gap-2 animate-scroll-pulse">
          <span className="font-ui text-[0.8125rem] font-medium tracking-[0.04em] text-Ink/50 uppercase dark:text-white">
            {t('home.scroll')}
          </span>
          <ChevronDown size={20} className="text-Ink/50 dark:text-white" />
        </div>
      </motion.div>
    </section>
  )
}
