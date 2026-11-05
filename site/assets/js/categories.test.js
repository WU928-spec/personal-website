import test from 'node:test'
import assert from 'node:assert/strict'
import { articleCategory, categoryFromSearch } from './categories.js'

test('maps known writing types and normalizes poetry', () => {
  assert.equal(articleCategory('诗'), '诗歌')
  assert.equal(articleCategory('散文'), '散文')
  assert.equal(articleCategory('计算机&金融'), '计算机&金融')
})

test('puts missing and unknown categories into uncategorized', () => {
  assert.equal(articleCategory(''), '未归档')
  assert.equal(articleCategory(undefined), '未归档')
  assert.equal(articleCategory('新类型'), '未归档')
})

test('reads shareable category links and falls back safely', () => {
  assert.equal(categoryFromSearch('?category=散文'), '散文')
  assert.equal(categoryFromSearch('?category=诗'), '诗歌')
  assert.equal(categoryFromSearch('?category=不存在'), '全部')
  assert.equal(categoryFromSearch(''), '全部')
})
