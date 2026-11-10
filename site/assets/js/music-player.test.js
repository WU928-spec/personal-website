import test from 'node:test'
import assert from 'node:assert/strict'
import { formatTime, nextPlayMode, nextTrackIndex, normalizeMusicState } from './music-player.js'

test('uses safe defaults and restores a valid music state', () => {
  assert.deepEqual(normalizeMusicState(null, 3), { track: 0, time: 0, volume: 0, playing: false, mode: 'sequential' })
  assert.deepEqual(normalizeMusicState({ track: 1, time: 42.5, volume: 0.25, playing: true, mode: 'repeat' }, 3), {
    track: 1, time: 42.5, volume: 0.25, playing: true, mode: 'repeat',
  })
})

test('clamps invalid music state without producing invalid playback values', () => {
  assert.deepEqual(normalizeMusicState({ track: 99, time: -4, volume: 5, playing: true, mode: 'invalid' }, 3), {
    track: 0, time: 0, volume: 1, playing: true, mode: 'sequential',
  })
  assert.equal(nextTrackIndex(2, 3), 0)
  assert.equal(nextTrackIndex(0, 3), 1)
  assert.equal(formatTime(65.4), '1:05')
  assert.equal(formatTime(Number.NaN), '0:00')
})

test('cycles playback modes and honors repeat and shuffle selection', () => {
  assert.equal(nextPlayMode('sequential'), 'repeat')
  assert.equal(nextPlayMode('repeat'), 'shuffle')
  assert.equal(nextPlayMode('shuffle'), 'sequential')
  assert.equal(nextTrackIndex(1, 3, 'repeat'), 1)
  assert.equal(nextTrackIndex(1, 3, 'shuffle', () => 0.99), 2)
  assert.equal(nextTrackIndex(1, 3, 'shuffle', () => 0.34), 2)
})
