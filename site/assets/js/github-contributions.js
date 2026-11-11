function readAttribute(tag, name) {
  return tag.match(new RegExp(`\\b${name}="([^"]*)"`))?.[1] || ''
}

function plainText(html) {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

function validDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null
  const date = new Date(`${value}T00:00:00Z`)
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value ? date : null
}

export function parseContributionHtml(html) {
  const counts = new Map()
  for (const match of html.matchAll(/<tool-tip\b[^>]*\bfor="([^"]+)"[^>]*>([\s\S]*?)<\/tool-tip>/g)) {
    const text = plainText(match[2])
    const count = /^No contributions\b/i.test(text)
      ? 0
      : Number(text.match(/^([\d,]+)\s+contributions?\b/i)?.[1]?.replaceAll(',', ''))
    counts.set(match[1], Number.isInteger(count) && count >= 0 ? count : null)
  }

  const days = []
  for (const match of html.matchAll(/<td\b[^>]*>/g)) {
    const tag = match[0]
    if (!/\bclass="[^"]*ContributionCalendar-day/.test(tag)) continue
    const date = readAttribute(tag, 'data-date')
    const level = Number(readAttribute(tag, 'data-level'))
    if (!validDate(date) || !Number.isInteger(level) || level < 0 || level > 4) continue
    const count = counts.get(readAttribute(tag, 'id'))
    days.push({ date, level, count: Number.isInteger(count) && count >= 0 ? count : null })
  }

  const heading = plainText(html.match(/<h2\b[^>]*>([\s\S]*?)<\/h2>/)?.[1] || '')
  const total = Number(heading.match(/([\d,]+)\s+contributions\s+in\s+the\s+last\s+year/i)?.[1]?.replaceAll(',', ''))
  return { total: Number.isInteger(total) && total >= 0 ? total : null, days }
}

export function normalizeContributions(value) {
  if (!value || !Array.isArray(value.days)) return null
  const days = value.days.map((day) => {
    if (!day || !validDate(day.date) || !Number.isInteger(day.level) || day.level < 0 || day.level > 4) return null
    return {
      date: day.date,
      level: day.level,
      count: Number.isInteger(day.count) && day.count >= 0 ? day.count : null,
    }
  }).filter(Boolean)
  if (days.length === 0) return null
  return {
    total: Number.isInteger(value.total) && value.total >= 0 ? value.total : null,
    updatedAt: typeof value.updatedAt === 'string' ? value.updatedAt : '',
    days,
  }
}

export function buildContributionWeeks(days) {
  const weeks = []
  let week = []
  const sortedDays = [...days].sort((a, b) => a.date.localeCompare(b.date))
  for (const day of sortedDays) {
    const weekday = validDate(day.date).getUTCDay()
    if (week.length === 0) week = Array(weekday).fill(null)
    else if (weekday === 0) {
      while (week.length < 7) week.push(null)
      weeks.push(week)
      week = []
    }
    week.push(day)
  }
  if (week.length > 0) {
    while (week.length < 7) week.push(null)
    weeks.push(week)
  }
  return weeks
}

export function contributionMonthLabels(weeks) {
  const labels = []
  for (const [index, week] of weeks.entries()) {
    const firstOfMonth = week.find((day) => day?.date.endsWith('-01'))
    const firstDay = week.find(Boolean)
    const day = firstOfMonth || (index === 0 ? firstDay : null)
    if (day) labels.push({ week: index, label: `${Number(day.date.slice(5, 7))}月` })
  }
  return labels
}

