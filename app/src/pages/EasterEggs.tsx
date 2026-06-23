import { motion } from 'framer-motion'
import { Sparkles, Star, ArrowRight, Lock, Heart } from 'lucide-react'
import PageSEO from '@/components/PageSEO'
import PlutoCharonBadge from '@/components/PlutoCharonBadge'

const EASTER_EGGS = [
  {
    id: 'starry',
    title: '星空彩蛋',
    description: '点击冥王星与卡戎，进入一片只为你点亮的星空。每一颗星星都是一段被封存的记忆，点亮全部十四颗最亮的星，会解锁一封隐藏的信。',
    status: 'available' as const,
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
      <section className="min-h-[calc(100dvh-4rem)] bg-Parchment dark:bg-Graphite px-6 py-20 relative overflow-hidden">
        {/* 背景装饰光点 */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-Amber/20 dark:bg-white/10"
              style={{
                left: `${10 + i * 12}%`,
                top: `${15 + (i % 3) * 30}%`,
              }}
              animate={{
                opacity: [0.1, 0.4, 0.1],
                scale: [1, 1.8, 1],
              }}
              transition={{
                duration: 4 + i * 0.6,
                repeat: Infinity,
                delay: i * 0.8,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>

        <div className="max-w-5xl mx-auto relative z-10">
          {/* 标题区域 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-center mb-20"
          >
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-10 h-px bg-gradient-to-r from-transparent to-Amber/40 dark:to-white/30" />
              <Sparkles size={16} className="text-Amber/60 dark:text-white/40" />
              <div className="w-10 h-px bg-gradient-to-l from-transparent to-Amber/40 dark:to-white/30" />
            </div>

            <h1 className="font-display text-[clamp(2.5rem,6vw,4rem)] font-semibold leading-[1.1] tracking-[-0.02em] text-Ink dark:text-white">
              售后彩蛋
            </h1>

            <div className="mt-4 mx-auto w-16 h-0.5 bg-gradient-to-r from-transparent via-Amber/60 to-transparent rounded-full" />

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="mt-6 max-w-md mx-auto text-sm text-Ink/50 dark:text-white/40 font-body leading-relaxed tracking-wide"
            >
              这里存放着藏在网站角落里的小惊喜。
              <br />
              有些故事被藏进了星星里，有些温柔被写进了光年里。
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="mt-4 flex items-center justify-center gap-2 text-xs text-Amber/60 dark:text-white/30 font-body tracking-widest"
            >
              <Heart size={12} className="text-Amber/40" />
              <span>不定期更新</span>
              <span className="mx-1">·</span>
              <span>{EASTER_EGGS.length} 个彩蛋</span>
            </motion.div>
          </motion.div>

          {/* 彩蛋卡片列表 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {EASTER_EGGS.map((egg, index) => (
              <motion.div
                key={egg.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.6,
                  delay: 0.2 + index * 0.15,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                <div className="group relative">
                  {/* 悬停光晕 */}
                  <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-Amber/5 to-transparent opacity-0 blur-2xl transition-all duration-500 group-hover:opacity-100 group-hover:-inset-6" />

                  {/* 卡片边框光效 */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-Amber/10 via-transparent to-Amber/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100 dark:from-white/10 dark:to-white/5" />

                  <div className="relative rounded-2xl border border-Amber/10 dark:border-white/10 bg-white/50 dark:bg-white/[0.03] backdrop-blur-sm p-8 transition-all duration-500 hover:border-Amber/20 dark:hover:border-white/20 hover:shadow-[0_8px_40px_-12px_rgba(251,191,36,0.15)] dark:hover:shadow-[0_8px_40px_-12px_rgba(255,255,255,0.08)]">
                    {/* 状态标签 */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2">
                        {egg.status === 'available' ? (
                          <>
                            <span className="w-2 h-2 rounded-full bg-green-400/80 shadow-[0_0_8px_rgba(74,222,128,0.4)]" />
                            <span className="text-xs text-green-500/70 dark:text-green-400/60 font-body tracking-wider">
                              已解锁
                            </span>
                          </>
                        ) : (
                          <>
                            <Lock size={12} className="text-white/30" />
                            <span className="text-xs text-white/30 font-body tracking-wider">
                              未解锁
                            </span>
                          </>
                        )}
                      </div>
                      <Star size={14} className="text-Amber/30 dark:text-white/20 group-hover:text-Amber/50 dark:group-hover:text-white/40 transition-colors duration-300" />
                    </div>

                    {/* 组件区域 */}
                    <div className="flex justify-center mb-6">
                      {egg.component}
                    </div>

                    {/* 标题和描述 */}
                    <h3 className="font-display text-lg font-medium text-Ink dark:text-white/90 tracking-wide text-center mb-3">
                      {egg.title}
                    </h3>
                    <p className="text-sm text-Ink/50 dark:text-white/40 font-body leading-[1.8] text-center mb-6">
                      {egg.description}
                    </p>

                    {/* 底部提示 */}
                    <div className="flex items-center justify-center gap-2 text-xs text-Amber/50 dark:text-white/30 font-body tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span>点击探索</span>
                      <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform duration-300" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* 底部占位提示 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="mt-20 text-center"
          >
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="w-12 h-px bg-gradient-to-r from-transparent to-Amber/20 dark:to-white/20" />
              <Lock size={14} className="text-Amber/30 dark:text-white/20" />
              <div className="w-12 h-px bg-gradient-to-l from-transparent to-Amber/20 dark:to-white/20" />
            </div>
            <p className="text-xs text-Ink/30 dark:text-white/20 font-body tracking-widest">
              更多彩蛋正在路上...
            </p>
          </motion.div>
        </div>
      </section>
    </>
  )
}
