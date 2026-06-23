import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles, Plus } from 'lucide-react'
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
            className="text-center mb-16"
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.article
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="group relative rounded-2xl border border-Sand dark:border-white/10 bg-Linen dark:bg-white/5 overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300"
            >
              <div className="p-1">
                <div className="rounded-xl overflow-hidden bg-[#1a1a2e]">
                  <PlutoCharonBadge />
                </div>
              </div>
              <div className="p-6 pt-2">
                <h2 className="font-display text-xl font-semibold text-Ink dark:text-white mb-2">
                  星空彩蛋
                </h2>
                <p className="font-body text-sm text-Ink/70 dark:text-white/70 leading-relaxed mb-5">
                  在距离太阳 59 亿公里的地方，有一颗心永远朝向它的伴星。点击最亮的星星，阅读一段光年之外的记忆。
                </p>
                <Link
                  to="/starry"
                  className="inline-flex items-center gap-2 text-[0.8125rem] font-medium text-Amber hover:text-[#B06A2F] transition-colors duration-300"
                >
                  进入星空
                  <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
                </Link>
              </div>
            </motion.article>

            <motion.article
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-Sand dark:border-white/10 bg-Linen/50 dark:bg-white/[0.03] p-8 text-center min-h-[280px]"
            >
              <div className="w-14 h-14 rounded-full bg-Sand/30 dark:bg-white/10 flex items-center justify-center mb-4">
                <Plus size={24} className="text-Ink/40 dark:text-white/50" />
              </div>
              <h3 className="font-display text-lg font-semibold text-Ink dark:text-white mb-2">
                更多彩蛋筹备中
              </h3>
              <p className="font-body text-sm text-Ink/60 dark:text-white/60 max-w-xs leading-relaxed">
                以后会把新的隐藏小惊喜放到这里，敬请期待。
              </p>
            </motion.article>
          </div>
        </div>
      </section>
    </>
  )
}
