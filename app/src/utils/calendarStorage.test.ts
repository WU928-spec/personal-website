import {
  formatDateStr,
  getTotalDuration,
  getCurrentElapsed,
  getDayTotalDuration,
} from './calendarStorage'
import type { TodoItem, DayEntry } from '@/types/calendar'

describe('formatDateStr', () => {
  it('should format date with padding', () => {
    expect(formatDateStr(new Date(2024, 0, 5))).toBe('2024-01-05')
    expect(formatDateStr(new Date(2024, 10, 15))).toBe('2024-11-15')
  })
})

describe('getTotalDuration', () => {
  it('should sum all durations', () => {
    const todo: TodoItem = {
      id: 't1',
      text: 'test',
      done: false,
      timeRecords: [
        { id: 'r1', startAt: '2024-01-01T08:00:00Z', duration: 3600 },
        { id: 'r2', startAt: '2024-01-01T09:00:00Z', duration: 1800 },
      ],
    }
    expect(getTotalDuration(todo)).toBe(5400)
  })

  it('should handle missing durations', () => {
    const todo: TodoItem = {
      id: 't1',
      text: 'test',
      done: false,
      timeRecords: [
        { id: 'r1', startAt: '2024-01-01T08:00:00Z' },
      ],
    }
    expect(getTotalDuration(todo)).toBe(0)
  })
})

describe('getCurrentElapsed', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should return 0 when no active record', () => {
    const todo: TodoItem = {
      id: 't1',
      text: 'test',
      done: false,
      timeRecords: [
        { id: 'r1', startAt: '2024-01-01T08:00:00Z', endAt: '2024-01-01T09:00:00Z', duration: 3600 },
      ],
    }
    expect(getCurrentElapsed(todo)).toBe(0)
  })

  it('should calculate elapsed for active record', () => {
    vi.setSystemTime(new Date('2024-01-01T10:05:00Z'))
    const todo: TodoItem = {
      id: 't1',
      text: 'test',
      done: false,
      timeRecords: [
        { id: 'r1', startAt: '2024-01-01T10:00:00Z' },
      ],
    }
    expect(getCurrentElapsed(todo)).toBe(300)
  })
})

describe('getDayTotalDuration', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should return 0 for null entry', () => {
    expect(getDayTotalDuration(null)).toBe(0)
  })

  it('should sum all todo durations', () => {
    const entry: DayEntry = {
      date: '2024-01-01',
      todos: [
        {
          id: 't1',
          text: 'A',
          done: false,
          timeRecords: [{ id: 'r1', startAt: '2024-01-01T08:00:00Z', endAt: '2024-01-01T09:00:00Z', duration: 3600 }],
        },
        {
          id: 't2',
          text: 'B',
          done: false,
          timeRecords: [{ id: 'r2', startAt: '2024-01-01T10:00:00Z', endAt: '2024-01-01T11:00:00Z', duration: 3600 }],
        },
      ],
    }
    expect(getDayTotalDuration(entry)).toBe(7200)
  })
})
