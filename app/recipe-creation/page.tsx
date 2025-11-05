import { Suspense } from 'react';
import RecipeCreationContent from './RecipeCreationContent';
import DashboardLayout from '../components/DashboardLayout';
import { Box, Typography, CircularProgress } from '@mui/material';

function LoadingFallback() {
  return (
    <DashboardLayout>
      <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Loading...
        </Typography>
      </Box>
    </DashboardLayout>
  );
}

export default function RecipeCreationPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <RecipeCreationContent />
    </Suspense>
  );
}
