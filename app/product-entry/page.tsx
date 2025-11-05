'use client';
import React, { useState } from 'react';
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
} from '@mui/icons-material';
import DashboardLayout from '../components/DashboardLayout';

interface VendorData {
  vendor_name: string;
  price: string;
  weight: string;
  package_size: string;
  is_default: boolean;
}

export default function ProductEntry() {
  const [activeStep, setActiveStep] = useState(0);
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

      const response = await fetch('http://localhost:3001/api/products', {
        method: 'POST',
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
          message: 'Product added successfully!',
          severity: 'success',
        });
        // Reset form
        setFormData({
          name: '',
          description: '',
        });
        setVendors([{ vendor_name: '', price: '', weight: '', package_size: 'g', is_default: true }]);
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
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Typography variant="h6" gutterBottom>
              Product Information
            </Typography>
            <TextField
              label="Product Name"
              required
              fullWidth
              value={formData.name}
              onChange={(e) => handleFormChange('name', e.target.value)}
              placeholder="e.g., All-Purpose Flour"
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => handleFormChange('description', e.target.value)}
              placeholder="e.g., High-quality all-purpose flour for baking"
            />
          </Box>
        );

      case 1:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
                    <Typography variant="subtitle1" fontWeight={600}>
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

                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        label="Vendor Name"
                        required
                        fullWidth
                        value={vendor.vendor_name}
                        onChange={(e) => handleVendorChange(index, 'vendor_name', e.target.value)}
                        placeholder="e.g., ABC Suppliers"
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        label="Price"
                        required
                        fullWidth
                        type="number"
                        value={vendor.price}
                        onChange={(e) => handleVendorChange(index, 'price', e.target.value)}
                        placeholder="0.00"
                        inputProps={{ step: '0.01', min: '0' }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        label="Weight"
                        required
                        fullWidth
                        type="number"
                        value={vendor.weight}
                        onChange={(e) => handleVendorChange(index, 'weight', e.target.value)}
                        placeholder="0"
                        inputProps={{ step: '0.01', min: '0' }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <FormControl fullWidth>
                        <InputLabel>Package Size</InputLabel>
                        <Select
                          value={vendor.package_size}
                          onChange={(e) => handleVendorChange(index, 'package_size', e.target.value)}
                          label="Package Size"
                        >
                          <MenuItem value="g">Grams (g)</MenuItem>
                          <MenuItem value="kg">Kilograms (kg)</MenuItem>
                          <MenuItem value="lb">Pounds (lb)</MenuItem>
                          <MenuItem value="oz">Ounces (oz)</MenuItem>
                          <MenuItem value="ml">Milliliters (ml)</MenuItem>
                          <MenuItem value="l">Liters (l)</MenuItem>
                          <MenuItem value="pcs">Pieces (pcs)</MenuItem>
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
          </Box>
        );

      case 2:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Typography variant="h6" gutterBottom>
              Review Product Details
            </Typography>

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
                            <Typography variant="body1" fontWeight={600}>
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
        );

      default:
        return 'Unknown step';
    }
  };

  return (
    <DashboardLayout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
          Add New Product
        </Typography>

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Paper sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
          {getStepContent(activeStep)}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
            >
              Back
            </Button>
            <Box sx={{ display: 'flex', gap: 2 }}>
              {activeStep === steps.length - 1 ? (
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  startIcon={<CheckCircleIcon />}
                >
                  Create Product
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={!isStepValid(activeStep)}
                >
                  Next
                </Button>
              )}
            </Box>
          </Box>
        </Paper>

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
