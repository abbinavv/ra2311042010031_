'use client';

import { Box, Chip } from '@mui/material';
import { NotificationType } from '@/types/notification';

const FILTERS: Array<NotificationType | 'All'> = ['All', 'Placement', 'Result', 'Event'];
const COLORS: Record<string, 'default' | 'success' | 'warning' | 'info'> = {
  All: 'default', Placement: 'success', Result: 'warning', Event: 'info',
};

interface Props {
  active: NotificationType | 'All';
  onChange: (f: NotificationType | 'All') => void;
}

export default function FilterBar({ active, onChange }: Props) {
  return (
    <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
      {FILTERS.map(f => (
        <Chip
          key={f}
          label={f}
          color={COLORS[f]}
          variant={active === f ? 'filled' : 'outlined'}
          onClick={() => onChange(f)}
          sx={{ fontWeight: active === f ? 700 : 400 }}
        />
      ))}
    </Box>
  );
}
