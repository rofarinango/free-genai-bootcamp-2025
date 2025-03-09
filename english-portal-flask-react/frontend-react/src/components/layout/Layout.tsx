import { Outlet } from 'react-router-dom';
import { Navigation } from './Navigation';
import { Box, Container, Toolbar } from '@mui/material';

export function Layout() {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Navigation />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - 250px)` },
          ml: { sm: '250px' },
        }}
      >
        <Toolbar /> {/* This adds space for the fixed AppBar */}
        <Container maxWidth="xl" sx={{ py: 3 }}>
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
} 