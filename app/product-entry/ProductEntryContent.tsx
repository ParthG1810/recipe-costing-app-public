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
  Stepper,
  Step,
  StepLabel,
  Paper,
  IconButton,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  Divider,
  Grid,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import DashboardLayout from '../components/DashboardLayout';

interface VendorData {
  vendor_name: string;
  price: string;
  weight: string;
  package_size: string;
  is_default: boolean;
}

export default function ProductEntryContent() {
  const searchParams = useSearchParams();
  const productId = searchParams.get('id');
  const isEditMode = !!productId;
  
  const [activeStep, setActiveStep] = useState(0);
  const [isLoadingProduct, setIsLoadingProduct] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  const [vendors, setVendors] = useState<VendorData[]>([
    { vendor_name: '', price: '', weight: '', package_size: 'g', is_default: true },
  ]);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  const steps = ['Product Information', 'Vendor Details', 'Review'];

  useEffect(() => {
    if (isEditMode && productId) {
      fetchProductData(productId);
    }
  }, [isEditMode, productId]);

  const fetchProductData = async (id: string) => {
    setIsLoadingProduct(true);
    try {
      const response = await fetch(`http://localhost:3001/api/products/${id}`);
      const result = await response.json();
      
      if (result.success && result.data) {
        const product = result.data;
        setFormData({
          name: product.name || '',
          description: product.description || '',
        });
        
        // Convert vendors to the format used in the form
        if (product.vendors && product.vendors.length > 0) {
          const formattedVendors = product.vendors.map((v: any) => ({
            vendor_name: v.vendor_name,
            price: v.price.toString(),
            weight: v.weight.toString(),
            package_size: v.package_size,
            is_default: v.is_default,
          }));
          setVendors(formattedVendors);
        }
      }
    } catch (error) {
      console.error('Error fetching product data:', error);
      setSnackbar({
        open: true,
        message: 'Error loading product data',
        severity: 'error',
      });
    } finally {
      setIsLoadingProduct(false);
    }
  };

  const handleFormChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleVendorChange = (index: number, field: keyof VendorData, value: any) => {
    const updatedVendors = [...vendors];
    updatedVendors[index] = {
      ...updatedVendors[index],
      [field]: value,
    };
    setVendors(updatedVendors);
  };

  const addVendor = () => {
    setVendors([...vendors, { vendor_name: '', price: '', weight: '', package_size: 'g', is_default: false }]);
  };

  const removeVendor = (index: number) => {
    if (vendors.length > 1) {
      const updatedVendors = vendors.filter((_, i) => i !== index);
      // If removed vendor was default, set first vendor as default
      if (vendors[index].is_default && updatedVendors.length > 0) {
        updatedVendors[0].is_default = true;
      }
      setVendors(updatedVendors);
    }
  };

  const setDefaultVendor = (index: number) => {
    const updatedVendors = vendors.map((v, i) => ({
      ...v,
      is_default: i === index,
    }));
    setVendors(updatedVendors);
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSubmit = async () => {
    try {
      // Validate at least one vendor has all required fields
      const validVendors = vendors.filter(
        (v) => v.vendor_name && v.price && v.weight
      );

      if (validVendors.length === 0) {
        setSnackbar({
          open: true,
          message: 'Please add at least one complete vendor',
          severity: 'error',
        });
        return;
      }

      // Prepare vendors data
      const vendorsData = validVendors.map((v) => ({
        vendor_name: v.vendor_name,
        price: parseFloat(v.price),
        weight: parseFloat(v.weight),
        package_size: v.package_size,
        is_default: v.is_default,
      }));

      const url = isEditMode 
        ? `http://localhost:3001/api/products/${productId}`
        : 'http://localhost:3001/api/products';
      const method = isEditMode ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          vendors: vendorsData,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSnackbar({
          open: true,
          message: isEditMode ? 'Product updated successfully!' : 'Product added successfully!',
          severity: 'success',
        });
        
        if (isEditMode) {
          // In edit mode, go back to first step after a delay
          setTimeout(() => {
            setActiveStep(0);
          }, 1500);
        } else {
          // In create mode, reset form
          setFormData({
            name: '',
            description: '',
          });
          setVendors([{ vendor_name: '', price: '', weight: '', package_size: 'g', is_default: true }]);
          setActiveStep(0);
        }
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error adding product',
        severity: 'error',
      });
    }
  };

  const isStepValid = (step: number) => {
    switch (step) {
      case 0:
        return formData.name.trim() !== '';
      case 1:
        return vendors.some((v) => v.vendor_name && v.price && v.weight);
      default:
        return true;
    }
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Product Information
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, mt: 3 }}>
                <TextField
                  label="Product Name"
                  required
                  fullWidth
                  value={formData.name}
                  onChange={(e) => handleFormChange('name', e.target.value)}
                  placeholder="e.g., All-Purpose Flour"
                  InputProps={{
                    sx: { fontSize: '1.1rem', padding: '4px 0' }
                  }}
                  InputLabelProps={{
                    sx: { fontSize: '1.05rem' }
                  }}
                />
                <TextField
                  label="Description"
                  fullWidth
                  multiline
                  rows={5}
                  value={formData.description}
                  onChange={(e) => handleFormChange('description', e.target.value)}
                  placeholder="e.g., High-quality all-purpose flour for baking"
                  InputProps={{
                    sx: { fontSize: '1.05rem' }
                  }}
                  InputLabelProps={{
                    sx: { fontSize: '1.05rem' }
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        );

      case 1:
        return (
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Vendor Details
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={addVendor}
                  size="small"
                >
                  Add Vendor
                </Button>
              </Box>

              {vendors.map((vendor, index) => (
              <Card key={index} variant="outlined" sx={{ position: 'relative' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="subtitle1" fontWeight={600} component="div">
                      Vendor {index + 1}
                      {vendor.is_default && (
                        <Chip
                          label="Default"
                          size="small"
                          color="success"
                          sx={{ ml: 1 }}
                        />
                      )}
                    </Typography>
                    <Box>
                      {!vendor.is_default && (
                        <Button
                          size="small"
                          onClick={() => setDefaultVendor(index)}
                          sx={{ mr: 1 }}
                        >
                          Set as Default
                        </Button>
                      )}
                      {vendors.length > 1 && (
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => removeVendor(index)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      )}
                    </Box>
                  </Box>

                  <Grid container spacing={3}>
                    <Grid size={12}>
                      <TextField
                        label="Vendor Name"
                        required
                        fullWidth
                        value={vendor.vendor_name}
                        onChange={(e) => handleVendorChange(index, 'vendor_name', e.target.value)}
                        placeholder="e.g., ABC Suppliers"
                        InputProps={{
                          sx: { fontSize: '1.05rem' }
                        }}
                        InputLabelProps={{
                          sx: { fontSize: '1.05rem' }
                        }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <TextField
                        label="Price"
                        required
                        fullWidth
                        type="number"
                        value={vendor.price}
                        onChange={(e) => handleVendorChange(index, 'price', e.target.value)}
                        placeholder="0.00"
                        inputProps={{ step: '0.01', min: '0' }}
                        InputProps={{
                          sx: { fontSize: '1.05rem' }
                        }}
                        InputLabelProps={{
                          sx: { fontSize: '1.05rem' }
                        }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <TextField
                        label="Weight"
                        required
                        fullWidth
                        type="number"
                        value={vendor.weight}
                        onChange={(e) => handleVendorChange(index, 'weight', e.target.value)}
                        placeholder="0"
                        inputProps={{ step: '0.01', min: '0' }}
                        InputProps={{
                          sx: { fontSize: '1.05rem' }
                        }}
                        InputLabelProps={{
                          sx: { fontSize: '1.05rem' }
                        }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <FormControl fullWidth>
                        <InputLabel sx={{ fontSize: '1.05rem' }}>Package Size</InputLabel>
                        <Select
                          value={vendor.package_size}
                          onChange={(e) => handleVendorChange(index, 'package_size', e.target.value)}
                          sx={{ fontSize: '1.05rem' }}
                          label="Package Size"
                        >
                          <MenuItem value="g" sx={{ fontSize: '1.05rem' }}>Grams (g)</MenuItem>
                          <MenuItem value="kg" sx={{ fontSize: '1.05rem' }}>Kilograms (kg)</MenuItem>
                          <MenuItem value="lb" sx={{ fontSize: '1.05rem' }}>Pounds (lb)</MenuItem>
                          <MenuItem value="oz" sx={{ fontSize: '1.05rem' }}>Ounces (oz)</MenuItem>
                          <MenuItem value="ml" sx={{ fontSize: '1.05rem' }}>Milliliters (ml)</MenuItem>
                          <MenuItem value="l" sx={{ fontSize: '1.05rem' }}>Liters (l)</MenuItem>
                          <MenuItem value="pcs" sx={{ fontSize: '1.05rem' }}>Pieces (pcs)</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>

                  {vendor.price && vendor.weight && (
                    <Box sx={{ mt: 2, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        Price per unit: $
                        {(parseFloat(vendor.price) / parseFloat(vendor.weight)).toFixed(4)} per {vendor.package_size}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
              ))}
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Review Product Details
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
                <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  PRODUCT INFORMATION
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {formData.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {formData.description || 'No description'}
                </Typography>
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  VENDORS ({vendors.filter((v) => v.vendor_name && v.price && v.weight).length})
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                  {vendors
                    .filter((v) => v.vendor_name && v.price && v.weight)
                    .map((vendor, index) => (
                      <Box key={index}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box>
                            <Typography variant="body1" fontWeight={600} component="div">
                              {vendor.vendor_name}
                              {vendor.is_default && (
                                <Chip
                                  label="Default"
                                  size="small"
                                  color="success"
                                  sx={{ ml: 1 }}
                                />
                              )}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              ${vendor.price} for {vendor.weight} {vendor.package_size}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Price per unit: $
                              {(parseFloat(vendor.price) / parseFloat(vendor.weight)).toFixed(4)}/{vendor.package_size}
                            </Typography>
                          </Box>
                        </Box>
                        {index < vendors.filter((v) => v.vendor_name && v.price && v.weight).length - 1 && (
                          <Divider sx={{ mt: 2 }} />
                        )}
                      </Box>
                    ))}
                </Box>
              </CardContent>
            </Card>
              </Box>
            </CardContent>
          </Card>
        );

      default:
        return 'Unknown step';
    }
  };

  return (
    <DashboardLayout>
      <Box sx={{ p: 3 }}>
        {/* Navigation Buttons - Above header */}
        <Box sx={{ 
          position: 'fixed', 
          top: '12%',
          left: '18%',
          right: '2%',
          zIndex: 1000, 
          display: 'flex', 
          justifyContent: 'space-between'
        }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            startIcon={<ArrowBackIcon />}
          >
            Back
          </Button>
          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleSubmit}
              startIcon={<SaveIcon />}
            >
              {isEditMode ? 'Update Product' : 'Create Product'}
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={!isStepValid(activeStep)}
              endIcon={<ArrowForwardIcon />}
            >
              Next
            </Button>
          )}
        </Box>

        {/* Spacer to prevent content overlap */}
        <Box sx={{ height: '60px' }} />

        <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
          {isEditMode ? 'Edit Product' : 'Add New Product'}
        </Typography>
        {isLoadingProduct && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Loading product data...
          </Typography>
        )}

        {/* Stepper */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Stepper activeStep={activeStep}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </CardContent>
        </Card>

        {/* Step Content */}
        {getStepContent(activeStep)}

        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </DashboardLayout>
  );
}
