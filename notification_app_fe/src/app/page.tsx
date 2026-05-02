'use client';

import { useEffect } from 'react';
import { Box, Typography, Alert, CircularProgress } from '@mui/material';
import { Inbox } from '@mui/icons-material';
import NotificationCard from '@/components/NotificationCard';
import FilterBar from '@/components/FilterBar';
import PaginationControls from '@/components/PaginationControls';
import { useNotifications } from '@/hooks/useNotifications';
import { useViewedIds } from '@/hooks/useViewedIds';
import { sendLog } from '@/lib/apiClient';

export default function AllNotificationsPage() {
  const { notifications, filter, page, loading, error, hasMore, changeFilter, nextPage, prevPage } = useNotifications();
  const { isViewed, markViewed } = useViewedIds();

  useEffect(() => {
    sendLog('frontend', 'info', 'page', 'All Notifications page loaded');
  }, []);

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <Inbox color="primary" fontSize="large" />
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>All Notifications</Typography>
          <Typography variant="body2" color="text.secondary">
            Stay updated with campus placements, results, and events
          </Typography>
        </Box>
      </Box>

      <FilterBar active={filter} onChange={changeFilter} />

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>Failed to load notifications: {error}</Alert>
      )}

      {!loading && !error && notifications.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Typography color="text.secondary">No notifications found.</Typography>
        </Box>
      )}

      {!loading && !error && notifications.map(n => (
        <NotificationCard
          key={n.ID}
          notification={n}
          isNew={!isViewed(n.ID)}
          onView={markViewed}
        />
      ))}

      {!loading && !error && notifications.length > 0 && (
        <PaginationControls page={page} hasMore={hasMore} onPrev={prevPage} onNext={nextPage} />
      )}
    </Box>
  );
}
