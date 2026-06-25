import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useSpring } from 'framer-motion'
import { ArrowUp, Sparkles } from 'lucide-react'
import { sections, markCompleted } from '@/starry/epilogue-data'
import FloatingParticles from '@/starry/FloatingParticles'
import EpilogueSection from '@/starry/EpilogueSection'
import StarryNavBar from '@/starry/StarryNavBar'

export default function StarryEpilogue() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ container: containerRef })
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 })
  const [showBackTop, setShowBackTop] = useState(false)

  useEffect(() => {
    markCompleted()
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setShowBackTop(window.scrollY > 600)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050508]">
      {/* 星空背景 */}
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: 'url(/starry-bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* 暗角 + 整体氛围 */}
      <div className="fixed inset-0 z-[1] bg-gradient-to-b from-black/40 via-black/20 to-black/60" />

      <FloatingParticles />

      {/* 顶部滚动进度条 */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[2px] z-50 bg-gradient-to-r from-white/60 via-white/80 to-white/60 origin-left"
        style={{ scaleX }}
      />

      {/* 顶部标题 */}
      <div className="relative z-20 pt-[10vh] pb-12 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2 }}
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-8 h-px bg-gradient-to-r from-transparent to-white/30" />
            <Sparkles size={14} className="text-white/40" />
            <div className="w-8 h-px bg-gradient-to-l from-transparent to-white/30" />
          </div>
          <h1 className="text-white/95 font-body text-2xl md:text-3xl tracking-[0.4em] mb-3">
            致漓漓
          </h1>
          <div className="w-12 h-px bg-white/30 mx-auto" />
          <p className="mt-4 text-white/40 text-xs tracking-[0.25em]">
            彩蛋后记
          </p>
        </motion.div>
      </div>

      {/* 内容层 */}
      <div className="relative z-10 px-4 pb-40 md:px-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-black/20 backdrop-blur-sm rounded-2xl border border-white/[0.04] p-6 md:p-10">
            {sections.map((section, index) => (
              <EpilogueSection key={index} section={section} index={index} />
            ))}
          </div>
        </div>
      </div>

      {/* 回到顶部按钮 */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: showBackTop ? 1 : 0, scale: showBackTop ? 1 : 0.8 }}
        transition={{ duration: 0.3 }}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className={`fixed bottom-24 right-6 z-40 p-3 rounded-full backdrop-blur-sm bg-white/10 border border-white/10 text-white/60 hover:text-white hover:bg-white/15 transition-all duration-300 ${showBackTop ? 'pointer-events-auto' : 'pointer-events-none'}`}
        aria-label="回到顶部"
      >
        <ArrowUp size={18} />
      </motion.button>

      <StarryNavBar />
    </div>
  )
}