function renderContributions(root, data) {
  const summary = root.querySelector('[data-contribution-summary]')
  const updated = root.querySelector('[data-contribution-updated]')
  const chart = root.querySelector('[data-contribution-chart]')
  const weeks = buildContributionWeeks(data.days)
  const monthLabels = new Map(contributionMonthLabels(weeks).map((item) => [item.week, item.label]))

  summary.textContent = data.total === null ? '过去一年的 GitHub 贡献' : `过去一年 ${data.total} 次贡献`
  updated.textContent = data.updatedAt ? `数据更新于 ${data.updatedAt.slice(0, 10)}` : ''

  const table = document.createElement('table')
  table.className = 'contribution-table'
  table.setAttribute('aria-label', '过去一年 GitHub 贡献热力图')
  const header = document.createElement('thead')
  const headerRow = document.createElement('tr')
  const corner = document.createElement('th')
  corner.className = 'contribution-weekday'
  corner.setAttribute('aria-hidden', 'true')
  headerRow.append(corner)
  for (let index = 0; index < weeks.length; index += 1) {
    const month = document.createElement('th')
    month.className = 'contribution-month'
    month.textContent = monthLabels.get(index) || ''
    month.setAttribute('aria-hidden', 'true')
    headerRow.append(month)
  }
  header.append(headerRow)
  table.append(header)

  const body = document.createElement('tbody')
  const weekdayLabels = new Map([[1, 'Mon'], [3, 'Wed'], [5, 'Fri']])
  for (let weekday = 0; weekday < 7; weekday += 1) {
    const row = document.createElement('tr')
    const label = document.createElement('th')
    label.className = 'contribution-weekday'
    label.textContent = weekdayLabels.get(weekday) || ''
    label.scope = 'row'
    row.append(label)
    for (const week of weeks) {
      const day = week[weekday]
      const cell = document.createElement('td')
      if (!day) {
        cell.className = 'contribution-empty'
        cell.setAttribute('aria-hidden', 'true')
      } else {
        const text = `${day.date}${day.count === null ? '' : `，${day.count} 次贡献`}`
        cell.className = 'contribution-day'
        cell.dataset.level = String(day.level)
        cell.title = text
        const accessible = document.createElement('span')
        accessible.className = 'sr-only'
        accessible.textContent = text
        cell.append(accessible)
      }
      row.append(cell)
    }
    body.append(row)
  }
  table.append(body)

  const scroll = document.createElement('div')
  scroll.className = 'contribution-scroll'
  scroll.tabIndex = 0
  scroll.setAttribute('role', 'region')
  scroll.setAttribute('aria-label', 'GitHub 贡献热力图，可横向滚动')
  scroll.append(table)

  const legend = document.createElement('div')
  legend.className = 'contribution-legend'
  const less = document.createElement('span')
  less.textContent = 'Less'
  legend.append(less)
  for (let level = 0; level <= 4; level += 1) {
    const swatch = document.createElement('span')
    swatch.className = 'contribution-swatch'
    swatch.dataset.level = String(level)
    swatch.setAttribute('aria-hidden', 'true')
    legend.append(swatch)
  }
  const more = document.createElement('span')
  more.textContent = 'More'
  legend.append(more)
  chart.replaceChildren(scroll, legend)
}

export function initializeContributions() {
  if (typeof document === 'undefined') return () => {}
  window.contributionsCleanup?.()
  const root = document.querySelector('[data-github-contributions]')
  if (!root) return () => {}
  const controller = new AbortController()

  async function load() {
    try {
      const response = await fetch('/assets/data/github-contributions.json', { signal: controller.signal })
      if (!response.ok) throw new Error('Contributions unavailable')
      const data = normalizeContributions(await response.json())
      if (!data) throw new Error('Invalid contributions')
      if (!controller.signal.aborted) renderContributions(root, data)
    } catch (error) {
      if (error.name === 'AbortError') return
      root.querySelector('[data-contribution-summary]').textContent = '暂时无法加载 GitHub 贡献记录。'
      root.querySelector('[data-contribution-updated]').textContent = ''
      root.querySelector('[data-contribution-chart]').replaceChildren()
    }
  }

  void load()
  const cleanup = () => controller.abort()
  window.contributionsCleanup = cleanup
  return cleanup
}

if (typeof document !== 'undefined') initializeContributions()
