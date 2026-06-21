// src/utils/storage.ts
// Simple wrapper around localStorage for persisting shopping state.
export function persistState(key: string, value: any): void {
  try {
    const serialized = JSON.stringify(value);
    localStorage.setItem(key, serialized);
  } catch (e) {
    console.error('Failed to persist state', key, e);
  }
}

export function retrieveState<T = any>(key: string): T | null {
  try {
    const item = localStorage.getItem(key);
    if (!item) return null;
    return JSON.parse(item) as T;
  } catch (e) {
    console.error('Failed to retrieve state', key, e);
    return null;
  }
}
