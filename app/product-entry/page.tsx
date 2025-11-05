'use client';
import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  Paper,
  Divider,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  Chip,
  InputAdornment,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import DashboardLayout from '../components/DashboardLayout';

interface VendorData {
  name: string;
  price: string;
  weight: string;
  package_size: string;
}

export default function ProductEntry() {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    default_vendor_index: 0,
  });

  // Only Vendor 1 is required, others are optional
  const [vendors, setVendors] = useState<VendorData[]>([
    { name: '', price: '', weight: '', package_size: 'kg' },
  ]);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  const steps = ['Product Information', 'Vendor Details', 'Review'];

  const packageSizeOptions = [
    { value: 'g', label: 'Grams (g)' },
    { value: 'kg', label: 'Kilograms (kg)' },
    { value: 'lb', label: 'Pounds (lb)' },
    { value: 'oz', label: 'Ounces (oz)' },
    { value: 'ml', label: 'Milliliters (ml)' },
    { value: 'l', label: 'Liters (l)' },
    { value: 'pcs', label: 'Pieces (pcs)' },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name as string]: value,
    }));
  };

  const handleVendorChange = (index: number, field: keyof VendorData, value: string) => {
    const updatedVendors = [...vendors];
    updatedVendors[index] = {
      ...updatedVendors[index],
      [field]: value,
    };
    setVendors(updatedVendors);
  };

  const addVendor = () => {
    if (vendors.length < 3) {
      setVendors([...vendors, { name: '', price: '', weight: '', package_size: 'kg' }]);
    }
  };

  const removeVendor = (index: number) => {
    if (vendors.length > 1) {
      const updatedVendors = vendors.filter((_, i) => i !== index);
      setVendors(updatedVendors);
      // Adjust default vendor index if needed
      if (formData.default_vendor_index >= updatedVendors.length) {
        setFormData(prev => ({ ...prev, default_vendor_index: 0 }));
      }
    }
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSubmit = async () => {
    try {
      // Prepare data for API
      const productData: any = {
        name: formData.name,
        description: formData.description,
        default_vendor_index: formData.default_vendor_index,
      };

      // Add vendor data (fill empty slots with null)
      for (let i = 0; i < 3; i++) {
        if (i < vendors.length && vendors[i].name) {
          productData[`vendor${i + 1}_name`] = vendors[i].name;
          productData[`vendor${i + 1}_price`] = parseFloat(vendors[i].price) || 0;
          productData[`vendor${i + 1}_weight`] = parseFloat(vendors[i].weight) || 0;
          productData[`vendor${i + 1}_package_size`] = vendors[i].package_size;
        } else {
          productData[`vendor${i + 1}_name`] = null;
          productData[`vendor${i + 1}_price`] = null;
          productData[`vendor${i + 1}_weight`] = null;
          productData[`vendor${i + 1}_package_size`] = null;
        }
      }

      const response = await fetch('http://localhost:3001/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      const result = await response.json();

      if (result.success) {
        setSnackbar({
          open: true,
          message: 'Product added successfully!',
          severity: 'success',
        });
        
        // Reset form
        setFormData({
          name: '',
          description: '',
          default_vendor_index: 0,
        });
        setVendors([{ name: '', price: '', weight: '', package_size: 'kg' }]);
        setActiveStep(0);
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
        return formData.name.trim() !== '' && formData.description.trim() !== '';
      case 1:
        return vendors[0].name.trim() !== '' && 
               vendors[0].price.trim() !== '' && 
               vendors[0].weight.trim() !== '';
      case 2:
        return true;
      default:
        return false;
    }
  };

  return (
    <DashboardLayout>
      <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 'bold' }}>
          Add New Product
        </Typography>

        {/* Stepper */}
        <Paper sx={{ p: 3, mb: 4 }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Paper>

        {/* Step Content */}
        <Paper sx={{ p: 4 }}>
          {activeStep === 0 && (
            <Box>
              <Typography variant="h6" gutterBottom sx={{ mb: 3, color: 'primary.main' }}>
                Product Information
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Product Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    multiline
                    rows={4}
                    variant="outlined"
                  />
                </Grid>
              </Grid>
            </Box>
          )}

          {activeStep === 1 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ color: 'primary.main' }}>
                  Vendor Details
                </Typography>
                {vendors.length < 3 && (
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={addVendor}
                    size="small"
                  >
                    Add Vendor
                  </Button>
                )}
              </Box>

              {vendors.map((vendor, index) => (
                <Card key={index} sx={{ mb: 3, border: '1px solid', borderColor: 'divider' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="h6">
                          Vendor {index + 1}
                        </Typography>
                        {index === 0 && (
                          <Chip label="Required" color="primary" size="small" />
                        )}
                        {index === formData.default_vendor_index && (
                          <Chip label="Default" color="success" size="small" icon={<CheckCircleIcon />} />
                        )}
                      </Box>
                      {index > 0 && (
                        <IconButton
                          color="error"
                          onClick={() => removeVendor(index)}
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      )}
                    </Box>

                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Vendor Name"
                          value={vendor.name}
                          onChange={(e) => handleVendorChange(index, 'name', e.target.value)}
                          required={index === 0}
                          variant="outlined"
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Price"
                          type="number"
                          value={vendor.price}
                          onChange={(e) => handleVendorChange(index, 'price', e.target.value)}
                          required={index === 0}
                          variant="outlined"
                          InputProps={{
                            startAdornment: <InputAdornment position="start">$</InputAdornment>,
                          }}
                          inputProps={{ step: '0.01', min: '0' }}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Weight/Quantity"
                          type="number"
                          value={vendor.weight}
                          onChange={(e) => handleVendorChange(index, 'weight', e.target.value)}
                          required={index === 0}
                          variant="outlined"
                          inputProps={{ step: '0.01', min: '0' }}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <FormControl fullWidth variant="outlined">
                          <InputLabel>Package Size</InputLabel>
                          <Select
                            value={vendor.package_size}
                            onChange={(e) => handleVendorChange(index, 'package_size', e.target.value as string)}
                            label="Package Size"
                          >
                            {packageSizeOptions.map((option) => (
                              <MenuItem key={option.value} value={option.value}>
                                {option.label}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                    </Grid>

                    {vendor.name && (
                      <Box sx={{ mt: 2 }}>
                        <Button
                          variant={formData.default_vendor_index === index ? 'contained' : 'outlined'}
                          size="small"
                          onClick={() => setFormData(prev => ({ ...prev, default_vendor_index: index }))}
                        >
                          {formData.default_vendor_index === index ? 'Default Vendor' : 'Set as Default'}
                        </Button>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}

          {activeStep === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom sx={{ mb: 3, color: 'primary.main' }}>
                Review Your Product
              </Typography>

              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Product Information
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="body2" color="text.secondary">Product Name</Typography>
                      <Typography variant="body1" fontWeight="medium">{formData.name}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={8}>
                      <Typography variant="body2" color="text.secondary">Description</Typography>
                      <Typography variant="body1">{formData.description}</Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Vendor Details
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  {vendors.map((vendor, index) => (
                    vendor.name && (
                      <Box key={index} sx={{ mb: 3, pb: 3, borderBottom: index < vendors.length - 1 ? '1px solid' : 'none', borderColor: 'divider' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                          <Typography variant="subtitle2" fontWeight="bold">
                            Vendor {index + 1}
                          </Typography>
                          {index === formData.default_vendor_index && (
                            <Chip label="Default" color="success" size="small" />
                          )}
                        </Box>
                        <Grid container spacing={2}>
                          <Grid item xs={6} sm={3}>
                            <Typography variant="body2" color="text.secondary">Name</Typography>
                            <Typography variant="body1">{vendor.name}</Typography>
                          </Grid>
                          <Grid item xs={6} sm={3}>
                            <Typography variant="body2" color="text.secondary">Price</Typography>
                            <Typography variant="body1">${vendor.price}</Typography>
                          </Grid>
                          <Grid item xs={6} sm={3}>
                            <Typography variant="body2" color="text.secondary">Weight</Typography>
                            <Typography variant="body1">{vendor.weight}</Typography>
                          </Grid>
                          <Grid item xs={6} sm={3}>
                            <Typography variant="body2" color="text.secondary">Package Size</Typography>
                            <Typography variant="body1">
                              {packageSizeOptions.find(opt => opt.value === vendor.package_size)?.label}
                            </Typography>
                          </Grid>
                        </Grid>
                      </Box>
                    )
                  ))}
                </CardContent>
              </Card>
            </Box>
          )}

          {/* Navigation Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              variant="outlined"
            >
              Back
            </Button>
            <Box>
              {activeStep === steps.length - 1 ? (
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  size="large"
                >
                  Add Product
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={!isStepValid(activeStep)}
                  size="large"
                >
                  Next
                </Button>
              )}
            </Box>
          </Box>
        </Paper>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
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
