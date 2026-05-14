import { formatRelativeTime } from './time'

describe('formatRelativeTime', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should return 刚刚 for < 60 seconds', () => {
    const now = new Date('2024-01-01T12:00:00Z')
    vi.setSystemTime(now)
    expect(formatRelativeTime('2024-01-01T11:59:30Z')).toBe('刚刚')
  })

  it('should return minutes ago', () => {
    const now = new Date('2024-01-01T12:00:00Z')
    vi.setSystemTime(now)
    expect(formatRelativeTime('2024-01-01T11:55:00Z')).toBe('5分钟前')
  })

  it('should return hours ago', () => {
    const now = new Date('2024-01-01T12:00:00Z')
    vi.setSystemTime(now)
    expect(formatRelativeTime('2024-01-01T09:00:00Z')).toBe('3小时前')
  })

  it('should return 昨天', () => {
    const now = new Date('2024-01-02T12:00:00Z')
    vi.setSystemTime(now)
    expect(formatRelativeTime('2024-01-01T12:00:00Z')).toBe('昨天')
  })

  it('should return 前天', () => {
    const now = new Date('2024-01-03T12:00:00Z')
    vi.setSystemTime(now)
    expect(formatRelativeTime('2024-01-01T12:00:00Z')).toBe('前天')
  })

  it('should return days ago', () => {
    const now = new Date('2024-01-07T12:00:00Z')
    vi.setSystemTime(now)
    expect(formatRelativeTime('2024-01-01T12:00:00Z')).toBe('6天前')
  })

  it('should return weeks ago', () => {
    const now = new Date('2024-01-22T12:00:00Z')
    vi.setSystemTime(now)
    expect(formatRelativeTime('2024-01-01T12:00:00Z')).toBe('3周前')
  })

  it('should return locale date for >= 30 days', () => {
    const now = new Date('2024-03-01T12:00:00Z')
    vi.setSystemTime(now)
    expect(formatRelativeTime('2024-01-01T12:00:00Z')).toBe('2024/1/1')
  })
})
