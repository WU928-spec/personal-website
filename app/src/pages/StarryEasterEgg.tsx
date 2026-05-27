import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Play, Move, Pin, Settings, X, Plus, Trash2, Save, RotateCcw, Image, Upload, X as XIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { getMemoirs, saveMemoirs, resetMemoirs, type Memoir } from '@/data/memoirs'

const seededRandom = (seed: number) => {
  const x = Math.sin(seed * 127.1) * 43758.5453
  return x - Math.floor(x)
}

const getStarPos = (id: string) => {
  const n = parseInt(id, 10)
  let xPct = 10 + seededRandom(n * 1.1) * 80
  let yPct = 10 + seededRandom(n * 2.3) * 80
  const cx = Math.abs(xPct - 50)
  const cy = Math.abs(yPct - 50)
  if (cx < 12 && cy < 12) {
    xPct = xPct < 50 ? xPct - 15 : xPct + 15
  }
  return { x: `${xPct}%`, y: `${yPct}%` }
}

function DraggableStar({
  memoir,
  x,
  y,
  draggable,
}: {
  memoir: Memoir
  x: string
  y: string
  draggable: boolean
}) {
  const navigate = useNavigate()
  const [hovered, setHovered] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const size = 4 + memoir.brightness * 6

  return (
    <div className="absolute" style={{ left: x, top: y }}>
      <motion.button
        drag={draggable}
        dragMomentum={false}
        whileDrag={{ scale: 1.4, cursor: 'grabbing' }}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={() => setTimeout(() => setIsDragging(false), 50)}
        onClick={() => {
          if (!isDragging) navigate(`/starry/${memoir.id}`)
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={`relative z-10 ${draggable ? 'cursor-grab' : 'cursor-pointer'}`}
        style={{ x: '-50%', y: '-50%' }}
      >
        {/* 光晕 */}
        <span
          className="absolute rounded-full pointer-events-none"
          style={{
            width: size * 5,
            height: size * 5,
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            background: `radial-gradient(circle, rgba(180,210,255,${0.1 + memoir.brightness * 0.2}) 0%, rgba(100,150,255,0) 70%)`,
            animation: `starPulse ${2 + (1 - memoir.brightness) * 2}s ease-in-out infinite`,
            animationDelay: `${seededRandom(parseInt(memoir.id)) * -3}s`,
          }}
        />

        {/* 星星本体 */}
        <span
          className="relative block rounded-full"
          style={{
            width: size,
            height: size,
            background: hovered
              ? 'radial-gradient(circle, #fff 0%, #aaccff 100%)'
              : 'radial-gradient(circle, #e8f0ff 0%, #9bb8e8 100%)',
            boxShadow: hovered
              ? `0 0 ${size * 2}px ${size}px rgba(180,210,255,0.5), 0 0 ${size * 4}px ${size * 2}px rgba(100,150,255,0.15)`
              : `0 0 ${size}px ${size / 2}px rgba(180,210,255,${0.15 + memoir.brightness * 0.25}), 0 0 ${size * 3}px ${size}px rgba(100,150,255,${0.03 + memoir.brightness * 0.08})`,
            transition: 'box-shadow 0.3s ease, background 0.3s ease',
          }}
        />

        {/* Tooltip */}
        {hovered && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute left-1/2 -translate-x-1/2 mt-3 pointer-events-none whitespace-nowrap z-20"
          >
            <div className="bg-black/70 backdrop-blur-md border border-white/15 rounded-lg px-4 py-2">
              <p className="text-xs text-white/50 font-body">{memoir.date}</p>
            </div>
          </motion.div>
        )}
      </motion.button>
    </div>
  )
}

function MemoirManager({
  memoirs,
  onChange,
  onClose,
}: {
  memoirs: Memoir[]
  onChange: (m: Memoir[]) => void
  onClose: () => void
}) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState<Memoir | null>(null)
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  const startAdd = () => {
    const maxId = Math.max(0, ...memoirs.map((m) => parseInt(m.id, 10)))
    setEditingId('__new__')
    setDraft({
      id: String(maxId + 1),
      title: '',
      date: new Date().toISOString().slice(0, 10),
      content: '',
      brightness: 0.5,
      image: '',
    })
  }

  const startEdit = (m: Memoir) => {
    setEditingId(m.id)
    setDraft({ ...m })
  }

  const save = () => {
    if (!draft) return
    if (!draft.content.trim()) return
    if (editingId === '__new__') {
      onChange([...memoirs, draft])
    } else {
      onChange(memoirs.map((m) => (m.id === draft.id ? draft : m)))
    }
    setEditingId(null)
    setDraft(null)
  }

  const remove = (id: string) => {
    onChange(memoirs.filter((m) => m.id !== id))
    if (editingId === id) {
      setEditingId(null)
      setDraft(null)
    }
  }

  const handleReset = () => {
    resetMemoirs()
    onChange(getMemoirs())
    setShowResetConfirm(false)
    setEditingId(null)
    setDraft(null)
  }

  const isEditing = editingId !== null

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      className="absolute top-0 right-0 h-full w-full max-w-md bg-black/85 backdrop-blur-xl border-l border-white/10 z-40 flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
        <h2 className="text-white/90 font-body text-lg">记忆管理</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowResetConfirm(true)}
            className="p-2 rounded-full text-white/40 hover:text-red-400 hover:bg-white/5 transition-colors"
            title="重置为默认"
          >
            <RotateCcw size={16} />
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-white/40 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
        {/* Add button */}
        {!isEditing && (
          <button
            onClick={startAdd}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-white/20 text-white/50 hover:text-white/80 hover:border-white/40 hover:bg-white/5 transition-all"
          >
            <Plus size={16} />
            <span className="text-sm font-body">添加新星星</span>
          </button>
        )}

        {/* Edit form */}
        <AnimatePresence>
          {isEditing && draft && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3 overflow-hidden"
            >
              <div>
                <label className="text-xs text-white/40 font-body mb-1 block">标题</label>
                <input
                  type="text"
                  value={draft.title}
                  onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/30 transition-colors"
                  placeholder="记忆标题"
                />
              </div>
              <div>
                <label className="text-xs text-white/40 font-body mb-1 block">日期</label>
                <input
                  type="date"
                  value={draft.date}
                  onChange={(e) => setDraft({ ...draft, date: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-white/30 transition-colors [color-scheme:dark]"
                />
              </div>
              <div>
                <label className="text-xs text-white/40 font-body mb-1 block">
                  亮度 <span className="text-white/60">{Math.round(draft.brightness * 100)}%</span>
                </label>
                <input
                  type="range"
                  min={0.05}
                  max={1}
                  step={0.05}
                  value={draft.brightness}
                  onChange={(e) => setDraft({ ...draft, brightness: parseFloat(e.target.value) })}
                  className="w-full range-dark"
                />
                <div className="flex justify-between text-[10px] text-white/20 mt-1">
                  <span>暗淡</span>
                  <span>明亮</span>
                </div>
              </div>
              <div>
                <label className="text-xs text-white/40 font-body mb-1 block">图片</label>
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  id={`memoir-image-${editingId}`}
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    const reader = new FileReader()
                    reader.onload = (ev) => {
                      setDraft({ ...draft, image: ev.target?.result as string })
                    }
                    reader.readAsDataURL(file)
                  }}
                />
                {draft.image ? (
                  <div className="relative inline-block">
                    <img
                      src={draft.image}
                      alt="预览"
                      className="w-full max-h-40 object-contain rounded-lg border border-white/10 bg-white/5"
                    />
                    <button
                      onClick={() => setDraft({ ...draft, image: undefined })}
                      className="absolute -top-2 -right-2 p-1 rounded-full bg-black/70 text-white/60 hover:text-white border border-white/10"
                    >
                      <XIcon size={12} />
                    </button>
                  </div>
                ) : (
                  <label
                    htmlFor={`memoir-image-${editingId}`}
                    className="flex items-center justify-center gap-2 w-full py-6 rounded-lg border border-dashed border-white/15 text-white/40 hover:text-white/70 hover:border-white/30 hover:bg-white/5 cursor-pointer transition-all"
                  >
                    <Upload size={16} />
                    <span className="text-sm font-body">点击选取图片</span>
                  </label>
                )}
              </div>
              <div>
                <label className="text-xs text-white/40 font-body mb-1 block">内容</label>
                <textarea
                  value={draft.content}
                  onChange={(e) => setDraft({ ...draft, content: e.target.value })}
                  rows={5}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/30 transition-colors resize-none"
                  placeholder="写下这段记忆..."
                />
              </div>
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={save}
                  disabled={!draft.content.trim()}
                  className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-white/10 text-white/80 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm font-body"
                >
                  <Save size={14} />
                  保存
                </button>
                <button
                  onClick={() => {
                    if (editingId === '__new__') {
                      setEditingId(null)
                      setDraft(null)
                    } else {
                      setEditingId(null)
                      setDraft(null)
                    }
                  }}
                  className="px-4 py-2 rounded-lg border border-white/10 text-white/50 hover:text-white/80 hover:border-white/20 transition-colors text-sm font-body"
                >
                  取消
                </button>
                {editingId !== '__new__' && (
                  <button
                    onClick={() => editingId && remove(editingId)}
                    className="p-2 rounded-lg text-red-400/60 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                    title="删除"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* List */}
        {!isEditing &&
          memoirs.map((m) => (
            <div
              key={m.id}
              onClick={() => startEdit(m)}
              className="group flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/15 hover:bg-white/8 cursor-pointer transition-all"
            >
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{
                  background: `radial-gradient(circle, #e8f0ff 0%, #9bb8e8 100%)`,
                  boxShadow: `0 0 ${4 + m.brightness * 8}px ${2 + m.brightness * 4}px rgba(180,210,255,${0.2 + m.brightness * 0.3})`,
                }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white/80 font-body truncate">{m.title || <span className="italic text-white/40">无标题</span>}</p>
                <p className="text-xs text-white/30 font-body">{m.date}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {m.image && <Image size={12} className="text-white/30" />}
                <span className="text-[10px] text-white/20 font-body">
                  {Math.round(m.brightness * 100)}%
                </span>
              </div>
            </div>
          ))}
      </div>

      {/* Reset confirmation */}
      <AnimatePresence>
        {showResetConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center px-6"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-[#0a0a10] border border-white/10 rounded-2xl p-6 max-w-sm w-full"
            >
              <h3 className="text-white/90 font-body text-base mb-2">重置记忆？</h3>
              <p className="text-sm text-white/40 font-body mb-6">
                这将删除所有自定义添加和修改的记忆，恢复到初始的 12 颗星星。此操作不可撤销。
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleReset}
                  className="flex-1 py-2.5 rounded-lg bg-red-500/15 text-red-400 hover:bg-red-500/25 transition-colors text-sm font-body"
                >
                  确认重置
                </button>
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 py-2.5 rounded-lg border border-white/10 text-white/60 hover:text-white hover:border-white/20 transition-colors text-sm font-body"
                >
                  取消
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function StarryEasterEgg() {
  const navigate = useNavigate()
  const [showText, setShowText] = useState(false)
  const [showVideo, setShowVideo] = useState(false)
  const [draggable, setDraggable] = useState(true)
  const [showManager, setShowManager] = useState(false)
  const [memoirs, setMemoirs] = useState<Memoir[]>(getMemoirs)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const timer = setTimeout(() => setShowText(true), 400)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (showVideo && videoRef.current) {
      videoRef.current.play().catch(() => {})
    }
  }, [showVideo])

  const handleChange = (next: Memoir[]) => {
    setMemoirs(next)
    saveMemoirs(next)
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#050508]">
      {/* 背景图 */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url(/starry-bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* 全屏视频 */}
      <video
        ref={videoRef}
        src="/starry-video.mp4"
        muted
        playsInline
        className={`absolute inset-0 w-full h-full object-cover z-[1] transition-opacity duration-700 ${showVideo ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onEnded={() => setShowVideo(false)}
        onClick={() => setShowVideo(false)}
      />

      {/* 星星层 */}
      <div
        className={`absolute inset-0 z-10 transition-opacity duration-700 ${showVideo ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
      >
        {memoirs.map((m) => {
          const pos = getStarPos(m.id)
          return <DraggableStar key={m.id} memoir={m} x={pos.x} y={pos.y} draggable={draggable} />
        })}
      </div>

      {/* UI 层 */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 z-30 flex items-center gap-2 text-white/70 hover:text-white transition-colors duration-300 backdrop-blur-sm bg-white/5 px-4 py-2 rounded-full border border-white/10"
      >
        <ArrowLeft size={18} />
        <span className="text-sm font-body">返回</span>
      </motion.button>

      {showText && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
          className="absolute top-6 left-1/2 -translate-x-1/2 z-20 text-center pointer-events-none"
        >
          <p className="text-xs text-white/30 font-body tracking-widest uppercase">
            点击星星，阅读一段光年之外的记忆
          </p>
        </motion.div>
      )}

      {showText && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, delay: 0.6 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 text-center pointer-events-none max-w-md px-6"
        >
          <p className="text-sm text-white/25 font-body leading-relaxed">
            在距离太阳 59 亿公里的地方，有一颗心永远朝向它的伴星
          </p>
        </motion.div>
      )}

      {/* 切换拖动模式 */}
      <motion.button
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        onClick={() => setDraggable((v) => !v)}
        className="absolute top-6 right-6 z-30 flex items-center gap-2 text-white/60 hover:text-white transition-all duration-300 backdrop-blur-sm bg-white/5 px-4 py-2 rounded-full border border-white/10 hover:bg-white/10 hover:scale-105"
        title={draggable ? '切换为固定模式' : '切换为拖动模式'}
      >
        {draggable ? <Move size={16} /> : <Pin size={16} />}
        <span className="text-sm font-body">{draggable ? '可拖动' : '已固定'}</span>
      </motion.button>

      {/* 管理记忆按钮 */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0, duration: 0.8 }}
        onClick={() => setShowManager(true)}
        className="absolute bottom-24 left-8 z-30 flex items-center gap-2 text-white/60 hover:text-white transition-all duration-300 backdrop-blur-sm bg-white/5 px-5 py-3 rounded-full border border-white/10 hover:bg-white/10 hover:scale-105"
      >
        <Settings size={16} />
        <span className="text-sm font-body">管理记忆</span>
      </motion.button>

      {/* 播放视频按钮 */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        onClick={() => setShowVideo(true)}
        className="absolute bottom-24 right-8 z-30 flex items-center gap-2 text-white/60 hover:text-white transition-all duration-300 backdrop-blur-sm bg-white/5 px-5 py-3 rounded-full border border-white/10 hover:bg-white/10 hover:scale-105"
      >
        <Play size={16} fill="currentColor" />
        <span className="text-sm font-body">观看星轨</span>
      </motion.button>

      {/* 管理抽屉 */}
      <AnimatePresence>
        {showManager && (
          <MemoirManager
            memoirs={memoirs}
            onChange={handleChange}
            onClose={() => setShowManager(false)}
          />
        )}
      </AnimatePresence>

      <style>{`
        @keyframes starPulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.6; }
          50% { transform: translate(-50%, -50%) scale(1.3); opacity: 1; }
        }
        .range-dark {
          -webkit-appearance: none;
          appearance: none;
          height: 4px;
          background: rgba(255,255,255,0.12);
          border-radius: 2px;
          outline: none;
        }
        .range-dark::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #aaccff;
          cursor: pointer;
          box-shadow: 0 0 8px rgba(170,204,255,0.4);
        }
        .range-dark::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #aaccff;
          cursor: pointer;
          border: none;
          box-shadow: 0 0 8px rgba(170,204,255,0.4);
        }
      `}</style>
    </div>
  )
}
