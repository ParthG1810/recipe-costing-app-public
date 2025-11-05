'use client';
import dynamic from 'next/dynamic';
import { Box, CircularProgress, Typography } from '@mui/material';
import DashboardLayout from '../components/DashboardLayout';

// Dynamically import the component with SSR disabled to prevent hydration errors
const RecipeCreationContent = dynamic(() => import('./RecipeCreationContent'), {
  ssr: false,
  loading: () => (
    <DashboardLayout>
      <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Loading Recipe Creation...
        </Typography>
      </Box>
    </DashboardLayout>
  ),
});

export default function RecipeCreationPage() {
  return <RecipeCreationContent />;
}
