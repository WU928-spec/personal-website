import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const momentsPage = readFileSync(new URL('../../moments/index.html', import.meta.url), 'utf8')
const notesPage = readFileSync(new URL('../../notes/index.html', import.meta.url), 'utf8')
const homePage = readFileSync(new URL('../../index.html', import.meta.url), 'utf8')
const css = readFileSync(new URL('../css/main.css', import.meta.url), 'utf8')

test('aligns the moments header, feed and dividers on one narrow column', () => {
  assert.match(momentsPage, /class="page-header shell-narrow"/)
  assert.match(momentsPage, /class="moment-feed shell-narrow"/)
  assert.match(css, /\.page-header \+ \.moment-feed \.moment-post:first-child\s*\{[^}]*border-top: 0/s)
})

test('aligns the notes page to 840px and removes duplicate list boundaries', () => {
  assert.match(notesPage, /class="page-header page-shell"/)
  assert.match(notesPage, /class="category-nav page-shell"/)
  assert.match(notesPage, /class="content-section page-shell category-content"/)
  assert.match(css, /\.page-shell\s*\{[^}]*840px/s)
  assert.match(css, /\.category-content\s*\{[^}]*border-bottom: 0/s)
  assert.match(css, /\.category-content \.compact-note:first-child\s*\{[^}]*border-top: 0/s)
})

test('uses the same compact note structure without empty date columns on home and notes pages', () => {
  assert.match(homePage, /class="entry compact-note"/)
  assert.match(notesPage, /class="entry compact-note"/)
})
