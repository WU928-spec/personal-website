import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import PageSEO from '@/components/PageSEO'
import PlutoCharonBadge from '@/components/PlutoCharonBadge'

export default function EasterEggs() {
  return (
    <>
      <PageSEO
        title="售后彩蛋"
        description="这里存放着藏在网站角落里的小惊喜，会不定期更新新的彩蛋。"
      />
      <section className="min-h-[calc(100dvh-4rem)] bg-Parchment dark:bg-Graphite pt-24 pb-20 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-center mb-12"
          >
            <span className="inline-flex items-center gap-2 text-Amber font-ui text-[0.75rem] font-semibold uppercase tracking-[0.1em] mb-4">
              <Sparkles size={14} />
              Hidden Surprises
            </span>
            <h1 className="font-display text-[clamp(2rem,5vw,3.5rem)] font-semibold leading-[1.1] tracking-[-0.02em] text-Ink dark:text-white mb-4">
              售后彩蛋
            </h1>
            <p className="font-body text-Ink/70 dark:text-white/70 max-w-xl mx-auto leading-relaxed">
              这里收集了一些藏在网站角落里的小互动与小故事。它们不常露面，但只要你愿意找，就会有意想不到的回应。
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center justify-center"
          >
            <PlutoCharonBadge />
          </motion.div>
        </div>
      </section>
    </>
  )
}
