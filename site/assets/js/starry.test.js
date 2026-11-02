import test from 'node:test'
import assert from 'node:assert/strict'

function createElement() {
  const listeners = new Map()
  return {
    hidden: true,
    addEventListener(type, listener) { listeners.set(type, listener) },
    click() { listeners.get('click')?.() },
  }
}

test('reading a star memory marks the local epilogue as complete', async (t) => {
  const star = createElement()
  const secretLink = createElement()
  const stored = new Map()
  globalThis.document = {
    getElementById(id) { return id === 'secret-link' ? secretLink : null },
    querySelectorAll(selector) { return selector === '.star-point' ? [star] : [] },
  }
  globalThis.localStorage = {
    getItem(key) { return stored.get(key) ?? null },
    setItem(key, value) { stored.set(key, value) },
  }
  t.after(() => {
    delete globalThis.document
    delete globalThis.localStorage
  })

  await import('./starry.js?unread')
  assert.equal(secretLink.hidden, true)
  star.click()
  assert.equal(stored.get('wuspace-starry-complete'), 'true')

  await import('./starry.js?read')
  assert.equal(secretLink.hidden, false)
})
