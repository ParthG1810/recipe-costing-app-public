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
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  CircularProgress,
  Chip,
} from '@mui/material';
import {
  Upload as UploadIcon,
  Delete as DeleteIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  CloudUpload as CloudUploadIcon,
  Image as ImageIcon,
} from '@mui/icons-material';
import DashboardLayout from '../components/DashboardLayout';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Recipe {
  id: number;
  name: string;
  description: string;
}

interface RecipeImage {
  id: number;
  recipe_id: number;
  image_url: string;
  is_default: boolean;
  canva_asset_id: string | null;
  width: number | null;
  height: number | null;
  file_size: number;
  created_at: string;
}

export default function RecipeImageManagementContent() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [images, setImages] = useState<RecipeImage[]>([]);
  const [isLoadingRecipes, setIsLoadingRecipes] = useState(false);
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadingToCanva, setUploadingToCanva] = useState<number | null>(null);
  
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  useEffect(() => {
    fetchRecipes();
  }, []);

  useEffect(() => {
    if (selectedRecipe) {
      fetchImages(selectedRecipe.id);
    }
  }, [selectedRecipe]);

  const fetchRecipes = async () => {
    setIsLoadingRecipes(true);
    try {
      const response = await fetch(`${API_URL}/api/recipes`);
      const result = await response.json();
      
      if (result.success) {
        setRecipes(result.data);
        if (result.data.length > 0 && !selectedRecipe) {
          setSelectedRecipe(result.data[0]);
        }
      } else {
        showSnackbar(result.error || 'Failed to load recipes', 'error');
      }
    } catch (error) {
      console.error('Error fetching recipes:', error);
      showSnackbar('Failed to load recipes', 'error');
    } finally {
      setIsLoadingRecipes(false);
    }
  };

  const fetchImages = async (recipeId: number) => {
    setIsLoadingImages(true);
    try {
      const response = await fetch(`${API_URL}/api/recipe-images/${recipeId}`);
      const result = await response.json();
      
      if (result.success) {
        setImages(result.data);
      } else {
        showSnackbar(result.error || 'Failed to load images', 'error');
      }
    } catch (error) {
      console.error('Error fetching images:', error);
      showSnackbar('Failed to load images', 'error');
    } finally {
      setIsLoadingImages(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedRecipe) {
      showSnackbar('Please select a recipe first', 'error');
      return;
    }

    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    // Validate file type
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      showSnackbar('Invalid file type. Please upload JPG, PNG, or WEBP', 'error');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5242880) {
      showSnackbar('File size too large. Maximum 5MB', 'error');
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('recipeId', selectedRecipe.id.toString());
      formData.append('isDefault', images.length === 0 ? 'true' : 'false');

      const response = await fetch(`${API_URL}/api/recipe-images/upload`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        showSnackbar('Image uploaded successfully', 'success');
        fetchImages(selectedRecipe.id);
        
        // Auto-upload to Canva
        if (result.data.id) {
          uploadToCanva(result.data.id);
        }
      } else {
        showSnackbar(result.error || 'Failed to upload image', 'error');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      showSnackbar('Failed to upload image', 'error');
    } finally {
      setIsUploading(false);
      // Reset file input
      event.target.value = '';
    }
  };

  const uploadToCanva = async (imageId: number) => {
    setUploadingToCanva(imageId);
    try {
      const response = await fetch(`${API_URL}/api/recipe-images/upload-to-canva`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageId }),
      });

      const result = await response.json();

      if (result.success) {
        showSnackbar('Image uploaded to Canva successfully', 'success');
        if (selectedRecipe) {
          fetchImages(selectedRecipe.id);
        }
      } else {
        showSnackbar(result.error || 'Failed to upload to Canva', 'error');
      }
    } catch (error) {
      console.error('Error uploading to Canva:', error);
      showSnackbar('Failed to upload to Canva', 'error');
    } finally {
      setUploadingToCanva(null);
    }
  };

  const setDefaultImage = async (imageId: number) => {
    try {
      const response = await fetch(`${API_URL}/api/recipe-images/${imageId}/set-default`, {
        method: 'PUT',
      });

      const result = await response.json();

      if (result.success) {
        showSnackbar('Default image updated', 'success');
        if (selectedRecipe) {
          fetchImages(selectedRecipe.id);
        }
      } else {
        showSnackbar(result.error || 'Failed to set default image', 'error');
      }
    } catch (error) {
      console.error('Error setting default image:', error);
      showSnackbar('Failed to set default image', 'error');
    }
  };

  const deleteImage = async (imageId: number) => {
    if (!confirm('Are you sure you want to delete this image?')) return;

    try {
      const response = await fetch(`${API_URL}/api/recipe-images/${imageId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        showSnackbar('Image deleted successfully', 'success');
        if (selectedRecipe) {
          fetchImages(selectedRecipe.id);
        }
      } else {
        showSnackbar(result.error || 'Failed to delete image', 'error');
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      showSnackbar('Failed to delete image', 'error');
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  return (
    <DashboardLayout>
      {/* Fixed Navigation */}
      <Box sx={{ position: 'sticky', top: 0, zIndex: 10, bgcolor: 'background.default', py: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Recipe Image Management
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="outlined" href="/recipe-management">
              Back to Recipes
            </Button>
            <Button variant="contained" href="/weekly-menu/builder">
              Go to Menu Builder
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Main Content */}
      <Grid container spacing={3} sx={{ mt: 1 }}>
        {/* Left Panel - Recipe List */}
        <Grid size={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recipes
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              {isLoadingRecipes ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : recipes.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                  No recipes found. Create a recipe first.
                </Typography>
              ) : (
                <List>
                  {recipes.map((recipe) => (
                    <ListItem key={recipe.id} disablePadding>
                      <ListItemButton
                        selected={selectedRecipe?.id === recipe.id}
                        onClick={() => setSelectedRecipe(recipe)}
                      >
                        <ListItemText
                          primary={recipe.name}
                          secondary={recipe.description}
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Right Panel - Image Gallery */}
        <Grid size={12} md={8}>
          {selectedRecipe ? (
            <>
              {/* Upload Section */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Upload Images for: {selectedRecipe.name}
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <input
                      accept="image/jpeg,image/png,image/webp"
                      style={{ display: 'none' }}
                      id="image-upload"
                      type="file"
                      onChange={handleFileUpload}
                      disabled={isUploading}
                    />
                    <label htmlFor="image-upload">
                      <Button
                        variant="contained"
                        component="span"
                        startIcon={isUploading ? <CircularProgress size={20} /> : <UploadIcon />}
                        disabled={isUploading}
                      >
                        {isUploading ? 'Uploading...' : 'Upload Image'}
                      </Button>
                    </label>
                    <Typography variant="body2" color="text.secondary">
                      JPG, PNG, WEBP (Max 5MB)
                    </Typography>
                  </Box>
                </CardContent>
              </Card>

              {/* Image Gallery */}
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Image Gallery ({images.length})
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  {isLoadingImages ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                      <CircularProgress />
                    </Box>
                  ) : images.length === 0 ? (
                    <Box sx={{ py: 8, textAlign: 'center' }}>
                      <ImageIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                      <Typography variant="body1" color="text.secondary">
                        No images uploaded yet
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Upload your first image to get started
                      </Typography>
                    </Box>
                  ) : (
                    <ImageList cols={3} gap={16}>
                      {images.map((image) => (
                        <ImageListItem key={image.id}>
                          <img
                            src={`${API_URL}${image.image_url}`}
                            alt={`Recipe image ${image.id}`}
                            loading="lazy"
                            style={{ height: 200, objectFit: 'cover' }}
                          />
                          <ImageListItemBar
                            title={
                              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                {image.is_default && <Chip label="Default" size="small" color="primary" />}
                                {image.canva_asset_id && <Chip label="Canva" size="small" color="success" />}
                              </Box>
                            }
                            subtitle={formatFileSize(image.file_size)}
                            actionIcon={
                              <Box>
                                <IconButton
                                  sx={{ color: 'rgba(255, 255, 255, 0.9)' }}
                                  onClick={() => setDefaultImage(image.id)}
                                  disabled={image.is_default}
                                >
                                  {image.is_default ? <StarIcon /> : <StarBorderIcon />}
                                </IconButton>
                                {!image.canva_asset_id && (
                                  <IconButton
                                    sx={{ color: 'rgba(255, 255, 255, 0.9)' }}
                                    onClick={() => uploadToCanva(image.id)}
                                    disabled={uploadingToCanva === image.id}
                                  >
                                    {uploadingToCanva === image.id ? (
                                      <CircularProgress size={20} />
                                    ) : (
                                      <CloudUploadIcon />
                                    )}
                                  </IconButton>
                                )}
                                <IconButton
                                  sx={{ color: 'rgba(255, 255, 255, 0.9)' }}
                                  onClick={() => deleteImage(image.id)}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Box>
                            }
                          />
                        </ImageListItem>
                      ))}
                    </ImageList>
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent sx={{ py: 8, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                  Select a recipe from the list to manage its images
                </Typography>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

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
