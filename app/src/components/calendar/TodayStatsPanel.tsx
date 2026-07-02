import { useState, useEffect } from 'react'
import { Clock, TrendingUp, Sun, Sunrise, Sunset, Moon } from 'lucide-react'
import type { DayEntry } from '@/types/calendar'
import {
  loadEntry,
  getTotalDuration,
  getCurrentElapsed,
  getDayTotalDuration,
  formatDateStr,
} from '@/utils/calendarStorage'
import { formatDuration, formatDurationShort } from '@/utils/projectAggregation'
import { useLiveTick } from '@/hooks/useLiveTick'

/* ─── Week data ─── */
function getWeekData(): { label: string; duration: number; isToday: boolean }[] {
  const result = []
  const today = new Date()
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const dateStr = formatDateStr(d)
    const entry = loadEntry(dateStr)
    const duration = getDayTotalDuration(entry)
    const weekday = ['日', '一', '二', '三', '四', '五', '六'][d.getDay()]
    result.push({ label: weekday, duration, isToday: i === 0 })
  }
  return result
}

/* ─── Time slot distribution ─── */
function getTimeSlotDistribution(entry: DayEntry | null): { name: string; hours: number; icon: React.ReactNode; color: string }[] {
  if (!entry) return []
  const slots = { morning: 0, afternoon: 0, evening: 0, night: 0 }
  for (const todo of entry.todos) {
    for (const record of todo.timeRecords) {
      const start = new Date(record.startAt)
      const hour = start.getHours()
      const duration = record.duration || 0
      if (hour >= 5 && hour < 12) slots.morning += duration
      else if (hour >= 12 && hour < 18) slots.afternoon += duration
      else if (hour >= 18 && hour < 23) slots.evening += duration
      else slots.night += duration
    }
  }
  return [
    { name: '早晨', hours: slots.morning / 3600, icon: <Sunrise size={12} />, color: '#C9A84C' },
    { name: '下午', hours: slots.afternoon / 3600, icon: <Sun size={12} />, color: '#C4783A' },
    { name: '晚间', hours: slots.evening / 3600, icon: <Sunset size={12} />, color: '#6B8E6B' },
    { name: '深夜', hours: slots.night / 3600, icon: <Moon size={12} />, color: '#7A7A9D' },
  ].filter((s) => s.hours > 0)
}

