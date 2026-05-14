import {
  formatDuration,
  formatDurationShort,
  getProjectStats,
} from './projectAggregation'
import { formatDateStr } from './calendarStorage'
import type { Project, DayEntry } from '@/types/calendar'

describe('formatDuration', () => {
  it('should format minutes only', () => {
    expect(formatDuration(300)).toBe('5m')
    expect(formatDuration(0)).toBe('0m')
  })

  it('should format hours and minutes', () => {
    expect(formatDuration(3660)).toBe('1h 1m')
    expect(formatDuration(7200)).toBe('2h 0m')
  })
})

describe('formatDurationShort', () => {
  it('should format minutes only', () => {
    expect(formatDurationShort(300)).toBe('5m')
  })

  it('should format hours:mm', () => {
    expect(formatDurationShort(3660)).toBe('1:01')
    expect(formatDurationShort(7200)).toBe('2:00')
  })
})

describe('formatDateStr', () => {
  it('should format date correctly', () => {
    expect(formatDateStr(new Date(2024, 0, 15))).toBe('2024-01-15')
    expect(formatDateStr(new Date(2024, 11, 1))).toBe('2024-12-01')
  })
})

describe('getProjectStats', () => {
  const mockProject: Project = {
    id: 'p1',
    name: 'Test Project',
    color: '#C9A84C',
    targetHours: 10,
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
  }

  const mockEntries: Record<string, DayEntry> = {
    '2024-01-01': {
      date: '2024-01-01',
      todos: [
        {
          id: 't1',
          text: 'Task 1',
          done: true,
          projectId: 'p1',
          timeRecords: [{ id: 'r1', startAt: '2024-01-01T08:00:00Z', endAt: '2024-01-01T09:00:00Z', duration: 3600 }],
        },
        {
          id: 't2',
          text: 'Task 2',
          done: false,
          projectId: 'p1',
          timeRecords: [{ id: 'r2', startAt: '2024-01-01T10:00:00Z', endAt: '2024-01-01T10:30:00Z', duration: 1800 }],
        },
      ],
    },
    '2024-01-02': {
      date: '2024-01-02',
      todos: [
        {
          id: 't3',
          text: 'Other project task',
          done: true,
          projectId: 'p2',
          timeRecords: [{ id: 'r3', startAt: '2024-01-02T08:00:00Z', endAt: '2024-01-02T09:00:00Z', duration: 3600 }],
        },
      ],
    },
  }

  it('should return null for non-existent project', () => {
    expect(getProjectStats('nonexistent', [mockProject], mockEntries)).toBeNull()
  })

  it('should calculate stats correctly', () => {
    const stats = getProjectStats('p1', [mockProject], mockEntries)
    expect(stats).not.toBeNull()
    expect(stats!.project.id).toBe('p1')
    expect(stats!.totalSeconds).toBe(5400)
    expect(stats!.totalTodos).toBe(2)
    expect(stats!.doneTodos).toBe(1)
    expect(stats!.dailyBreakdown).toHaveLength(1)
    expect(stats!.dailyBreakdown[0].date).toBe('2024-01-01')
    expect(stats!.dailyBreakdown[0].seconds).toBe(5400)
  })

  it('should aggregate sub-project todos', () => {
    const parent: Project = { ...mockProject, id: 'parent' }
    const child: Project = { ...mockProject, id: 'child', parentId: 'parent' }
    const entries: Record<string, DayEntry> = {
      '2024-01-01': {
        date: '2024-01-01',
        todos: [
          {
            id: 't1',
            text: 'Parent task',
            done: true,
            projectId: 'parent',
            timeRecords: [{ id: 'r1', startAt: '2024-01-01T08:00:00Z', endAt: '2024-01-01T09:00:00Z', duration: 3600 }],
          },
          {
            id: 't2',
            text: 'Child task',
            done: false,
            projectId: 'child',
            timeRecords: [{ id: 'r2', startAt: '2024-01-01T09:00:00Z', endAt: '2024-01-01T09:30:00Z', duration: 1800 }],
          },
        ],
      },
    }
    const stats = getProjectStats('parent', [parent, child], entries)
    expect(stats!.totalSeconds).toBe(5400)
    expect(stats!.totalTodos).toBe(2)
  })
})
