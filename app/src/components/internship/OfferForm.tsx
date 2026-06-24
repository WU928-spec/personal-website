import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, Star, MapPin, Map } from 'lucide-react'
import { useLang } from '@/contexts/PreferencesContext'
import type { Offer } from './types'
import { defaultOfferTemplate, generateId } from './types'

interface OfferFormProps {
  offers: Offer[]
  onAdd: (offer: Offer) => void
  onDelete: (id: string) => void
  onUpdate: (offer: Offer) => void
  onMapClick: (offer: Offer) => void
  mapCommuteResult?: { minutes: number } | null
}

export default function OfferForm({
  offers,
  onAdd,
  onDelete,
  onUpdate,
  onMapClick,
  mapCommuteResult,
}: OfferFormProps) {
  const { t } = useLang()
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<Offer>(defaultOfferTemplate())

  useEffect(() => {
    if (mapCommuteResult) {
      setForm((prev) => ({ ...prev, commuteMinutes: mapCommuteResult.minutes }))
    }
  }, [mapCommuteResult])

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
        <h3 className="text-Ink/70 dark:text-white/70 font-body text-sm tracking-wider">
          {t('internship.offers')}（{offers.length}）
        </h3>
        <button
          onClick={startAdd}
          className="flex items-center gap-1.5 text-xs text-Amber/60 hover:text-Amber/80 font-body tracking-wider transition-colors px-3 py-1.5 rounded-full border border-Amber/20 hover:border-Amber/40"
        >
          <Plus size={12} />
          {t('internship.add')}
        </button>
      </div>

      {offers.length === 0 && !isAdding && (
        <div className="text-center py-12 text-Ink/30 dark:text-white/20 text-xs font-body tracking-wider">
          {t('internship.noOffers')}
        </div>
      )}

      <div className="space-y-2">
        {offers.map((offer) => (
          <div
            key={offer.id}
            onClick={() => startEdit(offer)}
            className={`group relative flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-300 ${
              editingId === offer.id
                ? 'bg-white/50 dark:bg-white/5 border-Amber/20 dark:border-white/20'
                : 'bg-white/40 dark:bg-white/[0.02] border-Amber/10 dark:border-white/5 hover:border-Amber/20 dark:hover:border-white/10 hover:bg-white/60 dark:hover:bg-white/5'
            }`}
          >
            <button
              onClick={(e) => {
                e.stopPropagation()
                toggleFavorite(offer)
              }}
              className={`shrink-0 transition-colors ${
                offer.isFavorite ? 'text-Amber/80' : 'text-Ink/20 dark:text-white/10 hover:text-Ink/40 dark:hover:text-white/30'
              }`}
            >
              <Star size={14} fill={offer.isFavorite ? 'currentColor' : 'none'} />
            </button>
            <div className="flex-1 min-w-0">
              <p className="text-Ink/70 dark:text-white/70 text-sm font-body truncate">
                {offer.companyName} · {offer.position}
              </p>
              <p className="text-Ink/40 dark:text-white/30 text-xs font-body mt-0.5">
                {offer.salary}{t('internship.dailySalaryUnit')} · {offer.commuteMinutes}min{t('internship.commute')}
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDelete(offer.id)
              }}
              className="text-Ink/20 dark:text-white/10 hover:text-red-400/70 transition-colors opacity-0 group-hover:opacity-100"
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
            <div className="p-4 rounded-xl border border-Amber/10 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-Ink/50 dark:text-white/40 text-xs font-body tracking-wider block mb-1">
                    {t('internship.companyName')}
                  </label>
                  <input
                    type="text"
                    value={form.companyName}
                    onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                    className="w-full bg-white/70 dark:bg-white/5 border border-Amber/10 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-Ink/80 dark:text-white/80 font-body placeholder:text-Ink/30 dark:placeholder:text-white/20 focus:outline-none focus:border-Amber/30 dark:focus:border-white/30 transition-colors"
                    placeholder={t('internship.companyName')}
                  />
                </div>
                <div>
                  <label className="text-Ink/50 dark:text-white/40 text-xs font-body tracking-wider block mb-1">
                    {t('internship.position')}
                  </label>
                  <input
                    type="text"
                    value={form.position}
                    onChange={(e) => setForm({ ...form, position: e.target.value })}
                    className="w-full bg-white/70 dark:bg-white/5 border border-Amber/10 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-Ink/80 dark:text-white/80 font-body placeholder:text-Ink/30 dark:placeholder:text-white/20 focus:outline-none focus:border-Amber/30 dark:focus:border-white/30 transition-colors"
                    placeholder={t('internship.position')}
                  />
                </div>
              </div>

              <div>
                <label className="text-Ink/50 dark:text-white/40 text-xs font-body tracking-wider block mb-1">
                  {t('internship.companyAddress')}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    className="flex-1 bg-white/70 dark:bg-white/5 border border-Amber/10 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-Ink/80 dark:text-white/80 font-body placeholder:text-Ink/30 dark:placeholder:text-white/20 focus:outline-none focus:border-Amber/30 dark:focus:border-white/30 transition-colors"
                    placeholder={t('internship.companyAddress')}
                  />
                  <button
                    onClick={() => onMapClick(form)}
                    className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/70 dark:bg-white/5 border border-Amber/10 dark:border-white/10 text-Ink/50 dark:text-white/40 hover:text-Ink/70 dark:hover:text-white/60 text-xs font-body tracking-wider transition-colors"
                  >
                    <Map size={12} />
                    {t('internship.map')}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-Ink/50 dark:text-white/40 text-xs font-body tracking-wider block mb-1">
                    {t('internship.dailySalaryUnit')}
                  </label>
                  <input
                    type="number"
                    min={50}
                    max={300}
                    value={form.salary}
                    onChange={(e) =>
                      setForm({ ...form, salary: Number(e.target.value) || 0 })
                    }
                    onBlur={(e) => {
                      const v = Number(e.target.value) || 0
                      setForm({ ...form, salary: Math.min(300, Math.max(50, v)) })
                    }}
                    className="w-full bg-white/70 dark:bg-white/5 border border-Amber/10 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-Ink/80 dark:text-white/80 font-body placeholder:text-Ink/30 dark:placeholder:text-white/20 focus:outline-none focus:border-Amber/30 dark:focus:border-white/30 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
                <div>
                  <label className="text-Ink/50 dark:text-white/40 text-xs font-body tracking-wider block mb-1">
                    {t('internship.commuteDuration')}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min={0}
                      max={180}
                      value={form.commuteMinutes}
                      onChange={(e) =>
                        setForm({ ...form, commuteMinutes: Number(e.target.value) || 0 })
                      }
                      onBlur={(e) => {
                        const v = Number(e.target.value) || 0
                        setForm({ ...form, commuteMinutes: Math.min(180, Math.max(0, v)) })
                      }}
                      className="flex-1 bg-white/70 dark:bg-white/5 border border-Amber/10 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-Ink/80 dark:text-white/80 font-body placeholder:text-Ink/30 dark:placeholder:text-white/20 focus:outline-none focus:border-Amber/30 dark:focus:border-white/30 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <button
                      onClick={() => onMapClick(form)}
                      className="shrink-0 flex items-center gap-1 px-2 py-2 rounded-lg bg-white/70 dark:bg-white/5 border border-Amber/10 dark:border-white/10 text-Ink/50 dark:text-white/40 hover:text-Ink/70 dark:hover:text-white/60 transition-colors"
                    >
                      <MapPin size={12} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-Ink/50 dark:text-white/40 text-xs font-body tracking-wider block mb-1">
                    {t('internship.workIntensity')}（1-10）
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={form.workIntensity}
                    onChange={(e) => setForm({ ...form, workIntensity: Number(e.target.value) })}
                    className="w-full accent-Amber"
                  />
                  <div className="text-center text-Ink/50 dark:text-white/50 text-xs font-body mt-1">
                    {form.workIntensity}/10
                  </div>
                </div>
                <div>
                  <label className="text-Ink/50 dark:text-white/40 text-xs font-body tracking-wider block mb-1">
                    {t('internship.teamAtmosphere')}（1-10）
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={form.teamAtmosphere}
                    onChange={(e) => setForm({ ...form, teamAtmosphere: Number(e.target.value) })}
                    className="w-full accent-Amber"
                  />
                  <div className="text-center text-Ink/50 dark:text-white/50 text-xs font-body mt-1">
                    {form.teamAtmosphere}/10
                  </div>
                </div>
                <div>
                  <label className="text-Ink/50 dark:text-white/40 text-xs font-body tracking-wider block mb-1">
                    {t('internship.developmentProspect')}（1-10）
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={form.growthProspect}
                    onChange={(e) => setForm({ ...form, growthProspect: Number(e.target.value) })}
                    className="w-full accent-Amber"
                  />
                  <div className="text-center text-Ink/50 dark:text-white/50 text-xs font-body mt-1">
                    {form.growthProspect}/10
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleCancel}
                  className="flex-1 py-2.5 rounded-lg bg-white/70 dark:bg-white/5 hover:bg-white/90 dark:hover:bg-white/10 text-Ink/50 dark:text-white/50 text-xs font-body tracking-wider transition-colors border border-Amber/10 dark:border-white/10"
                >
                  {t('internship.cancel')}
                </button>
                <button
                  onClick={handleSave}
                  disabled={!form.companyName.trim()}
                  className="flex-1 py-2.5 rounded-lg bg-Amber/20 hover:bg-Amber/30 disabled:bg-white/50 dark:disabled:bg-white/5 disabled:text-Ink/30 dark:disabled:text-white/20 text-Amber/80 text-xs font-body tracking-wider transition-colors border border-Amber/20"
                >
                  {editingId ? t('internship.update') : t('internship.save')}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
