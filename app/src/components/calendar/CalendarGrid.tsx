import DayCell from './DayCell'
import { formatDateStr } from '@/utils/calendarStorage'

interface CalendarGridProps {
  year: number
  month: number
  today: Date
  entries: Set<string>
  onSelectDate: (date: Date) => void
}

const weekDays = ['一', '二', '三', '四', '五', '六', '日']

export default function CalendarGrid({
  year,
  month,
  today,
  entries,
  onSelectDate,
}: CalendarGridProps) {
  const days = getMonthDays(year, month)

  return (
    <div className="w-full flex flex-col flex-1 min-h-0">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 mb-1 shrink-0">
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-center text-[0.6875rem] sm:text-[0.75rem] font-medium text-Slate dark:text-white/50 py-0.5"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1 flex-1 min-h-0">
        {days.map((day, index) => {
          const dateStr = formatDateStr(day.date)
          const isToday = dateStr === formatDateStr(today)
          return (
            <DayCell
              key={index}
              date={day.date}
              isCurrentMonth={day.isCurrentMonth}
              isToday={isToday}
              hasEntry={entries.has(dateStr)}
              onClick={onSelectDate}
            />
          )
        })}
      </div>
    </div>
  )
}

interface DayInfo {
  date: Date
  isCurrentMonth: boolean
}

function getMonthDays(year: number, month: number): DayInfo[] {
  const days: DayInfo[] = []

  const firstDay = new Date(year, month - 1, 1)
  let startOffset = firstDay.getDay() - 1
  if (startOffset < 0) startOffset = 6

  const prevMonthDays = new Date(year, month - 1, 0).getDate()
  for (let i = startOffset - 1; i >= 0; i--) {
    days.push({
      date: new Date(year, month - 2, prevMonthDays - i),
      isCurrentMonth: false,
    })
  }

  const currentMonthDays = new Date(year, month, 0).getDate()
  for (let i = 1; i <= currentMonthDays; i++) {
    days.push({
      date: new Date(year, month - 1, i),
      isCurrentMonth: true,
    })
  }

  const remaining = 42 - days.length
  for (let i = 1; i <= remaining; i++) {
    days.push({
      date: new Date(year, month, i),
      isCurrentMonth: false,
    })
  }

  return days
}

