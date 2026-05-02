'use client';

import { useState, useEffect, useCallback } from 'react';
import { sendLog } from '@/lib/apiClient';

const STORAGE_KEY = 'viewed_notification_ids';

export function useViewedIds() {
  const [viewedIds, setViewedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setViewedIds(new Set(JSON.parse(stored)));
    } catch {
      // localStorage unavailable
    }
    sendLog('frontend', 'debug', 'hook', 'useViewedIds: loaded viewed IDs from localStorage');
  }, []);

  const markViewed = useCallback((id: string) => {
    setViewedIds(prev => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
      } catch {
        // localStorage unavailable
      }
      sendLog('frontend', 'info', 'state', `Notification ${id} marked as viewed`);
      return next;
    });
  }, []);

  const isViewed = useCallback((id: string) => viewedIds.has(id), [viewedIds]);

  return { isViewed, markViewed };
}
