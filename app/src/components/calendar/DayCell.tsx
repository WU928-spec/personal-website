import { getLunarDate, isHoliday, isWorkday, getSolarTerms, getDayDetail } from 'chinese-days'
import { useMemo } from 'react'
import { loadProjects } from '@/utils/projectStorage'
import { formatDateStr } from '@/utils/calendarStorage'

interface DayCellProps {
  date: Date
  isCurrentMonth: boolean
  isToday: boolean
  hasEntry: boolean
  onClick: (date: Date) => void
}

export default function DayCell({
  date,
  isCurrentMonth,
  isToday,
  hasEntry,
  onClick,
}: DayCellProps) {
  const dateStr = formatDateStr(date)
  const lunar = getLunarDate(dateStr)
  const holiday = isHoliday(dateStr)
  const workday = isWorkday(dateStr)
  const solarTerms = getSolarTerms(dateStr)
  const term = solarTerms?.[0]
  const dayDetail = getDayDetail(dateStr)

  const holidayCnName = dayDetail?.name?.split(',')[1]
  const lunarText = holidayCnName || term?.name || `${lunar.lunarMonCN}${lunar.lunarDayCN}`
  const holidayName = holidayCnName || term?.name
  const isWeekend = date.getDay() === 0 || date.getDay() === 6

  /* Project dots */
  const projectColors = useMemo(() => {
    if (!isCurrentMonth) return []
    try {
      const raw = localStorage.getItem('calendar_entries')
      if (!raw) return []
      const all: Record<string, { todos: { projectId?: string }[] }> = JSON.parse(raw)
      const entry = all[dateStr]
      if (!entry?.todos?.length) return []
      const projects = loadProjects()
      const colors = new Set<string>()
      for (const todo of entry.todos) {
        if (todo.projectId) {
          const p = projects.find((proj) => proj.id === todo.projectId)
          if (p) colors.add(p.color)
        }
      }
      return Array.from(colors).slice(0, 3)
    } catch {
      return []
    }
  }, [dateStr, isCurrentMonth])

  const showProjectDots = projectColors.length > 0
  const showEntryDot = hasEntry && isCurrentMonth && !showProjectDots

  return (
    <button
      onClick={() => onClick(date)}
      className={`
        relative flex flex-col items-center justify-center
        rounded-lg border transition-all duration-200
        h-full py-1
        ${isCurrentMonth
          ? 'bg-white dark:bg-white/5 border-Sand dark:border-white/10 hover:border-Amber/50 hover:shadow-sm'
          : 'bg-transparent border-transparent text-Slate/40 dark:text-white/20'
        }
        ${isToday
          ? 'ring-2 ring-Amber bg-Amber/[0.03] dark:bg-Amber/5'
          : ''
        }
        ${showEntryDot
          ? 'after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:rounded-full after:bg-Amber'
          : ''
        }
      `}
    >
      {/* Date number */}
      <span
        className={`
          font-display text-[0.875rem] sm:text-[1rem] font-semibold leading-none
          ${isToday
            ? 'text-Amber'
            : isCurrentMonth
              ? isWeekend
                ? 'text-Rose'
                : 'text-Ink dark:text-white'
              : 'text-Slate/30 dark:text-white/15'
          }
        `}
      >
        {date.getDate()}
      </span>

      {/* Lunar / Holiday */}
      <span
        className={`
          mt-0.5 text-[0.625rem] sm:text-[0.6875rem] leading-tight truncate max-w-[90%]
          ${holiday
            ? 'text-Rose font-medium'
            : term
              ? 'text-Sage'
              : isCurrentMonth
                ? 'text-Slate/60 dark:text-white/40'
                : 'text-Slate/20 dark:text-white/10'
          }
        `}
      >
        {holidayName || lunarText}
      </span>

      {/* Project dots */}
      {showProjectDots && (
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex items-center gap-0.5">
          {projectColors.map((c, i) => (
            <span
              key={i}
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      )}

      {/* Work/Rest badge */}
      {isCurrentMonth && holiday && (
        <span className="absolute top-0.5 right-0.5 text-[0.5625rem] font-bold text-Rose bg-Rose/10 px-0.5 rounded leading-none">
          休
        </span>
      )}
      {isCurrentMonth && !holiday && workday && isWeekend && (
        <span className="absolute top-0.5 right-0.5 text-[0.5625rem] font-bold text-Ink bg-Ink/10 px-0.5 rounded leading-none dark:text-white dark:bg-white/10">
          班
        </span>
      )}
    </button>
  )
}

