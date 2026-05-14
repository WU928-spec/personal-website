import { createStorageKey, createLangStorageKey } from './storage'

// Use a real in-memory localStorage for these tests
function createMemoryStorage(): Storage {
  const store = new Map<string, string>()
  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => store.set(key, value),
    removeItem: (key: string) => store.delete(key),
    clear: () => store.clear(),
    length: 0,
    key: () => null,
  } as Storage
}

describe('createStorageKey', () => {
  let originalStorage: Storage

  beforeEach(() => {
    originalStorage = global.localStorage
    global.localStorage = createMemoryStorage()
  })

  afterEach(() => {
    global.localStorage = originalStorage
  })

  it('should load default value when localStorage is empty', () => {
    const storage = createStorageKey('test_key', { count: 0 })
    expect(storage.load()).toEqual({ count: 0 })
  })

  it('should save and load data', () => {
    const storage = createStorageKey<number[]>('test_key', [])
    storage.save([1, 2, 3])
    expect(storage.load()).toEqual([1, 2, 3])
  })

  it('should remove data', () => {
    const storage = createStorageKey('test_key', 'default')
    storage.save('value')
    storage.remove()
    expect(storage.load()).toBe('default')
  })

  it('should return default value when JSON parse fails', () => {
    global.localStorage.setItem('test_key', 'invalid json')
    const storage = createStorageKey('test_key', { fallback: true })
    expect(storage.load()).toEqual({ fallback: true })
  })

  it('should isolate different keys', () => {
    const a = createStorageKey('key_a', 'a_default')
    const b = createStorageKey('key_b', 'b_default')
    a.save('a_value')
    b.save('b_value')
    expect(a.load()).toBe('a_value')
    expect(b.load()).toBe('b_value')
  })
})

describe('createLangStorageKey', () => {
  let originalStorage: Storage

  beforeEach(() => {
    originalStorage = global.localStorage
    global.localStorage = createMemoryStorage()
  })

  afterEach(() => {
    global.localStorage = originalStorage
  })

  it('should load zh default', () => {
    const storage = createLangStorageKey('hero', { zh: '中文', en: 'English' })
    expect(storage.load('zh')).toBe('中文')
  })

  it('should load en default', () => {
    const storage = createLangStorageKey('hero', { zh: '中文', en: 'English' })
    expect(storage.load('en')).toBe('English')
  })

  it('should save and load per language', () => {
    const storage = createLangStorageKey('skills', { zh: [], en: [] })
    storage.save('zh', ['ts', 'react'])
    storage.save('en', ['TS', 'React'])
    expect(storage.load('zh')).toEqual(['ts', 'react'])
    expect(storage.load('en')).toEqual(['TS', 'React'])
  })

  it('should saveAll at once', () => {
    const storage = createLangStorageKey('footer', { zh: '', en: '' })
    storage.saveAll({ zh: '页脚', en: 'Footer' })
    expect(storage.load('zh')).toBe('页脚')
    expect(storage.load('en')).toBe('Footer')
  })
})
