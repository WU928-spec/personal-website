import { createStorageKey } from './storage'
import { formatDateStr } from './calendarStorage'

export interface ActiveProjectTimer {
  projectId: string
  startAt: string
  date: string
}

const timerStorage = createStorageKey<ActiveProjectTimer | null>('active_project_timer', null)

export function loadActiveProjectTimer(): ActiveProjectTimer | null {
  const timer = timerStorage.load()
  if (!timer) return null
  if (timer.date !== formatDateStr(new Date())) return null
  return timer
}

export function saveActiveProjectTimer(timer: ActiveProjectTimer | null) {
  timerStorage.save(timer)
}
