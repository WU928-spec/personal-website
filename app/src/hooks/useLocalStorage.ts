import { useState } from 'react'
import { createStorageKey } from '@/utils/storage'

/**
 * useLocalStorage - 类型安全的 localStorage hook
 * @param key - localStorage 键名
 * @param initialValue - 默认值
 * @returns [value, setValue, removeValue]
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const storage = createStorageKey<T>(key, initialValue)
  const [storedValue, setStoredValue] = useState<T>(() => storage.load())

  const setValue = (value: T | ((val: T) => T)) => {
    const valueToStore = value instanceof Function ? value(storedValue) : value
    setStoredValue(valueToStore)
    storage.save(valueToStore)
  }

  const removeValue = () => {
    storage.remove()
    setStoredValue(initialValue)
  }

  return [storedValue, setValue, removeValue] as const
}
