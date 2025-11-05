'use client';
import React, { useState, useEffect } from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Chip,
  CardMedia,
  CardActions,
} from '@mui/material';
import {
  AutoAwesome as AIIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Delete as DeleteIcon,
  Visibility as PreviewIcon,
} from '@mui/icons-material';
import DashboardLayout from '../../components/DashboardLayout';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const TEMPLATE_STYLES = [
  { value: 'modern', label: 'Modern', description: 'Clean layout with neutral colors' },
  { value: 'traditional', label: 'Traditional', description: 'Decorative borders with warm colors' },
  { value: 'colorful', label: 'Colorful', description: 'Vibrant colors with playful fonts' },
  { value: 'minimalist', label: 'Minimalist', description: 'Simple layout with lots of white space' },
];

interface CanvaTemplate {
  id: number;
  canva_design_id: string;
  name: string;
  style: string;
  thumbnail_url: string | null;
  page_count: number;
  is_default: boolean;
  is_system_template: boolean;
  created_at: string;
}

interface CandidateTemplate {
  id: string;
  thumbnail_url: string;
}

export default function TemplateLibraryContent() {
  const [templates, setTemplates] = useState<CanvaTemplate[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isConverting, setIsConverting] = useState<string | null>(null);
  
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState('modern');
  const [customPrompt, setCustomPrompt] = useState('');
  
  const [candidates, setCandidates] = useState<CandidateTemplate[]>([]);
  const [candidatesDialogOpen, setCandidatesDialogOpen] = useState(false);
  
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setIsLoadingTemplates(true);
    try {
      const response = await fetch(`${API_URL}/api/canva/templates`);
      const result = await response.json();
      
      if (result.success) {
        setTemplates(result.data);
      } else {
        showSnackbar(result.error || 'Failed to load templates', 'error');
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
      showSnackbar('Failed to load templates', 'error');
    } finally {
      setIsLoadingTemplates(false);
    }
  };

  const generateTemplates = async () => {
    if (!selectedStyle && !customPrompt) {
      showSnackbar('Please select a style or enter a custom prompt', 'error');
      return;
    }

    setIsGenerating(true);
    setGenerateDialogOpen(false);

    try {
      const response = await fetch(`${API_URL}/api/canva/generate-template`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          style: customPrompt ? undefined : selectedStyle,
          customPrompt: customPrompt || undefined,
        }),
      });

      const result = await response.json();

      if (result.success && result.data.candidates) {
        setCandidates(result.data.candidates);
        setCandidatesDialogOpen(true);
        showSnackbar(`Generated ${result.data.candidates.length} templates`, 'success');
      } else {
        showSnackbar(result.error || 'Failed to generate templates', 'error');
      }
    } catch (error) {
      console.error('Error generating templates:', error);
      showSnackbar('Failed to generate templates', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const convertCandidate = async (candidateId: string) => {
    setIsConverting(candidateId);

    try {
      const styleName = customPrompt ? 'custom' : selectedStyle;
      const templateName = `Menu Template - ${TEMPLATE_STYLES.find(s => s.value === styleName)?.label || 'Custom'}`;

      const response = await fetch(`${API_URL}/api/canva/convert-candidate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateId,
          name: templateName,
          style: styleName,
        }),
      });

      const result = await response.json();

      if (result.success) {
        showSnackbar('Template saved successfully', 'success');
        setCandidatesDialogOpen(false);
        setCandidates([]);
        fetchTemplates();
      } else {
        showSnackbar(result.error || 'Failed to save template', 'error');
      }
    } catch (error) {
      console.error('Error converting candidate:', error);
      showSnackbar('Failed to save template', 'error');
    } finally {
      setIsConverting(null);
    }
  };

  const setDefaultTemplate = async (templateId: number) => {
    try {
      const response = await fetch(`${API_URL}/api/canva/templates/${templateId}/default`, {
        method: 'PUT',
      });

      const result = await response.json();

      if (result.success) {
        showSnackbar('Default template updated', 'success');
        fetchTemplates();
      } else {
        showSnackbar(result.error || 'Failed to set default template', 'error');
      }
    } catch (error) {
      console.error('Error setting default template:', error);
      showSnackbar('Failed to set default template', 'error');
    }
  };

  const deleteTemplate = async (templateId: number) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      const response = await fetch(`${API_URL}/api/canva/templates/${templateId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        showSnackbar('Template deleted successfully', 'success');
        fetchTemplates();
      } else {
        showSnackbar(result.error || 'Failed to delete template', 'error');
      }
    } catch (error) {
      console.error('Error deleting template:', error);
      showSnackbar('Failed to delete template', 'error');
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <DashboardLayout>
      {/* Fixed Navigation */}
      <Box sx={{ position: 'sticky', top: 0, zIndex: 10, bgcolor: 'background.default', py: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Template Library
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="outlined" href="/weekly-menu/builder">
              Menu Builder
            </Button>
            <Button
              variant="contained"
              startIcon={isGenerating ? <CircularProgress size={20} /> : <AIIcon />}
              onClick={() => setGenerateDialogOpen(true)}
              disabled={isGenerating}
            >
              {isGenerating ? 'Generating...' : 'Generate with AI'}
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Template Grid */}
      <Box sx={{ mt: 3 }}>
        {isLoadingTemplates ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : templates.length === 0 ? (
          <Card>
            <CardContent sx={{ py: 8, textAlign: 'center' }}>
              <AIIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                No Templates Yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Generate your first template using AI to get started
              </Typography>
              <Button
                variant="contained"
                startIcon={<AIIcon />}
                onClick={() => setGenerateDialogOpen(true)}
              >
                Generate Templates
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {templates.map((template) => (
              <Grid item xs={12} sm={6} md={4} key={template.id}>
                <Card>
                  {template.thumbnail_url && (
                    <CardMedia
                      component="img"
                      height="200"
                      image={template.thumbnail_url}
                      alt={template.name}
                      sx={{ objectFit: 'cover' }}
                    />
                  )}
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                      <Typography variant="h6" sx={{ fontSize: '1rem' }}>
                        {template.name}
                      </Typography>
                      {template.is_default && (
                        <Chip label="Default" size="small" color="primary" />
                      )}
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                      <Chip label={template.style} size="small" />
                      {template.is_system_template && (
                        <Chip label="System" size="small" variant="outlined" />
                      )}
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {template.page_count} page{template.page_count > 1 ? 's' : ''}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <IconButton
                      size="small"
                      onClick={() => setDefaultTemplate(template.id)}
                      disabled={template.is_default}
                      title="Set as default"
                    >
                      {template.is_default ? <StarIcon color="primary" /> : <StarBorderIcon />}
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => window.open(`https://www.canva.com/design/${template.canva_design_id}`, '_blank')}
                      title="Preview in Canva"
                    >
                      <PreviewIcon />
                    </IconButton>
                    {!template.is_system_template && (
                      <IconButton
                        size="small"
                        onClick={() => deleteTemplate(template.id)}
                        title="Delete template"
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Generate Dialog */}
      <Dialog open={generateDialogOpen} onClose={() => setGenerateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Generate Templates with AI</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Choose a style or enter a custom prompt to generate professional menu templates using Canva AI.
          </Typography>

          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Template Style</InputLabel>
            <Select
              value={selectedStyle}
              onChange={(e) => setSelectedStyle(e.target.value)}
              label="Template Style"
              disabled={!!customPrompt}
            >
              {TEMPLATE_STYLES.map((style) => (
                <MenuItem key={style.value} value={style.value}>
                  <Box>
                    <Typography variant="body1">{style.label}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {style.description}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Divider sx={{ my: 2 }}>
            <Typography variant="body2" color="text.secondary">
              OR
            </Typography>
          </Divider>

          <TextField
            fullWidth
            multiline
            rows={3}
            label="Custom Prompt"
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="Describe your ideal menu template..."
            disabled={!!selectedStyle && !customPrompt}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setGenerateDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={generateTemplates}
            startIcon={<AIIcon />}
          >
            Generate
          </Button>
        </DialogActions>
      </Dialog>

      {/* Candidates Dialog */}
      <Dialog
        open={candidatesDialogOpen}
        onClose={() => setCandidatesDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Choose a Template</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Select a template to save to your library
          </Typography>

          <Grid container spacing={2}>
            {candidates.map((candidate) => (
              <Grid item xs={12} sm={6} key={candidate.id}>
                <Card>
                  {candidate.thumbnail_url && (
                    <CardMedia
                      component="img"
                      height="200"
                      image={candidate.thumbnail_url}
                      alt="Template candidate"
                      sx={{ objectFit: 'cover' }}
                    />
                  )}
                  <CardActions>
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={() => convertCandidate(candidate.id)}
                      disabled={isConverting === candidate.id}
                      startIcon={isConverting === candidate.id ? <CircularProgress size={20} /> : null}
                    >
                      {isConverting === candidate.id ? 'Saving...' : 'Save This Template'}
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCandidatesDialogOpen(false)}>Cancel</Button>
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
