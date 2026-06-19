import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { getMemoirs, getStarrySecret } from '@/data/memoirs'

const CLICKED_KEY = 'starry-bright-clicked'

function loadClickedIds(): Set<string> {
  try {
    const raw = localStorage.getItem(CLICKED_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) return new Set(parsed)
    }
  } catch {
    // ignore
  }
  return new Set()
}

export default function StarrySecret() {
  const navigate = useNavigate()
  const [message, setMessage] = useState<string | null>(null)
  const [verified, setVerified] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getMemoirs(), getStarrySecret()]).then(([memoirs, secret]) => {
      const brightIds = memoirs.filter((m) => m.brightness >= 1).map((m) => m.id)
      const clickedIds = loadClickedIds()
      const allClicked = brightIds.length > 0 && brightIds.every((id) => clickedIds.has(id))

      if (!allClicked) {
        navigate('/starry', { replace: true })
        return
      }

      setMessage(secret)
      setVerified(true)
      setLoading(false)
    })
  }, [navigate])

  if (loading || !verified) {
    return (
      <div className="relative w-screen h-screen overflow-hidden bg-[#050508] flex items-center justify-center">
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: 'url(/starry-bg.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="relative z-10 text-white/30 text-sm font-body tracking-widest">正在展开这封信…</div>
      </div>
    )
  }

  return (
    <div className="relative w-screen min-h-screen overflow-hidden bg-[#050508]">
      {/* 背景 */}
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: 'url(/starry-bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* 暗角 */}
      <div className="fixed inset-0 z-[1] pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(5,5,8,0.6)_100%)]" />

      {/* 返回按钮 */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        onClick={() => navigate('/starry')}
        className="fixed top-6 left-6 z-30 flex items-center gap-2 text-white/70 hover:text-white transition-colors duration-300 backdrop-blur-sm bg-white/5 px-4 py-2 rounded-full border border-white/10"
      >
        <ArrowLeft size={18} />
        <span className="text-sm font-body">返回星空</span>
      </motion.button>

      {/* 信纸 */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: 'easeOut' }}
        className="relative z-20 flex items-center justify-center min-h-screen px-6 py-28"
      >
        <div className="relative w-full max-w-2xl bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
          {/* 顶部装饰线 */}
          <div className="h-1 w-full bg-gradient-to-r from-transparent via-white/30 to-transparent" />

          <div className="px-8 py-12 md:px-14 md:py-16">
            {/* 称呼 */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="text-white/40 text-sm font-body tracking-widest mb-8"
            >
              致 点亮整片星空的你
            </motion.p>

            {/* 正文 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 1.2 }}
              className="text-white/80 font-body text-[1.0625rem] md:text-[1.125rem] leading-[2.2] whitespace-pre-line"
            >
              {message}
            </motion.div>

            {/* 落款 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4, duration: 1 }}
              className="mt-14 text-right"
            >
              <p className="text-white/40 text-sm font-body tracking-widest">—— 冥王星</p>
            </motion.div>
          </div>

          {/* 底部装饰线 */}
          <div className="h-1 w-full bg-gradient-to-r from-transparent via-white/30 to-transparent" />
        </div>
      </motion.div>
    </div>
  )
}
