import test from 'node:test'
import assert from 'node:assert/strict'
import { segmentEnglish } from './text-segmenter.js'

test('segments sentences and preserves empty input', () => {
  assert.equal(segmentEnglish('Hello world. This is a note.'), 'Hello world.\n\nThis is a note.')
  assert.equal(segmentEnglish(''), '')
})

test('does not split common abbreviations and preserves existing line breaks', () => {
  assert.equal(segmentEnglish('Dr. Smith arrived. He said hello.'), 'Dr. Smith arrived.\n\nHe said hello.')
  assert.equal(segmentEnglish('A title\nHello world. Next sentence.'), 'A title\nHello world.\n\nNext sentence.')
})
