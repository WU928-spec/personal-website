import test from 'node:test'
import assert from 'node:assert/strict'
import { brightProgress, nextLetterPage, PRELOAD_ASSETS, withTimeout } from './starry.js'

test('tracks only bright memories and completes when all are read', () => {
  const memoirs = [
    { id: '1', brightness: 1 },
    { id: '2', brightness: 0.05 },
    { id: '3', brightness: 1 },
  ]
  assert.deepEqual(brightProgress(memoirs, ['1']), { remaining: ['3'], complete: false })
  assert.deepEqual(brightProgress(memoirs, ['1', '3']), { remaining: [], complete: true })
})

test('does not complete an empty sky', () => {
  assert.deepEqual(brightProgress([], []), { remaining: [], complete: false })
})

test('moves letter pages forward without passing the final page', () => {
  assert.equal(nextLetterPage(0, 14), 1)
  assert.equal(nextLetterPage(12, 14), 13)
  assert.equal(nextLetterPage(13, 14), 13)
})

test('preloads every critical starry resource and resolves stalled media safely', async () => {
  for (const path of ['starry-bg.jpg', 'starry-video.mp4', 'next-video.mp4', 'letter-bg.jpg', 'golden-glasses.png', 'starry-images/1-0.jpg', 'starry-images/1-1.jpg']) {
    assert.ok(PRELOAD_ASSETS.some((asset) => asset.endsWith(path)), path)
  }
  assert.equal(await withTimeout(new Promise(() => {}), 5), undefined)
})
