import { useState } from 'react'
import { motion } from 'framer-motion'
import type { Offer } from './types'
import { calcSalaryScore, calcCommuteScore, calcTotalScore } from './types'

interface ResultChartsProps {
  offers: Offer[]
}

export default function ResultCharts({ offers }: ResultChartsProps) {
  if (offers.length < 2) return null

  const [activeDimension, setActiveDimension] = useState<'total' | 'salary' | 'commute' | 'intensity' | 'atmosphere' | 'growth'>('total')

  const dimensionConfig = {
    total: { label: '总分', getValue: (o: Offer) => calcTotalScore(o) },
    salary: { label: '日薪', getValue: (o: Offer) => calcSalaryScore(o.salary) },
    commute: { label: '通勤', getValue: (o: Offer) => calcCommuteScore(o.commuteMinutes) },
    intensity: { label: '强度', getValue: (o: Offer) => (o.workIntensity / 10) * 100 },
    atmosphere: { label: '氛围', getValue: (o: Offer) => (o.teamAtmosphere / 10) * 100 },
    growth: { label: '前景', getValue: (o: Offer) => (o.growthProspect / 10) * 100 },
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
        <h3 className="text-white/70 font-body text-sm tracking-wider">可视化对比</h3>
        <div className="flex flex-wrap gap-1.5">
          {(Object.entries(dimensionConfig) as [string, typeof dimensionConfig['total']][]).map(([key, config]) => (
            <button
              key={key}
              onClick={() => setActiveDimension(key as typeof activeDimension)}
              className={`px-2.5 py-1 rounded-full text-xs font-body tracking-wider transition-all border ${
                activeDimension === key
                  ? 'bg-white/10 text-white/80 border-white/20'
                  : 'text-white/30 border-white/5 hover:text-white/50 hover:border-white/10'
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
              <span className="text-white/40 text-xs font-body w-20 truncate shrink-0">
                {offer.companyName}
              </span>
              <div className="flex-1 h-6 bg-white/5 rounded-md overflow-hidden relative">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className={`h-full bg-gradient-to-r ${color} rounded-md`}
                />
                <span className="absolute inset-0 flex items-center px-2 text-white/60 text-xs font-body">
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
  const dimensions = ['日薪', '通勤', '强度', '氛围', '前景']
  const getDimensionValue = (offer: Offer, dim: string) => {
    switch (dim) {
      case '日薪': return calcSalaryScore(offer.salary) / 100
      case '通勤': return calcCommuteScore(offer.commuteMinutes) / 100
      case '强度': return offer.workIntensity / 10
      case '氛围': return offer.teamAtmosphere / 10
      case '前景': return offer.growthProspect / 10
      default: return 0
    }
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
            stroke="rgba(255,255,255,0.05)"
            strokeWidth={1}
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
              stroke="rgba(255,255,255,0.08)"
              strokeWidth={1}
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
              fill="rgba(255,255,255,0.4)"
              fontSize={10}
              fontFamily="ui-sans-serif, system-ui"
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
            <span className="text-white/40 text-xs font-body">{offer.companyName}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function Recommendation({ offers }: { offers: Offer[] }) {
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
    <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02]">
      <h4 className="text-white/60 text-sm font-body tracking-wider mb-3">
        决策建议
      </h4>
      <p className="text-white/50 text-xs font-body leading-[1.8]">
        <span className="text-white/70">{a.companyName}</span> 比 <span className="text-white/70">{b.companyName}</span> 高 {diff.toFixed(1)} 分。
        {salaryDiff > 0 && `日薪领先 ${salaryDiff.toFixed(0)} 分；`}
        {commuteDiff > 0 && `通勤领先 ${commuteDiff.toFixed(0)} 分；`}
        {growthDiff > 0 && `前景领先 ${growthDiff.toFixed(0)} 分。`}
        {salaryDiff <= 0 && commuteDiff <= 0 && growthDiff <= 0 && '综合得分优势明显。'}
      </p>
    </div>
  )
}
