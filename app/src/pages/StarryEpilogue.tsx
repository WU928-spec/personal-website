import { motion } from 'framer-motion'
import { ArrowLeft, Home } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useBackgroundMusic } from '@/hooks/useBackgroundMusic'

export default function StarryEpilogue() {
  const navigate = useNavigate()
  useBackgroundMusic('/bg-music.mp3')

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#050508]">
      {/* 星空背景 */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url(/starry-bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* 暗角 */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-black/30 via-transparent to-black/50" />

      {/* 内容层 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
        className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6"
      >
        <div className="max-w-2xl w-full text-center space-y-8">
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="text-white/90 font-body text-xl md:text-2xl tracking-[0.3em]"
          >
            彩蛋后记
          </motion.h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 0.6 }}
            className="space-y-6 text-white/70 font-body text-sm md:text-base leading-[1.9] tracking-wide"
          >
            <p>
              谢谢你走到这里。
            </p>
            <p>
              这片星空本是我一个人的秘密，但当你点亮第十四颗星时，它也成了我们共同见证过的光。
            </p>
            <p>
              那些散落的故事、未说出口的话、以及所有笨拙的温柔，都被我藏进了这些星轨里。
              如果你曾在某一句话前停留，那便是它们存在的意义。
            </p>
            <p className="text-white/50 text-xs tracking-widest pt-4">
              —— 作者
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* 导航按钮 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.2 }}
        className="absolute bottom-10 left-0 right-0 z-20 flex items-center justify-center gap-4"
      >
        <button
          type="button"
          onClick={() => navigate('/starry')}
          className="flex items-center gap-2 text-white/60 hover:text-white transition-colors duration-300 backdrop-blur-sm bg-white/5 px-5 py-2.5 rounded-full border border-white/10"
        >
          <ArrowLeft size={16} />
          <span className="text-sm font-body tracking-widest">返回星空</span>
        </button>

        <button
          type="button"
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-white/60 hover:text-white transition-colors duration-300 backdrop-blur-sm bg-white/5 px-5 py-2.5 rounded-full border border-white/10"
        >
          <Home size={16} />
          <span className="text-sm font-body tracking-widest">回到首页</span>
        </button>
      </motion.div>
    </div>
  )
}
