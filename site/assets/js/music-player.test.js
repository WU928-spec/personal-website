import test from 'node:test'
import assert from 'node:assert/strict'
import { formatTime, nextTrackIndex, normalizeMusicState } from './music-player.js'

test('uses safe defaults and restores a valid music state', () => {
  assert.deepEqual(normalizeMusicState(null, 3), { track: 0, time: 0, volume: 0, playing: false })
  assert.deepEqual(normalizeMusicState({ track: 1, time: 42.5, volume: 0.25, playing: true }, 3), {
    track: 1, time: 42.5, volume: 0.25, playing: true,
  })
})

test('clamps invalid music state without producing invalid playback values', () => {
  assert.deepEqual(normalizeMusicState({ track: 99, time: -4, volume: 5, playing: true }, 3), {
    track: 0, time: 0, volume: 1, playing: true,
  })
  assert.equal(nextTrackIndex(2, 3), 0)
  assert.equal(nextTrackIndex(0, 3), 1)
  assert.equal(formatTime(65.4), '1:05')
  assert.equal(formatTime(Number.NaN), '0:00')
})
