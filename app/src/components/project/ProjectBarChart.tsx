import { formatDuration } from '@/utils/projectAggregation'
import { formatDateStr } from '@/utils/calendarStorage'

export interface BarData {
  date: string
  seconds: number
}

interface ProjectBarChartProps {
  data: BarData[]
  color: string
  isCompleted?: boolean
  totalSeconds: number
  variant: 'compact' | 'full'
}

const DAY_LABELS = ['日', '一', '二', '三', '四', '五', '六']

export default function ProjectBarChart({
  data,
  color,
  isCompleted = false,
  totalSeconds,
  variant,
}: ProjectBarChartProps) {
  const maxSeconds = Math.max(...data.map((d) => d.seconds), 1)
  const isCompact = variant === 'compact'

  if (data.length === 0 || !data.some((d) => d.seconds > 0)) {
    return (
      <p className="text-center text-label text-Slate/40 dark:text-white/20 py-4">
        暂无时间记录
      </p>
    )
  }

  return (
    <div className={`flex items-end gap-1 px-1 relative ${isCompact ? 'h-16' : 'h-20'}`}>
      {data.map((d, i) => {
        const heightPct = maxSeconds > 0 ? (d.seconds / maxSeconds) * 100 : 0
        const isToday = d.date === formatDateStr(new Date())
        const hasData = d.seconds > 0
        const label = DAY_LABELS[new Date(d.date).getDay()]

        // For full variant: show date labels at intervals
        const showDateLabel = !isCompact &&
          i % Math.max(1, Math.floor(data.length / 14)) === 0

        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 min-w-0">
            <div className={`w-full flex items-end justify-center ${isCompact ? 'h-12' : 'h-14'}`}>
              <div className={`w-full flex items-end h-full ${isCompact ? 'max-w-[20px]' : ''}`}>
                <div
                  className="group w-full rounded-t transition-all duration-500 relative"
                  style={{
                    height: hasData
                      ? `${Math.max(heightPct, isCompact ? 3 : 2)}%`
                      : `${isCompact ? 3 : 2}%`,
                    backgroundColor: isToday
                      ? color
                      : hasData
                        ? `${color}66`
                        : isCompact
                          ? 'rgba(200,200,200,0.15)'
                          : 'rgba(200,200,200,0.1)',
                    opacity: isCompleted ? 0.5 : 1,
                  }}
                >
                  {/* Tooltip */}
                  {hasData && (
                    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 whitespace-nowrap text-Ink dark:text-white text-label">
                      <div className="text-label font-medium">
                        {formatDuration(d.seconds)}
                      </div>
                      {totalSeconds > 0 && (
                        <div className="text-label">
                          占比: {((d.seconds / totalSeconds) * 100).toFixed(1)}%
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Label */}
            {isCompact ? (
              <span
                className={`text-label truncate ${isToday ? 'font-medium' : ''}`}
                style={{ color: isToday ? color : undefined }}
              >
                {label}
              </span>
            ) : showDateLabel ? (
              <span className="text-label text-Slate/40 dark:text-white/25 truncate">
                {d.date.slice(5).replace('-', '/')}
              </span>
            ) : (
              <span className="text-label text-transparent">·</span>
            )}
          </div>
        )
      })}
    </div>
  )
}
