import { useState, useCallback, useMemo, useEffect } from 'react'
import { motion } from 'framer-motion'
import CalendarHeader from '@/components/calendar/CalendarHeader'
import CalendarGrid from '@/components/calendar/CalendarGrid'
import DayDetailPanel from '@/components/calendar/DayDetailPanel'
import TodayStatsPanel from '@/components/calendar/TodayStatsPanel'
import TodayTaskList from '@/components/calendar/TodayTaskList'
import PageSEO from '@/components/PageSEO'
import { loadAllEntries, syncCalendarEntries } from '@/utils/calendarStorage'

function loadAllEntryDates(): Set<string> {
  const all = loadAllEntries()
  return new Set(Object.keys(all))
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

  /* Background sync with Supabase */
  useEffect(() => {
    syncCalendarEntries().then(() => setEntries(loadAllEntryDates()))
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
        className="flex-1 max-w-[1400px] w-full mx-auto px-4 py-4 flex flex-col min-h-0"
      >
        {/* 2:8:2 Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_4fr_1fr] gap-4 flex-1 min-h-0">
          {/* Left sidebar: Stats */}
          <aside className="hidden lg:flex flex-col min-h-0">
            <TodayStatsPanel />
          </aside>

          {/* Main calendar */}
          <main className="bg-white/70 dark:bg-white/5 border border-Sand dark:border-white/10 rounded-lg p-4 sm:p-4 flex flex-col min-h-0">
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
            <div className="mt-2 flex flex-wrap items-center gap-4 text-label text-Slate dark:text-white/50 shrink-0">
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
