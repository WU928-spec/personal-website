import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const home = readFileSync(new URL('../../index.html', import.meta.url), 'utf8')
const css = readFileSync(new URL('../css/main.css', import.meta.url), 'utf8')
const navigation = readFileSync(new URL('./navigation.js', import.meta.url), 'utf8')
const footer = readFileSync(new URL('../../_includes/footer.html', import.meta.url), 'utf8')

test('uses one narrow reading measure and a compact desktop hero', () => {
  assert.match(css, /--home-max: 840px/)
  assert.match(css, /\.home-page \.shell/)
  assert.match(css, /\.hero\s*\{[^}]*min-height: 480px/s)
})

test('keeps homepage entries compact without empty date columns or duplicate links', () => {
  assert.match(home, /class="entry home-note"/)
  assert.match(home, /public_moments limit: 2/)
  assert.doesNotMatch(home, /<h2>其他链接<\/h2>/)
})

test('removes the hero planet module and keeps the footer star entrance', () => {
  assert.doesNotMatch(home, /pluto-entry|pluto-charon|assets\/js\/pluto\.js/)
  assert.doesNotMatch(css, /\.pluto-entry/)
  assert.doesNotMatch(navigation, /initializePluto|pluto\.js|plutoCleanup/)
  assert.match(footer, /class="starry-link"[^>]*aria-label="进入星空"/)
})

test('uses a coordinated paper background and links the hero button to the articles page', () => {
  assert.match(css, /\.hero-backdrop\s*\{[^}]*background-image: radial-gradient\(/s)
  assert.doesNotMatch(css, /ambient-drift/)
  assert.match(home, /class="hero-link" href="{{ '\/notes\/' \| relative_url }}"/)
  assert.match(css, /\.hero-link:active/)
})

test('aligns the hero divider with the content column instead of the full viewport', () => {
  assert.match(css, /\.hero\s*\{[^}]*border-bottom: 1px solid var\(--line\)/s)
  assert.match(css, /\.hero-backdrop\s*\{[^}]*border-bottom: 0/s)
})
