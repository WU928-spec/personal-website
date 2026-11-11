import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const home = readFileSync(new URL('../../index.html', import.meta.url), 'utf8')
const css = readFileSync(new URL('../css/main.css', import.meta.url), 'utf8')

test('uses one narrow reading measure and a shorter homepage hero', () => {
  assert.match(css, /--home-max: 840px/)
  assert.match(css, /\.home-page \.shell/)
  assert.match(css, /\.hero\s*\{[^}]*min-height: 68svh/s)
})

test('keeps homepage entries compact without empty date columns or duplicate links', () => {
  assert.match(home, /class="entry home-note"/)
  assert.match(home, /public_moments limit: 2/)
  assert.match(home, /pluto-entry-label/)
  assert.doesNotMatch(home, /<h2>其他链接<\/h2>/)
})
