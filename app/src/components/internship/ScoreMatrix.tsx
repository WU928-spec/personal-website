import { motion } from 'framer-motion'
import type { Offer } from './types'
import { calcTotalScore, calcSalaryScore, calcCommuteScore } from '@/components/internship/types'

interface ScoreMatrixProps {
  offers: Offer[]
}

export default function ScoreMatrix({ offers }: ScoreMatrixProps) {
  if (offers.length === 0) return null

  const sorted = [...offers].sort((a, b) => calcTotalScore(b) - calcTotalScore(a))

  return (
    <div className="space-y-4">
      <h3 className="text-white/70 font-body text-sm tracking-wider">
        评分排名
      </h3>

      <div className="space-y-3">
        {sorted.map((offer, index) => {
          const score = calcTotalScore(offer)
          const salary = calcSalaryScore(offer.salary)
          const commute = calcCommuteScore(offer.commuteMinutes)
          const intensity = (offer.workIntensity / 10) * 100
          const atmosphere = (offer.teamAtmosphere / 10) * 100
          const growth = (offer.growthProspect / 10) * 100

          const workExp = commute * 0.4 + intensity * 0.3 + atmosphere * 0.3

          return (
            <motion.div
              key={offer.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.08, duration: 0.4 }}
              className="relative rounded-xl border border-white/5 bg-white/[0.02] p-4 overflow-hidden"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-white/40 text-xs font-body">
                    {index + 1}
                  </span>
                  <div>
                    <p className="text-white/80 text-sm font-body">
                      {offer.companyName} · {offer.position}
                    </p>
                    <p className="text-white/30 text-xs font-body mt-0.5">
                      {offer.salary}元/天 · {offer.commuteMinutes}min · {offer.location}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white/90 text-xl font-display">
                    {score.toFixed(1)}
                  </p>
                  <p className="text-white/20 text-xs font-body">总分</p>
                </div>
              </div>

              <div className="space-y-2">
                <ScoreBar label="日薪" score={salary} color="bg-green-400/50" />
                <ScoreBar label="通勤" score={commute} color="bg-blue-400/50" />
                <ScoreBar label="强度" score={intensity} color="bg-red-400/50" />
                <ScoreBar label="氛围" score={atmosphere} color="bg-purple-400/50" />
                <ScoreBar label="前景" score={growth} color="bg-Amber/50" />
              </div>

              <div className="mt-3 pt-3 border-t border-white/5 grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-white/40 text-xs font-body">日薪</p>
                  <p className="text-white/60 text-xs font-body">{(salary * 0.25).toFixed(1)}</p>
                </div>
                <div>
                  <p className="text-white/40 text-xs font-body">体验</p>
                  <p className="text-white/60 text-xs font-body">{(workExp * 0.40).toFixed(1)}</p>
                </div>
                <div>
                  <p className="text-white/40 text-xs font-body">前景</p>
                  <p className="text-white/60 text-xs font-body">{(growth * 0.35).toFixed(1)}</p>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

function ScoreBar({
  label,
  score,
  color,
}: {
  label: string
  score: number
  color: string
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-white/30 text-xs font-body w-8 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
      <span className="text-white/40 text-xs font-body w-8 text-right">{score.toFixed(0)}</span>
    </div>
  )
}
