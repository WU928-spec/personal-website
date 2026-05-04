import { motion } from 'framer-motion'
import { useLang } from '@/contexts/LangContext'

export default function About() {
  const { t } = useLang()
  return (
    <div className="bg-Parchment">
      {/* ── Hero ── */}
      <section className="relative h-[50vh] flex items-center justify-center overflow-hidden bg-Parchment dark:bg-Graphite">
        <div className="relative z-10 max-w-4xl mx-auto text-center px-6">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.8,
              ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
            }}
            className="font-display text-[clamp(2rem,4vw,3.5rem)] font-medium text-Ink dark:text-white"
          >
            {t('about.title')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.8,
              delay: 0.3,
              ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
            }}
            className="mt-4 text-[1.0625rem] leading-[1.75] text-Ink/80 max-w-xl mx-auto font-body dark:text-white"
          >
            {t('about.comingSoon')}
          </motion.p>
        </div>
      </section>
    </div>
  )
}
