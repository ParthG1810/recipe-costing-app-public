'use client';
import dynamic from 'next/dynamic';
import { Box, CircularProgress, Typography } from '@mui/material';
import DashboardLayout from '../../components/DashboardLayout';

const MenuFinalizationContent = dynamic(() => import('./MenuFinalizationContent'), {
  ssr: false,
  loading: () => (
    <DashboardLayout>
      <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Loading Menu Finalization...
        </Typography>
      </Box>
    </DashboardLayout>
  ),
});

export default function MenuFinalizationPage() {
  return <MenuFinalizationContent />;
}
