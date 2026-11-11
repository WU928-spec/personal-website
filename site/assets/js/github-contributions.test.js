import test from 'node:test'
import assert from 'node:assert/strict'
import { buildContributionWeeks, contributionMonthLabels, normalizeContributions, parseContributionHtml } from './github-contributions.js'

const sampleHtml = `
  <h2>393 contributions in the last year</h2>
  <td id="day-1" data-date="2026-11-08" data-level="0" class="ContributionCalendar-day"></td>
  <tool-tip for="day-1">No contributions on November 8th.</tool-tip>
  <td id="day-2" data-date="2026-11-09" data-level="2" class="ContributionCalendar-day"></td>
  <tool-tip for="day-2">3 contributions on November 9th.</tool-tip>
  <td id="day-3" data-date="2026-11-10" data-level="4" class="ContributionCalendar-day"></td>
  <tool-tip for="day-3">12 contributions on November 10th.</tool-tip>
`

test('reads real contribution totals, levels and daily counts from GitHub HTML', () => {
  assert.deepEqual(parseContributionHtml(sampleHtml), {
    total: 393,
    days: [
      { date: '2026-11-08', level: 0, count: 0 },
      { date: '2026-11-09', level: 2, count: 3 },
      { date: '2026-11-10', level: 4, count: 12 },
    ],
  })
})

test('groups days into Sunday-first weeks and labels new months', () => {
  const weeks = buildContributionWeeks(parseContributionHtml(sampleHtml).days)
  assert.equal(weeks.length, 1)
  assert.equal(weeks[0].length, 7)
  assert.equal(weeks[0][0].count, 0)
  assert.equal(weeks[0][2].level, 4)
  assert.equal(weeks[0][6], null)
  assert.deepEqual(contributionMonthLabels(weeks), [{ week: 0, label: '11月' }])
})

test('rejects missing or malformed contribution data instead of inventing cells', () => {
  assert.equal(normalizeContributions(null), null)
  assert.equal(normalizeContributions({ total: 10, days: [] }), null)
  assert.equal(normalizeContributions({ total: 10, days: [{ date: 'invalid', level: 2, count: 1 }] }), null)
})
