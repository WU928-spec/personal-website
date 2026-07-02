import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Wrench, Briefcase, ArrowRight, Star, Heart, TextQuote, Film } from 'lucide-react'
import { useLang } from '@/contexts/PreferencesContext'
import PageSEO from '@/components/PageSEO'

const TOOLS = [
  {
    id: 'internship',
    title: '实习决策助手',
    description: '多维实习Offer对比打分系统，帮你量化选择。输入薪资、通勤、体验、前景，系统自动计算加权总分，雷达图对比一目了然。',
    status: 'available' as const,
    icon: <Briefcase size={48} />,
    path: '/internship',
    titleKey: 'tools.internshipTitle',
    descKey: 'tools.internshipDesc',
  },
  {
    id: 'text-segmenter',
    title: '英文分段器',
    description: '智能英文文本分段工具，自动将连续英文文本按句子换行、段落空行分隔，方便在 Obsidian 中阅读。',
    status: 'available' as const,
    icon: <TextQuote size={48} />,
    path: '/text-segmenter',
    titleKey: 'tools.textSegmenterTitle',
    descKey: 'tools.textSegmenterDesc',
  },
  {
    id: 'movie-recommender',
    title: '每日电影推荐',
    description: '根据心情、偏好或关键词，从精选片库中推荐下一部值得看的电影。支持 AI 智能匹配和每日推荐。',
    status: 'available' as const,
    icon: <Film size={48} />,
    path: '/movie-recommender',
    titleKey: 'tools.movieRecommenderTitle',
    descKey: 'tools.movieRecommenderDesc',
  },
]

export default function Tools() {
  const navigate = useNavigate()
  const { t } = useLang()

  return (
    <>
      <PageSEO
        title={t('tools.title')}
        description={t('tools.description')}
      />

      <section className="min-h-[calc(100dvh-4rem)] bg-Parchment dark:bg-Graphite px-6 py-20 relative">

        <div className="max-w-5xl mx-auto">
          {/* 标题区域 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-center mb-20"
          >
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="w-10 h-px bg-gradient-to-r from-transparent to-Amber/40 dark:to-white/30" />
              <Wrench size={16} className="text-Amber/60 dark:text-white/40" />
              <div className="w-10 h-px bg-gradient-to-l from-transparent to-Amber/40 dark:to-white/30" />
            </div>

            <h1 className="font-display text-heading text-Ink dark:text-white">
              {t('tools.title')}
            </h1>

            <div className="mt-4 mx-auto w-16 h-0.5 bg-gradient-to-r from-transparent via-Amber/60 to-transparent rounded-lg" />

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="mt-6 max-w-md mx-auto text-body text-Ink/50 dark:text-white/40 font-body leading-relaxed tracking-wide"
            >
              {t('tools.description')}
              <br />
              {t('tools.descriptionLine2')}
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="mt-4 flex items-center justify-center gap-2 text-caption text-Amber/60 dark:text-white/30 font-body tracking-widest"
            >
              <Heart size={12} className="text-Amber/40" />
              <span>{t('tools.irregularUpdates')}</span>
              <span className="mx-1">·</span>
              <span>{TOOLS.length} {t('tools.toolsCount')}</span>
            </motion.div>
          </motion.div>

          {/* 工具卡片列表 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {TOOLS.map((tool, index) => (
              <motion.div
                key={tool.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.6,
                  delay: 0.2 + index * 0.15,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                <div
                  className="group relative cursor-pointer"
                  onClick={() => navigate(tool.path)}
                >
                  <div className="relative rounded-lg border border-Sand dark:border-white/10 bg-white/50 dark:bg-white/[0.03] p-8 transition-all duration-500 hover:border-Amber/20 dark:hover:border-white/20 hover:shadow-soft">
                    {/* 状态标签 */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-lg bg-green-400/80" />
                        <span className="text-label text-green-500/70 dark:text-green-400/60 font-body tracking-wider">
                          {t('internship.unlocked')}
                        </span>
                      </div>
                      <Star size={14} className="text-Amber/30 dark:text-white/20 group-hover:text-Amber/50 dark:group-hover:text-white/40 transition-colors duration-300" />
                    </div>

                    {/* 图标区域 */}
                    <div className="flex justify-center mb-6">
                      <div className="w-20 h-20 rounded-lg bg-Amber/10 dark:bg-white/10 flex items-center justify-center text-Amber/60 dark:text-white/40 transition-all duration-300 group-hover:scale-110 group-hover:bg-Amber/15 dark:group-hover:bg-white/15">
                        {tool.icon}
                      </div>
                    </div>

                    {/* 标题和描述 */}
                    <h3 className="font-display text-heading text-Ink dark:text-white/90 tracking-wide text-center mb-4">
                      {t(tool.titleKey)}
                    </h3>
                    <p className="text-body text-Ink/50 dark:text-white/40 font-body leading-[1.8] text-center mb-6">
                      {t(tool.descKey)}
                    </p>

                    {/* 底部提示 */}
                    <div className="flex items-center justify-center gap-2 text-label text-Amber/50 dark:text-white/30 font-body tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span>{t('tools.clickToUse')}</span>
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
              <Wrench size={14} className="text-Amber/30 dark:text-white/20" />
              <div className="w-12 h-px bg-gradient-to-l from-transparent to-Amber/20 dark:to-white/20" />
            </div>
            <p className="text-label text-Ink/30 dark:text-white/20 font-body tracking-widest">
              {t('tools.moreTools')}
            </p>
          </motion.div>
        </div>
      </section>
    </>
  )
}
