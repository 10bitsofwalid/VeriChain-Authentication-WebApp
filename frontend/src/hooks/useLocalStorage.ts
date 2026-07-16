// src/hooks/useLocalStorage.ts
import { useState, useCallback } from 'react';
import type { StorageKey } from '../utils/constants';

/**
 * A typed wrapper around localStorage that keeps a React state value
 * in sync with the stored JSON value.
 *
 * @param key    - One of the centralised STORAGE_KEYS constants.
 * @param initial - The value to use when no entry exists yet.
 * @returns [storedValue, setValue] — identical API to useState.
 */
export function useLocalStorage<T>(key: StorageKey, initial: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initial;
    } catch {
      return initial;
    }
  });

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue((prev) => {
        const next = value instanceof Function ? value(prev) : value;
        try {
          localStorage.setItem(key, JSON.stringify(next));
        } catch {
          // Silently ignore quota errors — UI will still update in-memory.
        }
        return next;
      });
    },
    [key],
  );

  return [storedValue, setValue];
}
