import { motion } from 'framer-motion'
import PageSEO from '@/components/PageSEO'
import PlutoCharonBadge from '@/components/PlutoCharonBadge'

// 后续添加彩蛋时，只需要在这里新增一项即可
const EASTER_EGGS = [
  {
    id: 'starry',
    component: <PlutoCharonBadge />,
  },
]

export default function EasterEggs() {
  return (
    <>
      <PageSEO
        title="售后彩蛋"
        description="这里存放着藏在网站角落里的小惊喜，会不定期更新新的彩蛋。"
      />
      <section className="min-h-[calc(100dvh-4rem)] bg-Parchment dark:bg-Graphite px-6 py-20">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-center mb-16"
          >
            <h1 className="font-display text-[clamp(2.5rem,6vw,4rem)] font-semibold leading-[1.1] tracking-[-0.02em] text-Ink dark:text-white">
              售后彩蛋
            </h1>
            <div className="mt-4 mx-auto w-12 h-0.5 bg-Amber/60 rounded-full" />
          </motion.div>

          <div className="flex flex-wrap items-center justify-center gap-10">
            {EASTER_EGGS.map((egg, index) => (
              <motion.div
                key={egg.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  duration: 0.5,
                  delay: 0.1 + index * 0.1,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="group relative rounded-2xl transition-transform duration-300 hover:scale-[1.02]"
              >
                <div className="absolute -inset-3 rounded-2xl bg-gradient-to-br from-Amber/10 to-transparent opacity-0 blur-lg transition-opacity duration-300 group-hover:opacity-100" />
                <div className="relative">
                  {egg.component}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
