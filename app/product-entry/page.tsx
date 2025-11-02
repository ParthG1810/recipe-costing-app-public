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
    purchase_quantity: '',
    purchase_unit: 'grams',
    vendor1_name: '',
    vendor1_price: '',
    vendor2_name: '',
    vendor2_price: '',
    vendor3_name: '',
    vendor3_price: '',
    default_vendor_index: 0,
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

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
          purchase_quantity: '',
          purchase_unit: 'grams',
          vendor1_name: '',
          vendor1_price: '',
          vendor2_name: '',
          vendor2_price: '',
          vendor3_name: '',
          vendor3_price: '',
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
                  <Typography variant="h6" gutterBottom sx={{ color: '#1976d2' }}>
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
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    multiline
                    rows={1}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    required
                    label="Purchase Quantity"
                    name="purchase_quantity"
                    type="number"
                    value={formData.purchase_quantity}
                    onChange={handleChange}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Purchase Unit</InputLabel>
                    <Select
                      name="purchase_unit"
                      value={formData.purchase_unit}
                      label="Purchase Unit"
                      onChange={handleChange}
                    >
                      <MenuItem value="grams">Grams</MenuItem>
                      <MenuItem value="kg">Kilograms</MenuItem>
                      <MenuItem value="liters">Liters</MenuItem>
                      <MenuItem value="ml">Milliliters</MenuItem>
                      <MenuItem value="pieces">Pieces</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                {/* Vendor 1 */}
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom sx={{ color: '#1976d2', mt: 2 }}>
                    Vendor 1
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Vendor 1 Name"
                    name="vendor1_name"
                    value={formData.vendor1_name}
                    onChange={handleChange}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Vendor 1 Price"
                    name="vendor1_price"
                    type="number"
                    inputProps={{ step: '0.01' }}
                    value={formData.vendor1_price}
                    onChange={handleChange}
                  />
                </Grid>

                {/* Vendor 2 */}
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom sx={{ color: '#1976d2', mt: 2 }}>
                    Vendor 2
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Vendor 2 Name"
                    name="vendor2_name"
                    value={formData.vendor2_name}
                    onChange={handleChange}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Vendor 2 Price"
                    name="vendor2_price"
                    type="number"
                    inputProps={{ step: '0.01' }}
                    value={formData.vendor2_price}
                    onChange={handleChange}
                  />
                </Grid>

                {/* Vendor 3 */}
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom sx={{ color: '#1976d2', mt: 2 }}>
                    Vendor 3
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Vendor 3 Name"
                    name="vendor3_name"
                    value={formData.vendor3_name}
                    onChange={handleChange}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Vendor 3 Price"
                    name="vendor3_price"
                    type="number"
                    inputProps={{ step: '0.01' }}
                    value={formData.vendor3_price}
                    onChange={handleChange}
                  />
                </Grid>

                {/* Default Vendor Selection */}
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom sx={{ color: '#1976d2', mt: 2 }}>
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
                      <MenuItem value={0}>Vendor 1</MenuItem>
                      <MenuItem value={1}>Vendor 2</MenuItem>
                      <MenuItem value={2}>Vendor 3</MenuItem>
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
                    sx={{ mt: 2 }}
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
