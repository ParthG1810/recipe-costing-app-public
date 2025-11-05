'use client';
import dynamic from 'next/dynamic';
import { Box, CircularProgress, Typography } from '@mui/material';
import DashboardLayout from '../../components/DashboardLayout';

const TemplateLibraryContent = dynamic(() => import('./TemplateLibraryContent'), {
  ssr: false,
  loading: () => (
    <DashboardLayout>
      <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Loading Template Library...
        </Typography>
      </Box>
    </DashboardLayout>
  ),
});

export default function TemplateLibraryPage() {
  return <TemplateLibraryContent />;
}
