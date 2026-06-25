import { motion } from 'framer-motion'
import { ArrowLeft, Home, BookOpen, Play } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function StarryNavBar() {
  const navigate = useNavigate()

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1, delay: 1.5 }}
      className="fixed bottom-6 left-0 right-0 z-30 flex items-center justify-center gap-2 px-4"
    >
      <button
        type="button"
        onClick={() => navigate('/starry')}
        className="group flex items-center gap-2 text-white/50 hover:text-white transition-all duration-300 backdrop-blur-sm bg-white/[0.03] hover:bg-white/10 px-4 py-2.5 rounded-full border border-white/[0.06] hover:border-white/15 hover:shadow-[0_0_15px_rgba(255,255,255,0.05)]"
      >
        <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
        <span className="text-xs font-body tracking-widest">返回星空</span>
      </button>

      <button
        type="button"
        onClick={() => navigate('/starry/secret')}
        className="group flex items-center gap-2 text-white/50 hover:text-white transition-all duration-300 backdrop-blur-sm bg-white/[0.03] hover:bg-white/10 px-4 py-2.5 rounded-full border border-white/[0.06] hover:border-white/15 hover:shadow-[0_0_15px_rgba(255,255,255,0.05)]"
      >
        <BookOpen size={15} />
        <span className="text-xs font-body tracking-widest">信件</span>
      </button>

      <button
        type="button"
        onClick={() => navigate('/starry', { state: { playVideo: true } })}
        className="group flex items-center gap-2 text-white/50 hover:text-white transition-all duration-300 backdrop-blur-sm bg-white/[0.03] hover:bg-white/10 px-4 py-2.5 rounded-full border border-white/[0.06] hover:border-white/15 hover:shadow-[0_0_15px_rgba(255,255,255,0.05)]"
      >
        <Play size={15} className="group-hover:scale-110 transition-transform" />
        <span className="text-xs font-body tracking-widest">星轨</span>
      </button>

      <button
        type="button"
        onClick={() => navigate('/')}
        className="group flex items-center gap-2 text-white/50 hover:text-white transition-all duration-300 backdrop-blur-sm bg-white/[0.03] hover:bg-white/10 px-4 py-2.5 rounded-full border border-white/[0.06] hover:border-white/15 hover:shadow-[0_0_15px_rgba(255,255,255,0.05)]"
      >
        <Home size={15} />
        <span className="text-xs font-body tracking-widest">首页</span>
      </button>
    </motion.div>
  )
}
