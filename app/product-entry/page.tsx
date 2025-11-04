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
} from '@mui/material';
import DashboardLayout from '../components/DashboardLayout';

export default function ProductEntry() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    vendor1_name: '',
    vendor1_price: '',
    vendor1_package_size: 'g',
    vendor2_name: '',
    vendor2_price: '',
    vendor2_package_size: 'g',
    vendor3_name: '',
    vendor3_price: '',
    vendor3_package_size: 'g',
    default_vendor_index: 0,
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('http://localhost:3001/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
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
          vendor1_name: '',
          vendor1_price: '',
          vendor1_package_size: 'g',
          vendor2_name: '',
          vendor2_price: '',
          vendor2_package_size: 'g',
          vendor3_name: '',
          vendor3_price: '',
          vendor3_package_size: 'g',
          default_vendor_index: 0,
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: `Error: ${error instanceof Error ? error.message : 'Failed to add product'}`,
        severity: 'error',
      });
    }
  };

  return (
    <DashboardLayout>
      <Box>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
          Product Entry
        </Typography>

        <Card>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                {/* Product Information */}
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom sx={{ color: '#1976d2', fontWeight: 'bold' }}>
                    Product Information
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    required
                    label="Product Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g., Toor Dal, Rice, Ghee"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Optional product description"
                    multiline
                    rows={1}
                  />
                </Grid>

                {/* Vendor 1 */}
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom sx={{ color: '#1976d2', mt: 2, fontWeight: 'bold' }}>
                    Vendor 1
                  </Typography>
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Vendor Name"
                    name="vendor1_name"
                    value={formData.vendor1_name}
                    onChange={handleChange}
                    placeholder="e.g., ABC Suppliers"
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Price"
                    name="vendor1_price"
                    type="number"
                    inputProps={{ step: '0.01', min: '0' }}
                    value={formData.vendor1_price}
                    onChange={handleChange}
                    placeholder="0.00"
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Package Size</InputLabel>
                    <Select
                      name="vendor1_package_size"
                      value={formData.vendor1_package_size}
                      label="Package Size"
                      onChange={handleChange}
                    >
                      {packageSizeOptions.map(option => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* Vendor 2 */}
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom sx={{ color: '#1976d2', mt: 2, fontWeight: 'bold' }}>
                    Vendor 2
                  </Typography>
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Vendor Name"
                    name="vendor2_name"
                    value={formData.vendor2_name}
                    onChange={handleChange}
                    placeholder="e.g., XYZ Traders"
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Price"
                    name="vendor2_price"
                    type="number"
                    inputProps={{ step: '0.01', min: '0' }}
                    value={formData.vendor2_price}
                    onChange={handleChange}
                    placeholder="0.00"
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Package Size</InputLabel>
                    <Select
                      name="vendor2_package_size"
                      value={formData.vendor2_package_size}
                      label="Package Size"
                      onChange={handleChange}
                    >
                      {packageSizeOptions.map(option => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* Vendor 3 */}
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom sx={{ color: '#1976d2', mt: 2, fontWeight: 'bold' }}>
                    Vendor 3
                  </Typography>
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Vendor Name"
                    name="vendor3_name"
                    value={formData.vendor3_name}
                    onChange={handleChange}
                    placeholder="e.g., PQR Wholesale"
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Price"
                    name="vendor3_price"
                    type="number"
                    inputProps={{ step: '0.01', min: '0' }}
                    value={formData.vendor3_price}
                    onChange={handleChange}
                    placeholder="0.00"
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Package Size</InputLabel>
                    <Select
                      name="vendor3_package_size"
                      value={formData.vendor3_package_size}
                      label="Package Size"
                      onChange={handleChange}
                    >
                      {packageSizeOptions.map(option => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* Default Vendor Selection */}
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom sx={{ color: '#1976d2', mt: 2, fontWeight: 'bold' }}>
                    Default Price Selection
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <FormControl fullWidth required>
                    <InputLabel>Select Default Vendor</InputLabel>
                    <Select
                      name="default_vendor_index"
                      value={formData.default_vendor_index}
                      label="Select Default Vendor"
                      onChange={handleChange}
                    >
                      <MenuItem value={0}>
                        Vendor 1 {formData.vendor1_name && `(${formData.vendor1_name})`}
                      </MenuItem>
                      <MenuItem value={1}>
                        Vendor 2 {formData.vendor2_name && `(${formData.vendor2_name})`}
                      </MenuItem>
                      <MenuItem value={2}>
                        Vendor 3 {formData.vendor3_name && `(${formData.vendor3_name})`}
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                {/* Submit Button */}
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    fullWidth
                    sx={{ mt: 2, py: 1.5 }}
                  >
                    Add Product
                  </Button>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
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
