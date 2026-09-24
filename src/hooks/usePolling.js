import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook to poll an async function at regular intervals (e.g. 3000ms)
 * Pauses automatically if the browser tab is hidden to conserve resources.
 */
export function usePolling(fetcher, intervalMs = 3500, enabled = true) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isPulsing, setIsPulsing] = useState(false);

  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const executeFetch = useCallback(async (isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
      const result = await fetcherRef.current();
      setData(result);
      setLastUpdated(new Date());
      setError(null);
      // Trigger a brief 500ms visual pulse
      setIsPulsing(true);
      setTimeout(() => setIsPulsing(false), 500);
    } catch (err) {
      console.warn('Polling error:', err);
      setError(err);
    } finally {
      if (isInitial) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;

    // Initial immediate fetch
    executeFetch(true);

    const intervalId = setInterval(() => {
      // Do not poll if user has backgrounded the tab
      if (!document.hidden) {
        executeFetch(false);
      }
    }, intervalMs);

    // Refresh immediately when returning to tab
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        executeFetch(false);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [intervalMs, enabled, executeFetch]);

  return {
    data,
    loading,
    error,
    lastUpdated,
    isPulsing,
    refresh: () => executeFetch(false),
  };
}
