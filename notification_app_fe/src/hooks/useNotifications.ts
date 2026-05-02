'use client';

import { useState, useEffect, useCallback } from 'react';
import { Notification, NotificationType } from '@/types/notification';
import { fetchNotifications } from '@/lib/apiClient';
import { sendLog } from '@/lib/apiClient';

const PAGE_SIZE = 10;

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<NotificationType | 'All'>('All');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const load = useCallback(async (currentPage: number, currentFilter: NotificationType | 'All') => {
    setLoading(true);
    setError(null);
    await sendLog('frontend', 'debug', 'hook', `useNotifications: fetching page=${currentPage} filter=${currentFilter}`);
    try {
      const data = await fetchNotifications({
        limit: PAGE_SIZE,
        page: currentPage,
        notification_type: currentFilter,
      });
      setNotifications(data);
      setHasMore(data.length === PAGE_SIZE);
      await sendLog('frontend', 'info', 'hook', `useNotifications: fetched ${data.length} notifications`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setError(msg);
      await sendLog('frontend', 'error', 'hook', `useNotifications: fetch failed - ${msg}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(page, filter);
  }, [page, filter, load]);

  const changeFilter = useCallback((newFilter: NotificationType | 'All') => {
    sendLog('frontend', 'info', 'component', `Filter changed to: ${newFilter}`);
    setFilter(newFilter);
    setPage(1);
  }, []);

  const nextPage = useCallback(() => {
    if (hasMore) setPage(p => p + 1);
  }, [hasMore]);

  const prevPage = useCallback(() => {
    if (page > 1) setPage(p => p - 1);
  }, [page]);

  return { notifications, filter, page, loading, error, hasMore, changeFilter, nextPage, prevPage };
}
