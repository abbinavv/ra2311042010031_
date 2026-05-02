'use client';

import { useState, useEffect } from 'react';
import { Box, Typography, Alert, CircularProgress } from '@mui/material';
import { EmojiEvents } from '@mui/icons-material';
import NotificationCard from '@/components/NotificationCard';
import FilterBar from '@/components/FilterBar';
import TopNSelector from '@/components/TopNSelector';
import { useViewedIds } from '@/hooks/useViewedIds';
import { fetchAllNotifications, sendLog } from '@/lib/apiClient';
import { getTopN } from '@/lib/priorityScore';
import { ScoredNotification, NotificationType } from '@/types/notification';

export default function PriorityInboxPage() {
  const [topN, setTopN] = useState(10);
  const [filter, setFilter] = useState<NotificationType | 'All'>('All');
  const [all, setAll] = useState<ScoredNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isViewed, markViewed } = useViewedIds();

  useEffect(() => {
    sendLog('frontend', 'info', 'page', 'Priority Inbox page loaded');
    loadAndScore();
  }, []);

  async function loadAndScore() {
    setLoading(true);
    setError(null);
    await sendLog('frontend', 'debug', 'hook', 'Priority inbox: fetching notifications for scoring');
    try {
      const data = await fetchAllNotifications();
      setAll(getTopN(data, 100));
      await sendLog('frontend', 'info', 'state', `Priority inbox: scored ${data.length} notifications`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setError(msg);
      await sendLog('frontend', 'error', 'hook', `Priority inbox fetch failed: ${msg}`);
    } finally {
      setLoading(false);
    }
  }

  const handleTopNChange = (n: number) => {
    sendLog('frontend', 'info', 'component', `Top-N selector changed to ${n}`);
    setTopN(n);
  };

  const handleFilterChange = (f: NotificationType | 'All') => {
    sendLog('frontend', 'info', 'component', `Priority inbox filter changed to ${f}`);
    setFilter(f);
  };

  const displayed = all
    .filter(n => filter === 'All' || n.Type === filter)
    .slice(0, topN)
    .map((n, i) => ({ ...n, rank: i + 1 }));

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <EmojiEvents color="warning" fontSize="large" />
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Priority Inbox</Typography>
          <Typography variant="body2" color="text.secondary">
            Top notifications ranked by importance and recency
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <TopNSelector value={topN} onChange={handleTopNChange} />
        <FilterBar active={filter} onChange={handleFilterChange} />
      </Box>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>Failed to load notifications: {error}</Alert>
      )}

      {!loading && !error && displayed.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Typography color="text.secondary">No notifications match the current filter.</Typography>
        </Box>
      )}

      {!loading && !error && displayed.map(n => (
        <NotificationCard
          key={n.ID}
          notification={n}
          isNew={!isViewed(n.ID)}
          onView={markViewed}
          rank={n.rank}
        />
      ))}

      {!loading && !error && displayed.length > 0 && (
        <Box sx={{ mt: 3, p: 2, bgcolor: '#fff', borderRadius: 3, border: '1px solid #e0e0e0' }}>
          <Typography variant="caption" color="text.secondary">
            Scoring: <strong>score = typeWeight × (1 / (secondsAgo + 1))</strong> — Placement=3, Result=2, Event=1
          </Typography>
        </Box>
      )}
    </Box>
  );
}
