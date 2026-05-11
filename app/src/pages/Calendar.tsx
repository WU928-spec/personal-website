import { useState, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import CalendarHeader from '@/components/calendar/CalendarHeader'
import CalendarGrid from '@/components/calendar/CalendarGrid'
import DayDetailPanel from '@/components/calendar/DayDetailPanel'
import TodayStatsPanel from '@/components/calendar/TodayStatsPanel'
import TodayTaskList from '@/components/calendar/TodayTaskList'
import PageSEO from '@/components/PageSEO'

const STORAGE_KEY = 'calendar_entries'

function loadAllEntryDates(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return new Set()
    const all: Record<string, unknown> = JSON.parse(raw)
    return new Set(Object.keys(all))
  } catch {
    return new Set()
  }
}

export default function Calendar() {
  const today = useMemo(() => new Date(), [])
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth() + 1)
  const [entries, setEntries] = useState<Set<string>>(() => loadAllEntryDates())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [panelOpen, setPanelOpen] = useState(false)

  const handlePrevMonth = useCallback(() => {
    setMonth((prev) => {
      if (prev === 1) {
        setYear((y) => y - 1)
        return 12
      }
      return prev - 1
    })
  }, [])

  const handleNextMonth = useCallback(() => {
    setMonth((prev) => {
      if (prev === 12) {
        setYear((y) => y + 1)
        return 1
      }
      return prev + 1
    })
  }, [])

  const handleToday = useCallback(() => {
    setYear(today.getFullYear())
    setMonth(today.getMonth() + 1)
  }, [today])

  const handleSelectDate = useCallback((date: Date) => {
    setSelectedDate(date)
    setPanelOpen(true)
  }, [])

  const handleClosePanel = useCallback(() => {
    setPanelOpen(false)
    setTimeout(() => setSelectedDate(null), 300)
  }, [])

  const handleEntryChange = useCallback(() => {
    setEntries(loadAllEntryDates())
  }, [])

  return (
    <div className="h-[calc(100dvh-4rem)] bg-Parchment dark:bg-Graphite flex flex-col">
      <PageSEO
        title="任务管理"
        description="日历视图管理日常任务与计划。"
        path="/calendar"
      />

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex-1 max-w-[1400px] w-full mx-auto px-3 sm:px-4 py-3 flex flex-col min-h-0"
      >
        {/* 2:8:2 Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_4fr_1fr] gap-3 flex-1 min-h-0">
          {/* Left sidebar: Stats */}
          <aside className="hidden lg:flex flex-col min-h-0">
            <TodayStatsPanel />
          </aside>

          {/* Main calendar */}
          <main className="bg-white/70 dark:bg-white/5 border border-Sand dark:border-white/10 rounded-2xl p-3 sm:p-4 flex flex-col min-h-0">
            <CalendarHeader
              year={year}
              month={month}
              onPrevMonth={handlePrevMonth}
              onNextMonth={handleNextMonth}
              onToday={handleToday}
            />
            <CalendarGrid
              year={year}
              month={month}
              today={today}
              entries={entries}
              onSelectDate={handleSelectDate}
            />

            {/* Legend */}
            <div className="mt-2 flex flex-wrap items-center gap-3 text-[0.6875rem] text-Slate dark:text-white/50 shrink-0">
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-Amber" />
                <span>有记录</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-Rose" />
                <span>节假日</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-Sage" />
                <span>节气</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded border-2 border-Amber" />
                <span>今天</span>
              </div>
            </div>
          </main>

          {/* Right sidebar: Task list */}
          <aside className="hidden lg:flex flex-col min-h-0">
            <TodayTaskList />
          </aside>
        </div>
      </motion.div>

      <DayDetailPanel
        date={selectedDate}
        isOpen={panelOpen}
        onClose={handleClosePanel}
        onEntryChange={handleEntryChange}
      />
    </div>
  )
}
