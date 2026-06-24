import { useState } from 'react'
import { motion } from 'framer-motion'
import { useLang } from '@/contexts/PreferencesContext'
import type { Offer } from './types'
import { calcSalaryScore, calcCommuteScore, calcTotalScore } from './types'

interface ResultChartsProps {
  offers: Offer[]
}

export default function ResultCharts({ offers }: ResultChartsProps) {
  const { t } = useLang()
  if (offers.length < 2) return null

  const [activeDimension, setActiveDimension] = useState<'total' | 'salary' | 'commute' | 'intensity' | 'atmosphere' | 'growth'>('total')

  const dimensionConfig = {
    total: { label: t('internship.totalScore'), getValue: (o: Offer) => calcTotalScore(o) },
    salary: { label: t('internship.salary'), getValue: (o: Offer) => calcSalaryScore(o.salary) },
    commute: { label: t('internship.commute'), getValue: (o: Offer) => calcCommuteScore(o.commuteMinutes) },
    intensity: { label: t('internship.intensity'), getValue: (o: Offer) => ((11 - o.workIntensity) / 10) * 100 },
    atmosphere: { label: t('internship.atmosphere'), getValue: (o: Offer) => (o.teamAtmosphere / 10) * 100 },
    growth: { label: t('internship.prospect'), getValue: (o: Offer) => (o.growthProspect / 10) * 100 },
  }

  const sorted = [...offers].sort((a, b) => dimensionConfig[activeDimension].getValue(b) - dimensionConfig[activeDimension].getValue(a))
  const maxValue = Math.max(...offers.map((o) => dimensionConfig[activeDimension].getValue(o)))

  const barColors = [
    'from-green-400/40 to-green-400/10',
    'from-blue-400/40 to-blue-400/10',
    'from-red-400/40 to-red-400/10',
    'from-purple-400/40 to-purple-400/10',
    'from-Amber/40 to-Amber/10',
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-Ink/70 dark:text-white/70 font-body text-sm tracking-wider">{t('internship.visualComparison')}</h3>
        <div className="flex flex-wrap gap-1.5">
          {(Object.entries(dimensionConfig) as [string, typeof dimensionConfig['total']][]).map(([key, config]) => (
            <button
              key={key}
              onClick={() => setActiveDimension(key as typeof activeDimension)}
              className={`px-2.5 py-1 rounded-full text-xs font-body tracking-wider transition-all border ${
                activeDimension === key
                  ? 'bg-white/70 dark:bg-white/10 text-Ink/80 dark:text-white/80 border-Amber/20 dark:border-white/20'
                  : 'text-Ink/30 dark:text-white/30 border-Amber/5 dark:border-white/5 hover:text-Ink/50 dark:hover:text-white/50 hover:border-Amber/10 dark:hover:border-white/10'
              }`}
            >
              {config.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {sorted.map((offer, index) => {
          const value = dimensionConfig[activeDimension].getValue(offer)
          const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0
          const color = barColors[index % barColors.length]

          return (
            <motion.div
              key={offer.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              className="flex items-center gap-3"
            >
              <span className="text-Ink/40 dark:text-white/40 text-xs font-body w-20 truncate shrink-0">
                {offer.companyName}
              </span>
              <div className="flex-1 h-6 bg-white/70 dark:bg-white/5 rounded-md overflow-hidden relative">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className={`h-full bg-gradient-to-r ${color} rounded-md`}
                />
                <span className="absolute inset-0 flex items-center px-2 text-Ink/60 dark:text-white/60 text-xs font-body">
                  {value.toFixed(1)}
                </span>
              </div>
            </motion.div>
          )
        })}
      </div>

      <RadarChart offers={offers} />

      {offers.length >= 2 && (
        <Recommendation offers={offers} />
      )}
    </div>
  )
}

function RadarChart({ offers }: { offers: Offer[] }) {
  const { t } = useLang()
  const dimensions = [t('internship.salary'), t('internship.commute'), t('internship.intensity'), t('internship.atmosphere'), t('internship.prospect')]
  const getDimensionValue = (offer: Offer, dim: string) => {
    if (dim === t('internship.salary')) return calcSalaryScore(offer.salary) / 100
    if (dim === t('internship.commute')) return calcCommuteScore(offer.commuteMinutes) / 100
    if (dim === t('internship.intensity')) return (11 - offer.workIntensity) / 10
    if (dim === t('internship.atmosphere')) return offer.teamAtmosphere / 10
    if (dim === t('internship.prospect')) return offer.growthProspect / 10
    return 0
  }

  const size = 200
  const center = size / 2
  const radius = 80
  const angleStep = (2 * Math.PI) / dimensions.length

  const colors = ['#4ade80', '#60a5fa', '#f87171', '#c084fc', '#fbbf24']

  const getPoint = (value: number, angle: number) => ({
    x: center + radius * value * Math.cos(angle - Math.PI / 2),
    y: center + radius * value * Math.sin(angle - Math.PI / 2),
  })

  return (
    <div className="flex flex-col items-center py-4">
      <svg width={size} height={size} className="block">
        {/* 背景网格 */}
        {[0.2, 0.4, 0.6, 0.8, 1.0].map((scale) => (
          <polygon
            key={scale}
            points={dimensions.map((_, i) => {
              const p = getPoint(scale, i * angleStep)
              return `${p.x},${p.y}`
            }).join(' ')}
            fill="none"
            stroke="rgba(128,128,128,0.1)"
            strokeWidth={1}
            className="dark:stroke-white/5"
          />
        ))}

        {/* 轴线 */}
        {dimensions.map((_, i) => {
          const p = getPoint(1, i * angleStep)
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={p.x}
              y2={p.y}
              stroke="rgba(128,128,128,0.15)"
              strokeWidth={1}
              className="dark:stroke-white/8"
            />
          )
        })}

        {/* 标签 */}
        {dimensions.map((label, i) => {
          const p = getPoint(1.15, i * angleStep)
          return (
            <text
              key={i}
              x={p.x}
              y={p.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="rgba(0,0,0,0.5)"
              fontSize={10}
              fontFamily="ui-sans-serif, system-ui"
              className="dark:fill-white/40"
            >
              {label}
            </text>
          )
        })}

        {/* Offer 多边形 */}
        {offers.slice(0, 5).map((offer, idx) => {
          const points = dimensions.map((dim, i) => {
            const v = getDimensionValue(offer, dim)
            const p = getPoint(v, i * angleStep)
            return `${p.x},${p.y}`
          }).join(' ')
          const color = colors[idx % colors.length]

          return (
            <motion.polygon
              key={offer.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              points={points}
              fill={color}
              fillOpacity={0.15}
              stroke={color}
              strokeWidth={1.5}
              strokeOpacity={0.7}
            />
          )
        })}
      </svg>

      {/* 图例 */}
      <div className="flex flex-wrap gap-3 mt-3">
        {offers.slice(0, 5).map((offer, idx) => (
          <div key={offer.id} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colors[idx % colors.length] }} />
            <span className="text-Ink/40 dark:text-white/40 text-xs font-body">{offer.companyName}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function Recommendation({ offers }: { offers: Offer[] }) {
  const { t } = useLang()
  const top2 = [...offers]
    .sort((a, b) => calcTotalScore(b) - calcTotalScore(a))
    .slice(0, 2)

  if (top2.length < 2) return null

  const a = top2[0]
  const b = top2[1]
  const diff = calcTotalScore(a) - calcTotalScore(b)
  const salaryDiff = calcSalaryScore(a.salary) - calcSalaryScore(b.salary)
  const commuteDiff = calcCommuteScore(a.commuteMinutes) - calcCommuteScore(b.commuteMinutes)
  const growthDiff = (a.growthProspect - b.growthProspect) / 10 * 100

  return (
    <div className="p-4 rounded-xl border border-Amber/10 dark:border-white/5 bg-white/50 dark:bg-white/[0.02]">
      <h4 className="text-Ink/60 dark:text-white/60 text-sm font-body tracking-wider mb-3">
        {t('internship.recommendation')}
      </h4>
      <p className="text-Ink/50 dark:text-white/50 text-xs font-body leading-[1.8]">
        <span className="text-Ink/70 dark:text-white/70">{a.companyName}</span> {t('internship.totalScore')}{' '}
        <span className="text-Ink/70 dark:text-white/70">{b.companyName}</span> {diff.toFixed(1)} {t('internship.points')}。
        {salaryDiff > 0 && `${t('internship.salary')} ${salaryDiff.toFixed(0)} ${t('internship.points')}；`}
        {commuteDiff > 0 && `${t('internship.commute')} ${commuteDiff.toFixed(0)} ${t('internship.points')}；`}
        {growthDiff > 0 && `${t('internship.prospect')} ${growthDiff.toFixed(0)} ${t('internship.points')}。`}
        {salaryDiff <= 0 && commuteDiff <= 0 && growthDiff <= 0 && t('internship.totalScore')}
      </p>
    </div>
  )
}
