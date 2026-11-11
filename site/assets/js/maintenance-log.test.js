import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const momentsPage = readFileSync(new URL('../../moments/index.html', import.meta.url), 'utf8')
const homePage = readFileSync(new URL('../../index.html', import.meta.url), 'utf8')

test('separates website maintenance logs from everyday moments', () => {
  assert.match(momentsPage, /where: "category", "网站维护日志"/)
  assert.match(momentsPage, /id="maintenance-log"/)
  assert.match(momentsPage, /moment\.category != '网站维护日志'/)
})

test('keeps maintenance entries out of the homepage daily moments feed', () => {
  assert.match(homePage, /moment\.published != false and moment\.category != '网站维护日志'/)
})
