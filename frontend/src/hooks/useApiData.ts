// src/hooks/useApiData.ts
import { useState, useEffect } from 'react';
import client from '../api/client';

export interface ApiDataState<T> {
  data: T | null;
  loading: boolean;
  error: string;
}

/**
 * Generic hook for simple GET requests.
 * Re-fetches automatically whenever `url` changes.
 *
 * Usage:
 *   const { data, loading, error } = useApiData<MyType>('/some/endpoint');
 *
 * For pages that need fine-grained 404 handling or cancellation,
 * keep a custom useEffect — this hook is best suited for straightforward
 * data-loading pages.
 */
export function useApiData<T>(url: string | null): ApiDataState<T> {
  const [state, setState] = useState<ApiDataState<T>>({
    data: null,
    loading: !!url,
    error: '',
  });

  useEffect(() => {
    if (!url) {
      setState({ data: null, loading: false, error: '' });
      return;
    }

    let active = true;
    setState((prev) => ({ ...prev, loading: true, error: '' }));

    client
      .get(url)
      .then((res) => {
        if (active) setState({ data: res.data as T, loading: false, error: '' });
      })
      .catch((err: any) => {
        if (active) {
          const msg = err.response?.data?.message || 'Failed to load data.';
          setState({ data: null, loading: false, error: msg });
        }
      });

    return () => {
      active = false;
    };
  }, [url]);

  return state;
}
