import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useLang } from '@/contexts/PreferencesContext'
import PageSEO from '@/components/PageSEO'

export default function GitCondaGuide() {
  const navigate = useNavigate()
  const { t: _t } = useLang()

  useEffect(() => {
    // 自动跳转到幻灯片页面
    window.location.href = '/git-conda-guide/index.html'
  }, [])

  // 如果跳转失败，显示备用界面
  return (
    <>
      <PageSEO
        title="Git & Conda 开发工具指南"
        description="交互式 Git 与 Conda 可视化教学幻灯片，涵盖版本控制与虚拟环境管理的完整命令参考。"
      />
      <section className="min-h-[calc(100dvh-4rem)] bg-Parchment dark:bg-Graphite px-6 py-20 relative">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="font-display text-heading text-Ink dark:text-white mb-6">
              Git & Conda 开发工具指南
            </h1>
            <p className="text-body text-Ink/50 dark:text-white/40 font-body mb-8">
              正在打开交互式幻灯片...
            </p>
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => navigate('/tools')}
                className="flex items-center gap-2 px-6 py-3 rounded-lg border border-Amber/20 dark:border-white/10 text-Ink/60 dark:text-white/50 hover:border-Amber/40 dark:hover:border-white/30 transition-colors"
              >
                <ArrowLeft size={16} />
                返回工具箱
              </button>
              <a
                href="/git-conda-guide/index.html"
                className="flex items-center gap-2 px-6 py-3 rounded-lg bg-Amber/20 text-Amber/80 hover:bg-Amber/30 transition-colors border border-Amber/20"
              >
                <ExternalLink size={16} />
                打开幻灯片
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  )
}
