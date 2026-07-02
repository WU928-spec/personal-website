import { ChevronLeft, ChevronRight, CalendarDays, RotateCcw } from 'lucide-react'

interface CalendarHeaderProps {
  year: number
  month: number
  onPrevMonth: () => void
  onNextMonth: () => void
  onToday: () => void
}

export default function CalendarHeader({
  year,
  month,
  onPrevMonth,
  onNextMonth,
  onToday,
}: CalendarHeaderProps) {
  const monthNames = [
    '一月', '二月', '三月', '四月', '五月', '六月',
    '七月', '八月', '九月', '十月', '十一月', '十二月',
  ]

  return (
    <div className="flex items-center justify-between mb-2 shrink-0">
      {/* Left: icon + month navigation */}
      <div className="flex items-center gap-4">
        <CalendarDays size={22} className="text-Amber shrink-0" />

        <button
          onClick={onPrevMonth}
          className="flex items-center justify-center w-8 h-8 rounded-lg text-Slate dark:text-white/60 hover:text-Amber hover:bg-Amber/5 transition-colors duration-200"
          aria-label="上个月"
        >
          <ChevronLeft size={20} />
        </button>

        <h2 className="font-display text-heading font-semibold text-Ink dark:text-white min-w-[140px] text-center select-none">
          {year}年 {monthNames[month - 1]}
        </h2>

        <button
          onClick={onNextMonth}
          className="flex items-center justify-center w-8 h-8 rounded-lg text-Slate dark:text-white/60 hover:text-Amber hover:bg-Amber/5 transition-colors duration-200"
          aria-label="下个月"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Right: Back to today */}
      <button
        onClick={onToday}
        className="flex items-center justify-center w-9 h-9 rounded-lg text-Slate dark:text-white/60 hover:text-Amber hover:bg-Amber/5 transition-colors duration-200"
        title="回到今天"
        aria-label="回到今天"
      >
        <RotateCcw size={18} />
      </button>
    </div>
  )
}
