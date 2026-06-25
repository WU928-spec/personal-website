/**
 * 统一的 localStorage 工具函数
 * 消除重复的读写逻辑
 */

export interface StorageKey<T> {
  load: () => T
  save: (data: T) => void
  remove: () => void
}

/**
 * 创建一个类型安全的 localStorage 键
 * @param key localStorage 键名
 * @param defaultValue 默认值
 * @returns 包含 load/save/remove 方法的对象
 */
export function createStorageKey<T>(key: string, defaultValue: T): StorageKey<T> {
  return {
    load: (): T => {
      try {
        const raw = localStorage.getItem(key)
        if (raw) {
          return JSON.parse(raw) as T
        }
      } catch {
        return defaultValue
      }
      return defaultValue
    },

    save: (data: T): void => {
      try {
        localStorage.setItem(key, JSON.stringify(data))
      } catch {
        /* ignore localStorage write errors */
      }
    },

    remove: (): void => {
      try {
        localStorage.removeItem(key)
      } catch {
        /* ignore localStorage remove errors */
      }
    }
  }
}

/**
 * 创建支持多语言的 localStorage 键
 * @param keyPrefix 键名前缀
 * @param defaultValues 默认值（按语言）
 * @returns 包含 load/save 方法的对象
 */
export function createLangStorageKey<T>(
  keyPrefix: string,
  defaultValues: { zh: T; en: T }
): {
  load: (lang: 'zh' | 'en') => T
  save: (lang: 'zh' | 'en', data: T) => void
  saveAll: (data: { zh: T; en: T }) => void
} {
  const zhKey = createStorageKey(`${keyPrefix}_zh`, defaultValues.zh)
  const enKey = createStorageKey(`${keyPrefix}_en`, defaultValues.en)

  return {
    load: (lang: 'zh' | 'en'): T => {
      return lang === 'zh' ? zhKey.load() : enKey.load()
    },

    save: (lang: 'zh' | 'en', data: T): void => {
      if (lang === 'zh') {
        zhKey.save(data)
      } else {
        enKey.save(data)
      }
    },

    saveAll: (data: { zh: T; en: T }): void => {
      zhKey.save(data.zh)
      enKey.save(data.en)
    }
  }
}
