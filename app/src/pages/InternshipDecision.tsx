import { useNavigate } from 'react-router-dom'
import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Briefcase, Sparkles, TrendingUp, MapPin, Clock, ArrowLeft } from 'lucide-react'
import { useLang } from '@/contexts/PreferencesContext'
import PageSEO from '@/components/PageSEO'
import type { Offer } from '@/components/internship/types'
import { loadOffers, saveOffers, calcTotalScore, loadCommuteCache, saveCommuteCache } from '@/components/internship/types'
import OfferForm from '@/components/internship/OfferForm'
import ScoreMatrix from '@/components/internship/ScoreMatrix'
import ResultCharts from '@/components/internship/ResultCharts'
import MapCommuteModal from '@/components/internship/MapCommuteModal'

export default function InternshipDecision() {
  const navigate = useNavigate()
  const { t } = useLang()
  const [offers, setOffers] = useState<Offer[]>(loadOffers)
  const [homeAddress, setHomeAddress] = useState(() => loadCommuteCache().homeAddress)
  const [mapCommuteResult, setMapCommuteResult] = useState<{ minutes: number } | null>(null)
  const [mapOpen, setMapOpen] = useState(false)
  const [mapOffer, setMapOffer] = useState<Offer | null>(null)

  const handleHomeAddressChange = (value: string) => {
    setHomeAddress(value)
    saveCommuteCache({ ...loadCommuteCache(), homeAddress: value })
  }

  const handleAdd = useCallback((offer: Offer) => {
    setOffers((prev) => {
      const next = [...prev, offer]
      saveOffers(next)
      return next
    })
  }, [])

  const handleDelete = useCallback((id: string) => {
    setOffers((prev) => {
      const next = prev.filter((o) => o.id !== id)
      saveOffers(next)
      return next
    })
  }, [])

  const handleUpdate = useCallback((offer: Offer) => {
    setOffers((prev) => {
      const next = prev.map((o) => (o.id === offer.id ? offer : o))
      saveOffers(next)
      return next
    })
  }, [])

  const handleMapClick = useCallback((offer: Offer) => {
    setMapOffer(offer)
    setMapOpen(true)
  }, [])

  const handleMapConfirm = useCallback((minutes: number) => {
    if (mapOffer) {
      handleUpdate({ ...mapOffer, commuteMinutes: minutes })
    }
    setMapCommuteResult({ minutes })
    setMapOpen(false)
    setMapOffer(null)
  }, [mapOffer, handleUpdate])

  const topOffer = offers.length > 0
    ? [...offers].sort((a, b) => calcTotalScore(b) - calcTotalScore(a))[0]
    : null

  return (
    <>
      <PageSEO
        title={t('internship.title')}
        description={t('internship.subtitle')}
      />

      <MapCommuteModal
        isOpen={mapOpen}
        onClose={() => setMapOpen(false)}
        onConfirm={handleMapConfirm}
        homeAddress={homeAddress}
        defaultDestination={mapOffer?.location || ''}
      />

      <section className="min-h-[calc(100dvh-4rem)] bg-Parchment dark:bg-[#050508] px-4 py-12 md:px-8 relative overflow-hidden">
        {/* 背景装饰光点 */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-Amber/20 dark:bg-white/10"
              style={{
                left: `${10 + i * 15}%`,
                top: `${20 + (i % 3) * 25}%`,
              }}
              animate={{
                opacity: [0.1, 0.3, 0.1],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 4 + i * 0.6,
                repeat: Infinity,
                delay: i * 0.8,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>

        <div className="max-w-5xl mx-auto relative z-10">
          {/* 返回按钮 */}
          <button
            onClick={() => navigate('/tools')}
            className="flex items-center gap-1.5 text-sm text-Slate hover:text-Amber transition-colors mb-4"
          >
            <ArrowLeft size={16} />
            {t('tools.title')}
          </button>

          {/* 标题 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-10 h-px bg-gradient-to-r from-transparent to-Amber/40 dark:to-white/30" />
              <Sparkles size={16} className="text-Ink/40 dark:text-white/40" />
              <div className="w-10 h-px bg-gradient-to-l from-transparent to-Amber/40 dark:to-white/30" />
            </div>

            <h1 className="font-display text-[clamp(2rem,5vw,3rem)] font-semibold leading-[1.1] tracking-[-0.02em] text-Ink dark:text-white/90">
              {t('internship.title')}
            </h1>

            <div className="mt-4 mx-auto w-16 h-0.5 bg-gradient-to-r from-transparent via-Amber/60 dark:via-white/30 to-transparent rounded-full" />

            <p className="mt-6 max-w-lg mx-auto text-sm text-Ink/50 dark:text-white/30 font-body leading-relaxed tracking-wide">
              {t('internship.description')}
            </p>

            {topOffer && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="mt-6 inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/70 dark:bg-white/5 border border-Amber/10 dark:border-white/10"
              >
                <TrendingUp size={14} className="text-green-500/60 dark:text-green-400/60" />
                <span className="text-Ink/50 dark:text-white/50 text-xs font-body tracking-wider">
                  {t('internship.currentRecommendation')}:<span className="text-Ink/70 dark:text-white/70">{topOffer.companyName}</span> · {calcTotalScore(topOffer).toFixed(1)}{t('internship.points')}
                </span>
              </motion.div>
            )}

            {/* 我的住处 */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="mt-6 max-w-md mx-auto"
            >
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/70 dark:bg-white/5 border border-Amber/10 dark:border-white/10">
                <MapPin size={14} className="text-Amber/60 shrink-0" />
                <input
                  type="text"
                  value={homeAddress}
                  onChange={(e) => handleHomeAddressChange(e.target.value)}
                  placeholder={t('internship.origin')}
                  className="flex-1 bg-transparent text-sm text-Ink/80 dark:text-white/80 font-body placeholder:text-Ink/30 dark:placeholder:text-white/20 focus:outline-none"
                />
              </div>
            </motion.div>
          </motion.div>

          {/* 权重说明 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mb-10 p-5 rounded-2xl border border-Amber/10 dark:border-white/5 bg-white/70 dark:bg-white/[0.02]"
          >
            <h3 className="text-Ink/50 dark:text-white/50 text-xs font-body tracking-wider mb-4">
              {t('internship.scoringWeights')}
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <WeightCard
                icon={<Briefcase size={14} className="text-green-500/60 dark:text-green-400/60" />}
                label={t('internship.dailySalary')}
                value="25%"
                description={t('internship.salaryDesc')}
              />
              <WeightCard
                icon={<Clock size={14} className="text-blue-500/60 dark:text-blue-400/60" />}
                label={t('internship.workExperience')}
                value="40%"
                description={t('internship.experienceDesc')}
              />
              <WeightCard
                icon={<MapPin size={14} className="text-Amber/60" />}
                label={t('internship.growthProspect')}
                value="35%"
                description={t('internship.prospectDesc')}
              />
            </div>
          </motion.div>

          {/* 通勤公式说明 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mb-10 p-4 rounded-xl border border-Amber/10 dark:border-white/5 bg-white/70 dark:bg-white/[0.02]"
          >
            <p className="text-Ink/40 dark:text-white/30 text-xs font-body leading-[1.8]">
              {t('internship.formulaText')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 左侧：Offer管理 */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <OfferForm
                offers={offers}
                onAdd={handleAdd}
                onDelete={handleDelete}
                onUpdate={handleUpdate}
                onMapClick={handleMapClick}
                mapCommuteResult={mapCommuteResult}
                homeAddress={homeAddress}
              />
            </motion.div>

            {/* 右侧：评分与可视化 */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="space-y-6"
            >
              <ScoreMatrix offers={offers} />
              <ResultCharts offers={offers} />
            </motion.div>
          </div>
        </div>
      </section>
    </>
  )
}

function WeightCard({
  icon,
  label,
  value,
  description,
}: {
  icon: React.ReactNode
  label: string
  value: string
  description: string
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 shrink-0">{icon}</div>
      <div>
        <p className="text-Ink/60 dark:text-white/60 text-sm font-body">
          {label} <span className="text-Ink/80 dark:text-white/80 ml-1">{value}</span>
        </p>
        <p className="text-Ink/30 dark:text-white/20 text-xs font-body mt-0.5">{description}</p>
      </div>
    </div>
  )
}
