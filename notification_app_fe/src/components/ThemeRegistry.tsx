'use client';

import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { NotificationsActive } from '@mui/icons-material';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const theme = createTheme({
  palette: {
    primary: { main: '#1565c0' },
    secondary: { main: '#e53935' },
    background: { default: '#f5f7fa' },
  },
  typography: { fontFamily: '"Segoe UI", system-ui, sans-serif' },
  components: {
    MuiCard: { styleOverrides: { root: { borderRadius: 12 } } },
  },
});

function NavBar() {
  const pathname = usePathname();
  return (
    <AppBar position="sticky" elevation={1}>
      <Toolbar>
        <NotificationsActive sx={{ mr: 1.5 }} />
        <Typography variant="h6" sx={{ fontWeight: 700, flexGrow: 1 }}>
          Campus Notifications
        </Typography>
        <Button
          color="inherit"
          component={Link}
          href="/"
          variant={pathname === '/' ? 'outlined' : 'text'}
          sx={{ mr: 1, borderColor: 'rgba(255,255,255,0.5)' }}
        >
          All Notifications
        </Button>
        <Button
          color="inherit"
          component={Link}
          href="/priority"
          variant={pathname === '/priority' ? 'outlined' : 'text'}
          sx={{ borderColor: 'rgba(255,255,255,0.5)' }}
        >
          Priority Inbox
        </Button>
      </Toolbar>
    </AppBar>
  );
}

export default function ThemeRegistry({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <NavBar />
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 3, px: { xs: 2, md: 4 } }}>
        {children}
      </Box>
    </ThemeProvider>
  );
}
