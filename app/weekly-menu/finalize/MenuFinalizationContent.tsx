'use client';
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  IconButton,
  Snackbar,
  Alert,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Download as DownloadIcon,
  Share as ShareIcon,
  ContentCopy as CopyIcon,
  QrCode as QrCodeIcon,
  Preview as PreviewIcon,
} from '@mui/icons-material';
import DashboardLayout from '../../components/DashboardLayout';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const EXPORT_FORMATS = [
  { value: 'png', label: 'PNG (Image)' },
  { value: 'pdf', label: 'PDF (Document)' },
  { value: 'jpg', label: 'JPG (Image)' },
];

const EXPORT_QUALITIES = [
  { value: 'low', label: 'Low (Fast)' },
  { value: 'medium', label: 'Medium (Balanced)' },
  { value: 'high', label: 'High (Best Quality)' },
];

interface WeeklyMenu {
  id: number;
  week_start_date: string;
  name: string;
  description: string;
  total_cost: number | null;
  canva_design_id: string | null;
  export_url: string | null;
  is_published: boolean;
  items: any[];
  itemsByDay: any;
}

export default function MenuFinalizationContent() {
  const searchParams = useSearchParams();
  const menuIdParam = searchParams.get('menuId');
  
  const [menuId, setMenuId] = useState<number | null>(menuIdParam ? parseInt(menuIdParam) : null);
  const [menu, setMenu] = useState<WeeklyMenu | null>(null);
  const [menus, setMenus] = useState<WeeklyMenu[]>([]);
  const [isLoadingMenu, setIsLoadingMenu] = useState(false);
  const [isLoadingMenus, setIsLoadingMenus] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  
  const [exportFormat, setExportFormat] = useState('png');
  const [exportQuality, setExportQuality] = useState('high');
  const [shareUrl, setShareUrl] = useState('');
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  useEffect(() => {
    fetchMenus();
  }, []);

  useEffect(() => {
    if (menuId) {
      fetchMenu(menuId);
    }
  }, [menuId]);

  const fetchMenus = async () => {
    setIsLoadingMenus(true);
    try {
      const response = await fetch(`${API_URL}/api/weekly-menus`);
      const result = await response.json();
      
      if (result.success) {
        setMenus(result.data);
        if (result.data.length > 0 && !menuId) {
          setMenuId(result.data[0].id);
        }
      } else {
        showSnackbar(result.error || 'Failed to load menus', 'error');
      }
    } catch (error) {
      console.error('Error fetching menus:', error);
      showSnackbar('Failed to load menus', 'error');
    } finally {
      setIsLoadingMenus(false);
    }
  };

  const fetchMenu = async (id: number) => {
    setIsLoadingMenu(true);
    try {
      const response = await fetch(`${API_URL}/api/weekly-menus/${id}`);
      const result = await response.json();
      
      if (result.success) {
        setMenu(result.data);
      } else {
        showSnackbar(result.error || 'Failed to load menu', 'error');
      }
    } catch (error) {
      console.error('Error fetching menu:', error);
      showSnackbar('Failed to load menu', 'error');
    } finally {
      setIsLoadingMenu(false);
    }
  };

  const exportMenu = async () => {
    if (!menuId) {
      showSnackbar('Please select a menu first', 'error');
      return;
    }

    if (!menu?.canva_design_id) {
      showSnackbar('This menu does not have a Canva design. Please create one first.', 'error');
      return;
    }

    setIsExporting(true);

    try {
      const response = await fetch(`${API_URL}/api/canva/export-menu`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          menuId,
          format: exportFormat,
          quality: exportQuality,
        }),
      });

      const result = await response.json();

      if (result.success && result.data.export_url) {
        showSnackbar('Menu exported successfully', 'success');
        
        // Open export URL in new tab
        window.open(result.data.export_url, '_blank');
        
        // Refresh menu to get updated export_url
        fetchMenu(menuId);
      } else {
        showSnackbar(result.error || 'Failed to export menu', 'error');
      }
    } catch (error) {
      console.error('Error exporting menu:', error);
      showSnackbar('Failed to export menu', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const createShareLink = async () => {
    if (!menuId) {
      showSnackbar('Please select a menu first', 'error');
      return;
    }

    setIsSharing(true);

    try {
      const response = await fetch(`${API_URL}/api/canva/share-menu`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ menuId }),
      });

      const result = await response.json();

      if (result.success && result.data.share_url) {
        setShareUrl(result.data.share_url);
        setShareDialogOpen(true);
        showSnackbar('Share link created successfully', 'success');
      } else {
        showSnackbar(result.error || 'Failed to create share link', 'error');
      }
    } catch (error) {
      console.error('Error creating share link:', error);
      showSnackbar('Failed to create share link', 'error');
    } finally {
      setIsSharing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showSnackbar('Copied to clipboard', 'success');
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <DashboardLayout>
      {/* Fixed Navigation */}
      <Box sx={{ position: 'sticky', top: 0, zIndex: 10, bgcolor: 'background.default', py: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Menu Finalization & Export
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="outlined" href="/weekly-menu/builder">
              Menu Builder
            </Button>
            <Button variant="outlined" href="/weekly-menu/templates">
              Templates
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Main Content */}
      <Grid container spacing={3} sx={{ mt: 1 }}>
        {/* Left Panel - Menu Selection */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Select Menu
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              {isLoadingMenus ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : menus.length === 0 ? (
                <Box sx={{ py: 4, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    No menus found
                  </Typography>
                  <Button
                    variant="contained"
                    href="/weekly-menu/builder"
                    sx={{ mt: 2 }}
                  >
                    Create Menu
                  </Button>
                </Box>
              ) : (
                <List>
                  {menus.map((m) => (
                    <ListItem
                      key={m.id}
                      button
                      selected={menuId === m.id}
                      onClick={() => setMenuId(m.id)}
                    >
                      <ListItemText
                        primary={m.name}
                        secondary={`Week of ${formatDate(m.week_start_date)}`}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Right Panel - Export & Share */}
        <Grid size={{ xs: 12, md: 8 }}>
          {menu ? (
            <>
              {/* Menu Details */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {menu.name}
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="body2" color="text.secondary">
                        Week Start Date
                      </Typography>
                      <Typography variant="body1">
                        {formatDate(menu.week_start_date)}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="body2" color="text.secondary">
                        Total Items
                      </Typography>
                      <Typography variant="body1">
                        {menu.items.length} items
                      </Typography>
                    </Grid>
                    {menu.description && (
                      <Grid size={12}>
                        <Typography variant="body2" color="text.secondary">
                          Description
                        </Typography>
                        <Typography variant="body1">
                          {menu.description}
                        </Typography>
                      </Grid>
                    )}
                    <Grid size={12}>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {menu.canva_design_id && (
                          <Chip label="Has Canva Design" color="success" size="small" />
                        )}
                        {menu.export_url && (
                          <Chip label="Exported" color="primary" size="small" />
                        )}
                        {menu.is_published && (
                          <Chip label="Published" color="info" size="small" />
                        )}
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Export Section */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Export Menu
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <FormControl fullWidth>
                        <InputLabel>Format</InputLabel>
                        <Select
                          value={exportFormat}
                          onChange={(e) => setExportFormat(e.target.value)}
                          label="Format"
                        >
                          {EXPORT_FORMATS.map((format) => (
                            <MenuItem key={format.value} value={format.value}>
                              {format.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <FormControl fullWidth>
                        <InputLabel>Quality</InputLabel>
                        <Select
                          value={exportQuality}
                          onChange={(e) => setExportQuality(e.target.value)}
                          label="Quality"
                        >
                          {EXPORT_QUALITIES.map((quality) => (
                            <MenuItem key={quality.value} value={quality.value}>
                              {quality.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid size={12}>
                      <Button
                        fullWidth
                        variant="contained"
                        size="large"
                        startIcon={isExporting ? <CircularProgress size={20} /> : <DownloadIcon />}
                        onClick={exportMenu}
                        disabled={isExporting || !menu.canva_design_id}
                      >
                        {isExporting ? 'Exporting...' : 'Export Menu'}
                      </Button>
                      {!menu.canva_design_id && (
                        <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                          Please create a Canva design first in the Templates page
                        </Typography>
                      )}
                    </Grid>
                    {menu.export_url && (
                      <Grid size={12}>
                        <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Last Export URL
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            <Typography variant="body2" sx={{ flex: 1, wordBreak: 'break-all' }}>
                              {menu.export_url}
                            </Typography>
                            <IconButton size="small" onClick={() => copyToClipboard(menu.export_url!)}>
                              <CopyIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
              </Card>

              {/* Share Section */}
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Share Menu
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Create a shareable link to send to customers via WhatsApp, email, or social media
                  </Typography>
                  
                  <Button
                    fullWidth
                    variant="outlined"
                    size="large"
                    startIcon={isSharing ? <CircularProgress size={20} /> : <ShareIcon />}
                    onClick={createShareLink}
                    disabled={isSharing}
                  >
                    {isSharing ? 'Creating Link...' : 'Create Share Link'}
                  </Button>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent sx={{ py: 8, textAlign: 'center' }}>
                {isLoadingMenu ? (
                  <CircularProgress />
                ) : (
                  <Typography variant="body1" color="text.secondary">
                    Select a menu from the list to export and share
                  </Typography>
                )}
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onClose={() => setShareDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Share Link Created</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Your menu is now ready to share! Copy the link below or scan the QR code.
          </Typography>

          <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 1, mb: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Share URL
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Typography variant="body2" sx={{ flex: 1, wordBreak: 'break-all' }}>
                {shareUrl}
              </Typography>
              <IconButton size="small" onClick={() => copyToClipboard(shareUrl)}>
                <CopyIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>

          <Grid container spacing={2}>
            <Grid size={6}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<QrCodeIcon />}
                onClick={() => showSnackbar('QR code generation coming soon', 'success')}
              >
                Generate QR
              </Button>
            </Grid>
            <Grid size={6}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<PreviewIcon />}
                onClick={() => window.open(shareUrl, '_blank')}
              >
                Preview
              </Button>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShareDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </DashboardLayout>
  );
}
