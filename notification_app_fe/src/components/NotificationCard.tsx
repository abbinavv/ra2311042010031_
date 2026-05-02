'use client';

import { Card, CardContent, Chip, Typography, Box } from '@mui/material';
import { Work, School, Event } from '@mui/icons-material';
import { Notification } from '@/types/notification';

const TYPE_CONFIG = {
  Placement: { color: 'success' as const, icon: <Work fontSize="small" />, bg: '#e8f5e9' },
  Result:    { color: 'warning' as const, icon: <School fontSize="small" />, bg: '#fff8e1' },
  Event:     { color: 'info' as const,    icon: <Event fontSize="small" />,  bg: '#e3f2fd' },
};

interface Props {
  notification: Notification;
  isNew: boolean;
  onView: (id: string) => void;
  rank?: number;
}

function formatTime(ts: string): string {
  const diffMs = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function NotificationCard({ notification, isNew, onView, rank }: Props) {
  const cfg = TYPE_CONFIG[notification.Type];

  return (
    <Card
      onClick={() => onView(notification.ID)}
      sx={{
        mb: 1.5,
        cursor: 'pointer',
        border: isNew ? '2px solid #1565c0' : '1px solid #e0e0e0',
        bgcolor: isNew ? '#fafbff' : '#fff',
        transition: 'box-shadow 0.15s, transform 0.15s',
        '&:hover': { boxShadow: 4, transform: 'translateY(-1px)' },
      }}
    >
      <CardContent sx={{ py: '12px !important', px: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {rank && (
            <Box sx={{
              minWidth: 32, height: 32, borderRadius: '50%',
              bgcolor: 'primary.main', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: 13, flexShrink: 0,
            }}>
              {rank}
            </Box>
          )}

          <Box sx={{
            width: 36, height: 36, borderRadius: '50%', bgcolor: cfg.bg,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            {cfg.icon}
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.3 }}>
              <Chip label={notification.Type} color={cfg.color} size="small" />
              {isNew && <Chip label="NEW" color="primary" size="small" variant="outlined" />}
            </Box>
            <Typography variant="body1" sx={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {notification.Message}
            </Typography>
          </Box>

          <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>
            {formatTime(notification.Timestamp)}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
