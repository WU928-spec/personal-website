import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Trash2, Save, RotateCcw, Image, Upload, X as XIcon } from 'lucide-react'
import { getMemoirs, resetMemoirs, type Memoir } from '@/data/memoirs'
import { compressImage } from '@/utils/starry'

interface MemoirManagerProps {
  memoirs: Memoir[]
  onChange: (m: Memoir[]) => void
  onClose: () => void
  saveError?: string | null
}

export default function MemoirManager({
  memoirs,
  onChange,
  onClose,
  saveError,
}: MemoirManagerProps) {
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
      images: [],
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

  const handleReset = async () => {
    await resetMemoirs()
    const refreshed = await getMemoirs()
    onChange(refreshed)
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
          {saveError && (
            <span className="text-[11px] text-red-400/80 font-body mr-1 max-w-[140px] truncate" title={saveError}>
              {saveError}
            </span>
          )}
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
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    const reader = new FileReader()
                    reader.onload = async (ev) => {
                      const raw = ev.target?.result as string
                      try {
                        const compressed = await compressImage(raw)
                        setDraft((prev) => ({
                          ...prev!,
                          images: [...(prev?.images || []), compressed],
                        }))
                      } catch {
                        setDraft((prev) => ({
                          ...prev!,
                          images: [...(prev?.images || []), raw],
                        }))
                      }
                    }
                    reader.readAsDataURL(file)
                    e.target.value = ''
                  }}
                />
                <div className="flex flex-wrap gap-2 mb-2">
                  {(draft.images || []).map((img, i) => (
                    <div key={i} className="relative">
                      <img
                        src={img}
                        alt={`预览 ${i + 1}`}
                        className="w-16 h-16 object-cover rounded border border-white/10"
                      />
                      <button
                        onClick={() =>
                          setDraft((prev) => ({
                            ...prev!,
                            images: (prev?.images || []).filter((_, idx) => idx !== i),
                          }))
                        }
                        className="absolute -top-1.5 -right-1.5 p-0.5 rounded-full bg-black/70 text-white/60 hover:text-white border border-white/10"
                      >
                        <XIcon size={10} />
                      </button>
                    </div>
                  ))}
                </div>
                <label
                  htmlFor={`memoir-image-${editingId}`}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-lg border border-dashed border-white/15 text-white/40 hover:text-white/70 hover:border-white/30 hover:bg-white/5 cursor-pointer transition-all"
                >
                  <Upload size={16} />
                  <span className="text-sm font-body">添加图片</span>
                </label>
              </div>
              <div>
                <label className="text-xs text-white/40 font-body mb-1 block">内容</label>
                <textarea
                  value={draft.content}
                  onChange={(e) => setDraft({ ...draft, content: e.target.value })}
                  rows={5}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/30 transition-colors resize-none"
                  placeholder="写下这段记忆...（按回车分段，或长文自动分段）"
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
                    setEditingId(null)
                    setDraft(null)
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
                {(m.images?.length || 0) > 0 && (
                  <span className="flex items-center gap-1 text-white/30">
                    <Image size={12} />
                    <span className="text-[10px]">{m.images?.length}</span>
                  </span>
                )}
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
