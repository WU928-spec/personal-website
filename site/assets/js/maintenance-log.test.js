import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const momentsPage = readFileSync(new URL('../../moments/index.html', import.meta.url), 'utf8')
const homePage = readFileSync(new URL('../../index.html', import.meta.url), 'utf8')

test('renders every moment in one social feed without a maintenance-only section', () => {
  assert.match(momentsPage, /class="moment-feed shell-narrow"/)
  assert.match(momentsPage, /include moment-card\.html moment=moment/)
  assert.doesNotMatch(momentsPage, /maintenance_logs|daily_moments|maintenance-log/)
})

test('renders maintenance updates as tagged posts with minute timestamps', () => {
  const card = readFileSync(new URL('../../_includes/moment-card.html', import.meta.url), 'utf8')
  assert.match(card, /#{{ tag }}/)
  assert.match(card, /%Y-%m-%d %H:%M/)
  assert.match(card, /moment-post-content/)
})

test('includes maintenance updates in the homepage feed using the same post card', () => {
  assert.match(homePage, /moment\.published != false"/)
  assert.doesNotMatch(homePage, /moment\.category/)
  assert.match(homePage, /include moment-card\.html moment=moment/)
})

test('preserves explicit local time labels and loads feed avatars directly', () => {
  const card = readFileSync(new URL('../../_includes/moment-card.html', import.meta.url), 'utf8')
  const log = readFileSync(new URL('../../_moments/2026-11-11-moments-feed.md', import.meta.url), 'utf8')
  assert.match(card, /include\.moment\.display_time/)
  assert.match(log, /display_time: "2026-11-11 13:32"/)
  assert.doesNotMatch(card, /moment-avatar[^>]*loading="lazy"/)
})
