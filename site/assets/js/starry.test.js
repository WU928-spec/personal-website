import test from 'node:test'
import assert from 'node:assert/strict'

function createElement(id = '') {
  const listeners = new Map()
  const properties = new Map()
  return {
    hidden: true,
    dataset: { memoirId: id },
    classList: { contains: () => true },
    style: {
      getPropertyValue: () => '',
      setProperty: (key, value) => properties.set(key, value),
    },
    addEventListener(type, listener) { listeners.set(type, listener) },
    click() { listeners.get('click')?.() },
  }
}

test('reading a bright memory preserves progress and reveals the unlocked letter', async (t) => {
  const star = createElement('1')
  const secretLink = createElement()
  const stored = new Map()
  globalThis.document = {
    body: { dataset: { starryPage: 'home' } },
    getElementById(id) { return id === 'secret-entry' ? secretLink : null },
    querySelectorAll(selector) { return selector === '.memory-star' ? [star] : [] },
  }
  globalThis.window = { location: { search: '', href: '' } }
  globalThis.localStorage = {
    getItem(key) { return stored.get(key) ?? null },
    setItem(key, value) { stored.set(key, value) },
  }
  t.after(() => {
    delete globalThis.document
    delete globalThis.window
    delete globalThis.localStorage
  })

  await import('./starry.js?unread')
  assert.equal(secretLink.hidden, true)
  star.click()
  assert.equal(stored.get('starry-bright-clicked'), '["1"]')
  assert.equal(stored.get('wuspace-starry-complete'), 'true')

  await import('./starry.js?read')
  assert.equal(secretLink.hidden, false)
})