/* ─── Component ─── */
export default function TodayStatsPanel() {
  useLiveTick()
  const [_refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    const handleSyncCompleted = () => {
      setRefreshKey((prev) => prev + 1)
    }
    const handleEntrySaved = () => {
      setRefreshKey((prev) => prev + 1)
    }
    window.addEventListener('calendar-sync-completed', handleSyncCompleted)
    window.addEventListener('calendar-entry-saved', handleEntrySaved)
    return () => {
      window.removeEventListener('calendar-sync-completed', handleSyncCompleted)
      window.removeEventListener('calendar-entry-saved', handleEntrySaved)
    }
  }, [])

  const entry = loadEntry(formatDateStr(new Date()))
  const todos = entry?.todos || []
  const doneCount = todos.filter((t) => t.done).length
  const totalCount = todos.length
  const completionRate = totalCount > 0 ? doneCount / totalCount : 0
  const totalTrackedToday = getDayTotalDuration(entry)
  const activeTodo = todos.find((t) => t.timeRecords.some((r) => !r.endAt))

  const weekData = getWeekData()
  const maxWeekDuration = Math.max(...weekData.map((d) => d.duration), 1)
  const timeSlots = getTimeSlotDistribution(entry)
  const maxSlotHours = Math.max(...timeSlots.map((s) => s.hours), 1)

  return (
    <div className="bg-white/70 dark:bg-white/5 border border-Sand dark:border-white/10 rounded-lg p-4 flex flex-col h-full overflow-y-auto gap-4">
      {/* ── 1. Today's Focus ── */}
      <div className="text-center py-1 shrink-0">
        <div className="flex items-center justify-center gap-1.5 mb-0.5">
          <Clock size={14} className="text-Amber" />
          <span className="text-label font-medium text-Slate dark:text-white/50 uppercase tracking-wider">今日专注</span>
        </div>
        <div className="font-display text-heading font-bold text-Ink dark:text-white leading-tight">
          {formatDuration(totalTrackedToday)}
        </div>
        {activeTodo && (
          <div className="flex items-center justify-center gap-1 mt-0.5">
            <div className="w-1 h-1 rounded bg-Amber animate-pulse" />
            <span className="text-label text-Amber">
              {activeTodo.text} · {formatDurationShort(getTotalDuration(activeTodo) + getCurrentElapsed(activeTodo))}
            </span>
          </div>
        )}
      </div>

      {/* ── 2. 7-Day Trend ── */}
      {weekData.some((d) => d.duration > 0) && (
        <div className="shrink-0">
          <div className="flex items-center gap-1 mb-1.5">
            <TrendingUp size={12} className="text-Slate dark:text-white/40" />
            <span className="text-label font-medium text-Slate dark:text-white/40">7天趋势</span>
          </div>
          <div className="flex items-end gap-1 h-14 px-1">
            {weekData.map((d, i) => {
              const heightPct = maxWeekDuration > 0 ? (d.duration / maxWeekDuration) * 100 : 0
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex items-end justify-center" style={{ height: '42px' }}>
                    <div
                      className={`w-full max-w-[18px] rounded-t-sm transition-all duration-500 ${d.isToday ? 'bg-Amber' : d.duration > 0 ? 'bg-Amber/40' : 'bg-Sand/50 dark:bg-white/5'}`}
                      style={{ height: `${Math.max(heightPct, 4)}%` }}
                    />
                  </div>
                  <span className={`text-[0.5625rem] ${d.isToday ? 'text-Amber font-medium' : 'text-Slate/50 dark:text-white/30'}`}>{d.label}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── 3. Completion Rate ── */}
      {totalCount > 0 && (
        <div className="flex items-center gap-4 shrink-0">
          <div className="relative w-12 h-12 shrink-0">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(var(--color-sand), 0.5)" strokeWidth="4" />
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#C4783A" strokeWidth="4" strokeDasharray={`${completionRate * 100}, 100`} strokeLinecap="round" className="transition-all duration-700" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-label font-bold text-Ink dark:text-white">{Math.round(completionRate * 100)}%</span>
            </div>
          </div>
          <div>
            <p className="text-label font-medium text-Ink dark:text-white">今日完成 {doneCount}/{totalCount}</p>
            <p className="text-label text-Slate/60 dark:text-white/30">{doneCount === totalCount ? '全部完成 🎉' : `还剩 ${totalCount - doneCount} 项`}</p>
          </div>
        </div>
      )}

      {/* ── 4. Time Slot Distribution ── */}
      {timeSlots.length > 0 && (
        <div className="shrink-0">
          <div className="flex items-center gap-1 mb-1.5">
            <Sun size={12} className="text-Slate dark:text-white/40" />
            <span className="text-label font-medium text-Slate dark:text-white/40">时段分布</span>
          </div>
          <div className="space-y-1">
            {timeSlots.map((slot) => (
              <div key={slot.name} className="flex items-center gap-2">
                <span className="text-Slate/60 dark:text-white/40 shrink-0">{slot.icon}</span>
                <span className="text-[0.6875rem] text-Slate dark:text-white/60 w-8 shrink-0">{slot.name}</span>
                <div className="flex-1 h-2 bg-Mist/50 dark:bg-white/5 rounded-lg overflow-hidden">
                  <div className="h-full rounded-lg transition-all duration-500" style={{ width: `${Math.min((slot.hours / maxSlotHours) * 100, 100)}%`, backgroundColor: slot.color }} />
                </div>
                <span className="text-label font-mono text-Slate/60 dark:text-white/40 w-10 text-right shrink-0">
                  {slot.hours >= 1 ? `${slot.hours.toFixed(1)}h` : `${Math.round(slot.hours * 60)}m`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
