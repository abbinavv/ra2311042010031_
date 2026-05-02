'use client';

import { Box, Button, Typography } from '@mui/material';
import { ArrowBack, ArrowForward } from '@mui/icons-material';

interface Props {
  page: number;
  hasMore: boolean;
  onPrev: () => void;
  onNext: () => void;
}

export default function PaginationControls({ page, hasMore, onPrev, onNext }: Props) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mt: 3 }}>
      <Button variant="outlined" startIcon={<ArrowBack />} onClick={onPrev} disabled={page === 1}>
        Previous
      </Button>
      <Typography variant="body2" color="text.secondary">Page {page}</Typography>
      <Button variant="outlined" endIcon={<ArrowForward />} onClick={onNext} disabled={!hasMore}>
        Next
      </Button>
    </Box>
  );
}
