import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, Star, MapPin, Map } from 'lucide-react'
import type { Offer } from './types'
import { defaultOfferTemplate, generateId } from './types'

interface OfferFormProps {
  offers: Offer[]
  onAdd: (offer: Offer) => void
  onDelete: (id: string) => void
  onUpdate: (offer: Offer) => void
  onMapClick: (offer: Offer) => void
}

export default function OfferForm({
  offers,
  onAdd,
  onDelete,
  onUpdate,
  onMapClick,
}: OfferFormProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<Offer>(defaultOfferTemplate())

  const startAdd = () => {
    setForm(defaultOfferTemplate())
    setIsAdding(true)
    setEditingId(null)
  }

  const startEdit = (offer: Offer) => {
    setForm({ ...offer })
    setEditingId(offer.id)
    setIsAdding(true)
  }

  const handleSave = () => {
    if (!form.companyName.trim()) return
    if (editingId) {
      onUpdate({ ...form, id: editingId })
    } else {
      onAdd({ ...form, id: generateId() })
    }
    setIsAdding(false)
    setEditingId(null)
  }

  const handleCancel = () => {
    setIsAdding(false)
    setEditingId(null)
  }

  const toggleFavorite = (offer: Offer) => {
    onUpdate({ ...offer, isFavorite: !offer.isFavorite })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-white/70 font-body text-sm tracking-wider">
          实习Offer（{offers.length}）
        </h3>
        <button
          onClick={startAdd}
          className="flex items-center gap-1.5 text-xs text-Amber/60 hover:text-Amber/80 font-body tracking-wider transition-colors px-3 py-1.5 rounded-full border border-Amber/20 hover:border-Amber/40"
        >
          <Plus size={12} />
          添加
        </button>
      </div>

      {offers.length === 0 && !isAdding && (
        <div className="text-center py-12 text-white/20 text-xs font-body tracking-wider">
          暂无Offer，点击添加
        </div>
      )}

      <div className="space-y-2">
        {offers.map((offer) => (
          <div
            key={offer.id}
            onClick={() => startEdit(offer)}
            className={`group relative flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-300 ${
              editingId === offer.id
                ? 'bg-white/5 border-white/20'
                : 'bg-white/[0.02] border-white/5 hover:border-white/10 hover:bg-white/5'
            }`}
          >
            <button
              onClick={(e) => {
                e.stopPropagation()
                toggleFavorite(offer)
              }}
              className={`shrink-0 transition-colors ${
                offer.isFavorite ? 'text-Amber/80' : 'text-white/10 hover:text-white/30'
              }`}
            >
              <Star size={14} fill={offer.isFavorite ? 'currentColor' : 'none'} />
            </button>
            <div className="flex-1 min-w-0">
              <p className="text-white/70 text-sm font-body truncate">
                {offer.companyName} · {offer.position}
              </p>
              <p className="text-white/30 text-xs font-body mt-0.5">
                {offer.salary}元/天 · {offer.commuteMinutes}min通勤
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDelete(offer.id)
              }}
              className="text-white/10 hover:text-red-400/70 transition-colors opacity-0 group-hover:opacity-100"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-4 rounded-xl border border-white/10 bg-white/[0.03] space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-white/40 text-xs font-body tracking-wider block mb-1">
                    公司名
                  </label>
                  <input
                    type="text"
                    value={form.companyName}
                    onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/80 font-body placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-colors"
                    placeholder="如：字节跳动"
                  />
                </div>
                <div>
                  <label className="text-white/40 text-xs font-body tracking-wider block mb-1">
                    岗位
                  </label>
                  <input
                    type="text"
                    value={form.position}
                    onChange={(e) => setForm({ ...form, position: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/80 font-body placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-colors"
                    placeholder="如：前端开发实习生"
                  />
                </div>
              </div>

              <div>
                <label className="text-white/40 text-xs font-body tracking-wider block mb-1">
                  公司地址
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/80 font-body placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-colors"
                    placeholder="如：浦东新区张江高科"
                  />
                  <button
                    onClick={() => onMapClick(form)}
                    className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white/40 hover:text-white/60 text-xs font-body tracking-wider transition-colors"
                  >
                    <Map size={12} />
                    地图
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-white/40 text-xs font-body tracking-wider block mb-1">
                    日薪（元/天）
                  </label>
                  <input
                    type="number"
                    min={50}
                    max={300}
                    value={form.salary}
                    onChange={(e) =>
                      setForm({ ...form, salary: Math.min(300, Math.max(50, Number(e.target.value) || 0)) })
                    }
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/80 font-body placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-white/40 text-xs font-body tracking-wider block mb-1">
                    通勤时长（分钟，单程）
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min={0}
                      max={180}
                      value={form.commuteMinutes}
                      onChange={(e) =>
                        setForm({ ...form, commuteMinutes: Math.min(180, Math.max(0, Number(e.target.value) || 0)) })
                      }
                      className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/80 font-body placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-colors"
                    />
                    <button
                      onClick={() => onMapClick(form)}
                      className="shrink-0 flex items-center gap-1 px-2 py-2 rounded-lg bg-white/5 border border-white/10 text-white/40 hover:text-white/60 transition-colors"
                    >
                      <MapPin size={12} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-white/40 text-xs font-body tracking-wider block mb-1">
                    工作强度（1-10）
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={form.workIntensity}
                    onChange={(e) => setForm({ ...form, workIntensity: Number(e.target.value) })}
                    className="w-full accent-Amber"
                  />
                  <div className="text-center text-white/50 text-xs font-body mt-1">
                    {form.workIntensity}/10
                  </div>
                </div>
                <div>
                  <label className="text-white/40 text-xs font-body tracking-wider block mb-1">
                    团队氛围（1-10）
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={form.teamAtmosphere}
                    onChange={(e) => setForm({ ...form, teamAtmosphere: Number(e.target.value) })}
                    className="w-full accent-Amber"
                  />
                  <div className="text-center text-white/50 text-xs font-body mt-1">
                    {form.teamAtmosphere}/10
                  </div>
                </div>
                <div>
                  <label className="text-white/40 text-xs font-body tracking-wider block mb-1">
                    发展前景（1-10）
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={form.growthProspect}
                    onChange={(e) => setForm({ ...form, growthProspect: Number(e.target.value) })}
                    className="w-full accent-Amber"
                  />
                  <div className="text-center text-white/50 text-xs font-body mt-1">
                    {form.growthProspect}/10
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleCancel}
                  className="flex-1 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 text-xs font-body tracking-wider transition-colors border border-white/10"
                >
                  取消
                </button>
                <button
                  onClick={handleSave}
                  disabled={!form.companyName.trim()}
                  className="flex-1 py-2.5 rounded-lg bg-Amber/20 hover:bg-Amber/30 disabled:bg-white/5 disabled:text-white/20 text-Amber/80 text-xs font-body tracking-wider transition-colors border border-Amber/20"
                >
                  {editingId ? '更新' : '添加'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
