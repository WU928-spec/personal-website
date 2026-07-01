import { motion } from 'framer-motion'
import { useLang } from '@/contexts/PreferencesContext'
import PageSEO from '@/components/PageSEO'

export default function About() {
  const { t } = useLang()
  return (
    <div className="bg-Parchment">
      <PageSEO
        title="About"
        description="About the author and this digital garden."
        path="/about"
      />
      {/* ── Hero ── */}
      <section className="relative h-[50vh] flex items-center justify-center overflow-hidden bg-Parchment dark:bg-Graphite">
        <div className="relative z-10 max-w-4xl mx-auto text-center px-4">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.8,
              ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
            }}
            className="font-display text-display font-medium text-Ink dark:text-white"
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
            className="mt-4 text-body leading-[1.75] text-Ink/80 max-w-xl mx-auto font-body dark:text-white"
          >
            {t('about.comingSoon')}
          </motion.p>
        </div>
      </section>
    </div>
  )
}
