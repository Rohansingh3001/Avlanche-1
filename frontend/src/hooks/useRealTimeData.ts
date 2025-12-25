import { useState, useEffect, useCallback } from 'react';

interface UseRealTimeDataOptions {
  endpoint: string;
  interval?: number;
  enabled?: boolean;
}

interface UseRealTimeDataReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useRealTimeData<T>({
  endpoint,
  interval = 30000, // 30 seconds default
  enabled = true,
}: UseRealTimeDataOptions): UseRealTimeDataReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!enabled) return;

    try {
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      setData(result.data || result);
      setError(null);
    } catch (err: any) {
      console.error(`Error fetching data from ${endpoint}:`, err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [endpoint, enabled]);

  const refresh = useCallback(async () => {
    setLoading(true);
    await fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!enabled) return;

    // Initial fetch
    fetchData();

    // Set up interval
    const intervalId = setInterval(fetchData, interval);

    return () => clearInterval(intervalId);
  }, [fetchData, interval, enabled]);

  return { data, loading, error, refresh };
}

// WebSocket hook for real-time updates
interface UseWebSocketOptions {
  url: string;
  enabled?: boolean;
  onMessage?: (data: any) => void;
  onError?: (error: Event) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

interface UseWebSocketReturn {
  isConnected: boolean;
  send: (data: any) => void;
  close: () => void;
}

export function useWebSocket({
  url,
  enabled = true,
  onMessage,
  onError,
  onConnect,
  onDisconnect,
}: UseWebSocketOptions): UseWebSocketReturn {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const send = useCallback((data: any) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(data));
    } else {
      console.warn('WebSocket is not connected');
    }
  }, [socket]);

  const close = useCallback(() => {
    if (socket) {
      socket.close();
    }
  }, [socket]);

  useEffect(() => {
    if (!enabled) return;

    const ws = new WebSocket(url);

    ws.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      onConnect?.();
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage?.(data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      onError?.(error);
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
      onDisconnect?.();
    };

    setSocket(ws);

    return () => {
      ws.close();
    };
  }, [url, enabled, onMessage, onError, onConnect, onDisconnect]);

  return { isConnected, send, close };
}

// Hook for managing periodic refresh of multiple data sources
interface DataSource {
  key: string;
  fetcher: () => Promise<any>;
  interval?: number;
}

interface UseMultipleDataSourcesOptions {
  sources: DataSource[];
  enabled?: boolean;
}

interface UseMultipleDataSourcesReturn {
  data: Record<string, any>;
  loading: Record<string, boolean>;
  errors: Record<string, string | null>;
  refreshAll: () => Promise<void>;
  refresh: (key: string) => Promise<void>;
}

export function useMultipleDataSources({
  sources,
  enabled = true,
}: UseMultipleDataSourcesOptions): UseMultipleDataSourcesReturn {
  const [data, setData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string | null>>({});

  const fetchData = useCallback(async (source: DataSource) => {
    if (!enabled) return;

    setLoading(prev => ({ ...prev, [source.key]: true }));
    
    try {
      const result = await source.fetcher();
      setData(prev => ({ ...prev, [source.key]: result }));
      setErrors(prev => ({ ...prev, [source.key]: null }));
    } catch (error: any) {
      console.error(`Error fetching ${source.key}:`, error);
      setErrors(prev => ({ ...prev, [source.key]: error.message }));
    } finally {
      setLoading(prev => ({ ...prev, [source.key]: false }));
    }
  }, [enabled]);

  const refresh = useCallback(async (key: string) => {
    const source = sources.find(s => s.key === key);
    if (source) {
      await fetchData(source);
    }
  }, [sources, fetchData]);

  const refreshAll = useCallback(async () => {
    await Promise.all(sources.map(source => fetchData(source)));
  }, [sources, fetchData]);

  useEffect(() => {
    if (!enabled || sources.length === 0) return;

    // Initial fetch for all sources
    refreshAll();

    // Set up intervals for each source
    const intervals = sources.map(source => {
      const interval = source.interval || 30000;
      return setInterval(() => fetchData(source), interval);
    });

    return () => {
      intervals.forEach(clearInterval);
    };
  }, [sources, enabled, fetchData, refreshAll]);

  return { data, loading, errors, refreshAll, refresh };
}