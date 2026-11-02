import test from 'node:test'
import assert from 'node:assert/strict'
import { salaryScore, commuteScore, totalScore } from './internship.js'
import { recommendMovie } from './movies.js'
import { parseGitCommand, parseCondaCommand } from './devtools.js'

test('clamps scores and handles invalid inputs', () => {
  assert.equal(salaryScore(0), 0)
  assert.equal(salaryScore(999), 100)
  assert.equal(commuteScore(-1), 100)
  assert.equal(totalScore({ salary: 300, commute: 0, intensity: 1, atmosphere: 10, growth: 10 }), 100)
})

test('movie fallback and invalid commands are safe', () => {
  assert.equal(recommendMovie('不存在的类型', []).title, '每日推荐')
  assert.equal(parseGitCommand('rm -rf /'), null)
  assert.equal(parseCondaCommand(''), null)
})

test('rejects missing and non-finite offer values without producing NaN', () => {
  for (const value of ['', Number.NaN, Number.POSITIVE_INFINITY, undefined]) {
    assert.equal(salaryScore(value), 0)
    assert.equal(commuteScore(value), 0)
  }
  assert.equal(totalScore({}), 0)
  assert.equal(totalScore({ salary: 175, commute: '', intensity: 5, atmosphere: 5, growth: 5 }), 0)
  assert.equal(totalScore({ salary: 175, commute: 45, intensity: Number.NaN, atmosphere: 5, growth: 5 }), 0)
  assert.equal(totalScore({ salary: 175, commute: 45, intensity: 5, atmosphere: Number.POSITIVE_INFINITY, growth: 5 }), 0)
})

test('requires an environment or package argument for Conda actions', () => {
  for (const command of ['conda create', 'conda activate', 'conda install', 'conda remove']) {
    assert.equal(parseCondaCommand(command), null)
  }
  assert.deepEqual(parseCondaCommand('conda env list'), { action: 'list' })
  assert.deepEqual(parseCondaCommand('conda deactivate'), { action: 'deactivate' })
  assert.deepEqual(parseCondaCommand('conda create -n notes'), { action: 'create', name: 'notes' })
})
