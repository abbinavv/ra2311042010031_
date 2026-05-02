'use client';

import { FormControl, InputLabel, Select, MenuItem, SelectChangeEvent } from '@mui/material';

interface Props {
  value: number;
  onChange: (n: number) => void;
}

export default function TopNSelector({ value, onChange }: Props) {
  const handle = (e: SelectChangeEvent) => onChange(Number(e.target.value));
  return (
    <FormControl size="small" sx={{ minWidth: 140 }}>
      <InputLabel>Show top</InputLabel>
      <Select value={String(value)} label="Show top" onChange={handle}>
        <MenuItem value={10}>Top 10</MenuItem>
        <MenuItem value={15}>Top 15</MenuItem>
        <MenuItem value={20}>Top 20</MenuItem>
      </Select>
    </FormControl>
  );
}
