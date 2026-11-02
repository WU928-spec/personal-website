import test from 'node:test'
import assert from 'node:assert/strict'
import { segmentEnglish } from './text-segmenter.js'

test('segments sentences and preserves empty input', () => {
  assert.equal(segmentEnglish('Hello world. This is a note.'), 'Hello world.\n\nThis is a note.')
  assert.equal(segmentEnglish(''), '')
})
