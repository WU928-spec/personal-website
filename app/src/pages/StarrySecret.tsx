import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { getMemoirs, getStarrySecret, type StarrySecret } from '@/data/memoirs'

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
  const [secret, setSecret] = useState<StarrySecret | null>(null)
  const [verified, setVerified] = useState(false)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)

  useEffect(() => {
    Promise.all([getMemoirs(), getStarrySecret()]).then(([memoirs, secretData]) => {
      const brightIds = memoirs.filter((m) => m.brightness >= 1).map((m) => m.id)
      const clickedIds = loadClickedIds()
      const allClicked = brightIds.length > 0 && brightIds.every((id) => clickedIds.has(id))

      if (!allClicked) {
        navigate('/starry', { replace: true })
        return
      }

      setSecret(secretData)
      setVerified(true)
      setLoading(false)
    })
  }, [navigate])

  // 键盘翻页
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') setPage((p) => Math.max(0, p - 1))
      if (e.key === 'ArrowRight') setPage((p) => Math.min((secret?.pages.length ?? 1) - 1, p + 1))
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [secret?.pages.length])

  const pages = secret?.pages ?? []
  const total = pages.length
  const hasPrev = page > 0
  const hasNext = page < total - 1

  if (loading || !verified) {
    return (
      <div className="relative w-screen h-screen flex items-center justify-center bg-[#f5f3ef]">
        <div className="text-[#8c857c] text-sm font-body tracking-widest">正在展开这封信…</div>
      </div>
    )
  }

  if (total === 0) {
    return (
      <div className="relative w-screen h-screen flex items-center justify-center bg-[#f5f3ef]">
        <div className="text-[#8c857c] text-sm font-body">信纸是空的</div>
      </div>
    )
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#f5f3ef] flex flex-col items-center justify-center p-6">
      {/* 信件容器：A4 比例，固定最大尺寸 */}
      <div className="relative w-full max-w-[min(90vw,560px)]" style={{ aspectRatio: '210 / 297' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={page}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            className="absolute inset-0 bg-white shadow-[0_12px_40px_rgba(0,0,0,0.08)] rounded-sm p-[clamp(1.5rem,8vw,3.5rem)] flex flex-col"
          >
            {/* 信纸顶部装饰线 */}
            <div className="w-full h-px bg-[#e2ddd4] mb-8" />

            {/* 称呼 / 标题 */}
            {secret?.title && (
              <h1 className="text-[#4a443d] font-body text-[clamp(1rem,4vw,1.25rem)] tracking-widest mb-8">
                {secret.title}
              </h1>
            )}

            {/* 正文 */}
            <div className="flex-1 overflow-hidden">
              <p className="text-[#3d3832] font-body text-[clamp(0.95rem,3.6vw,1.125rem)] leading-[2.2] whitespace-pre-line">
                {pages[page]}
              </p>
            </div>

            {/* 页码 */}
            <div className="mt-8 text-right text-[#a8a095] text-xs font-body tracking-widest">
              {page + 1} / {total}
            </div>

            {/* 信纸底部装饰线 */}
            <div className="w-full h-px bg-[#e2ddd4] mt-6" />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 翻页控制 */}
      <div className="mt-8 flex items-center gap-6 z-10">
        <button
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          disabled={!hasPrev}
          className="flex items-center gap-1 text-[#6b655e] hover:text-[#3d3832] disabled:text-[#c9c3ba] transition-colors font-body text-sm"
        >
          <ChevronLeft size={18} />
          <span>上一页</span>
        </button>

        <button
          onClick={() => navigate('/starry')}
          className="text-[#8c857c] hover:text-[#4a443d] transition-colors font-body text-sm tracking-widest"
        >
          返回星空
        </button>

        <button
          onClick={() => setPage((p) => Math.min(total - 1, p + 1))}
          disabled={!hasNext}
          className="flex items-center gap-1 text-[#6b655e] hover:text-[#3d3832] disabled:text-[#c9c3ba] transition-colors font-body text-sm"
        >
          <span>下一页</span>
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  )
}
