import { useState } from 'react'
import { motion } from 'framer-motion'
import { Terminal, GitBranch, Box } from 'lucide-react'
import { useLang } from '@/contexts/PreferencesContext'
import PageSEO from '@/components/PageSEO'
import GitVisualizer from '@/components/dev-tools/GitVisualizer'
import CondaVisualizer from '@/components/dev-tools/CondaVisualizer'

export default function DevTools() {
  const { t } = useLang()
  const [activeTab, setActiveTab] = useState<'git' | 'conda'>('git')

  return (
    <>
      <PageSEO
        title={t('devtools.title')}
        description={t('devtools.description')}
      />

      <section className="min-h-[calc(100dvh-4rem)] bg-Parchment dark:bg-[#050508] px-4 py-12 md:px-8 relative overflow-hidden">
        {/* 背景装饰 */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-Amber/20 dark:bg-white/10"
              style={{
                left: `${10 + i * 15}%`,
                top: `${20 + (i % 3) * 25}%`,
              }}
              animate={{
                opacity: [0.1, 0.3, 0.1],
                scale: [1, 1.5, 1],
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
          {/* 标题 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-10 h-px bg-gradient-to-r from-transparent to-Amber/40 dark:to-white/30" />
              <Terminal size={16} className="text-Ink/40 dark:text-white/40" />
              <div className="w-10 h-px bg-gradient-to-l from-transparent to-Amber/40 dark:to-white/30" />
            </div>

            <h1 className="font-display text-[clamp(2rem,5vw,3rem)] font-semibold leading-[1.1] tracking-[-0.02em] text-Ink dark:text-white/90">
              {t('devtools.title')}
            </h1>

            <div className="mt-4 mx-auto w-16 h-0.5 bg-gradient-to-r from-transparent via-Amber/60 dark:via-white/30 to-transparent rounded-full" />

            <p className="mt-6 max-w-lg mx-auto text-sm text-Ink/50 dark:text-white/30 font-body leading-relaxed tracking-wide">
              {t('devtools.description')}
            </p>
          </motion.div>

          {/* Tab 切换 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="flex justify-center mb-8"
          >
            <div className="inline-flex rounded-lg border border-Amber/10 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] p-1">
              <button
                onClick={() => setActiveTab('git')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-body tracking-wider transition-all ${
                  activeTab === 'git'
                    ? 'bg-Amber/20 text-Amber/80'
                    : 'text-Ink/40 dark:text-white/30 hover:text-Ink/60 dark:hover:text-white/50'
                }`}
              >
                <GitBranch size={14} />
                Git
              </button>
              <button
                onClick={() => setActiveTab('conda')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-body tracking-wider transition-all ${
                  activeTab === 'conda'
                    ? 'bg-Amber/20 text-Amber/80'
                    : 'text-Ink/40 dark:text-white/30 hover:text-Ink/60 dark:hover:text-white/50'
                }`}
              >
                <Box size={14} />
                Conda
              </button>
            </div>
          </motion.div>

          {/* 内容区 */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {activeTab === 'git' ? <GitVisualizer /> : <CondaVisualizer />}
          </motion.div>
        </div>
      </section>
    </>
  )
}
