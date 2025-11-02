'use client';
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  TextField,
  Select,
  MenuItem,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import DashboardLayout from '../components/DashboardLayout';

interface Product {
  id: number;
  name: string;
  description: string;
  purchase_quantity: number;
  purchase_unit: string;
  vendor1_name: string;
  vendor1_price: number;
  vendor2_name: string;
  vendor2_price: number;
  vendor3_name: string;
  vendor3_price: number;
  default_vendor_index: number;
}

export default function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Product | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: number | null }>({
    open: false,
    id: null,
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/products');
      const result = await response.json();
      if (result.success) {
        setProducts(result.data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setEditData({ ...product });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditData(null);
  };

  const handleSave = async () => {
    if (!editData) return;

    try {
      const response = await fetch(`http://localhost:3001/api/products/${editData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editData),
      });

      const result = await response.json();

      if (result.success) {
        setSnackbar({
          open: true,
          message: 'Product updated successfully!',
          severity: 'success',
        });
        setEditingId(null);
        setEditData(null);
        fetchProducts();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: `Error: ${error instanceof Error ? error.message : 'Failed to update product'}`,
        severity: 'error',
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.id) return;

    try {
      const response = await fetch(`http://localhost:3001/api/products/${deleteDialog.id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        setSnackbar({
          open: true,
          message: 'Product deleted successfully!',
          severity: 'success',
        });
        setDeleteDialog({ open: false, id: null });
        fetchProducts();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: `Error: ${error instanceof Error ? error.message : 'Failed to delete product'}`,
        severity: 'error',
      });
    }
  };

  const handleEditChange = (field: keyof Product, value: any) => {
    if (editData) {
      setEditData({ ...editData, [field]: value });
    }
  };

  const getDefaultPrice = (product: Product) => {
    const prices = [product.vendor1_price, product.vendor2_price, product.vendor3_price];
    return prices[product.default_vendor_index] || 0;
  };

  const getDefaultVendor = (product: Product) => {
    const vendors = [product.vendor1_name, product.vendor2_name, product.vendor3_name];
    return vendors[product.default_vendor_index] || 'N/A';
  };

  return (
    <DashboardLayout>
      <Box>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
          Product Management
        </Typography>

        <Card>
          <CardContent>
            <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Quantity</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Vendor 1</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Price 1</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Vendor 2</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Price 2</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Vendor 3</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Price 3</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Default</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        {editingId === product.id ? (
                          <TextField
                            size="small"
                            value={editData?.name || ''}
                            onChange={(e) => handleEditChange('name', e.target.value)}
                          />
                        ) : (
                          product.name
                        )}
                      </TableCell>
                      <TableCell>
                        {editingId === product.id ? (
                          <TextField
                            size="small"
                            value={editData?.description || ''}
                            onChange={(e) => handleEditChange('description', e.target.value)}
                          />
                        ) : (
                          product.description
                        )}
                      </TableCell>
                      <TableCell>
                        {product.purchase_quantity} {product.purchase_unit}
                      </TableCell>
                      <TableCell>
                        {editingId === product.id ? (
                          <TextField
                            size="small"
                            value={editData?.vendor1_name || ''}
                            onChange={(e) => handleEditChange('vendor1_name', e.target.value)}
                          />
                        ) : (
                          product.vendor1_name
                        )}
                      </TableCell>
                      <TableCell>
                        {editingId === product.id ? (
                          <TextField
                            size="small"
                            type="number"
                            value={editData?.vendor1_price || ''}
                            onChange={(e) => handleEditChange('vendor1_price', parseFloat(e.target.value))}
                          />
                        ) : (
                          `$${product.vendor1_price?.toFixed(2) || '0.00'}`
                        )}
                      </TableCell>
                      <TableCell>
                        {editingId === product.id ? (
                          <TextField
                            size="small"
                            value={editData?.vendor2_name || ''}
                            onChange={(e) => handleEditChange('vendor2_name', e.target.value)}
                          />
                        ) : (
                          product.vendor2_name
                        )}
                      </TableCell>
                      <TableCell>
                        {editingId === product.id ? (
                          <TextField
                            size="small"
                            type="number"
                            value={editData?.vendor2_price || ''}
                            onChange={(e) => handleEditChange('vendor2_price', parseFloat(e.target.value))}
                          />
                        ) : (
                          `$${product.vendor2_price?.toFixed(2) || '0.00'}`
                        )}
                      </TableCell>
                      <TableCell>
                        {editingId === product.id ? (
                          <TextField
                            size="small"
                            value={editData?.vendor3_name || ''}
                            onChange={(e) => handleEditChange('vendor3_name', e.target.value)}
                          />
                        ) : (
                          product.vendor3_name
                        )}
                      </TableCell>
                      <TableCell>
                        {editingId === product.id ? (
                          <TextField
                            size="small"
                            type="number"
                            value={editData?.vendor3_price || ''}
                            onChange={(e) => handleEditChange('vendor3_price', parseFloat(e.target.value))}
                          />
                        ) : (
                          `$${product.vendor3_price?.toFixed(2) || '0.00'}`
                        )}
                      </TableCell>
                      <TableCell>
                        {editingId === product.id ? (
                          <Select
                            size="small"
                            value={editData?.default_vendor_index || 0}
                            onChange={(e) => handleEditChange('default_vendor_index', e.target.value)}
                          >
                            <MenuItem value={0}>Vendor 1</MenuItem>
                            <MenuItem value={1}>Vendor 2</MenuItem>
                            <MenuItem value={2}>Vendor 3</MenuItem>
                          </Select>
                        ) : (
                          <Box>
                            <Typography variant="body2">{getDefaultVendor(product)}</Typography>
                            <Typography variant="caption" color="primary">
                              ${getDefaultPrice(product).toFixed(2)}
                            </Typography>
                          </Box>
                        )}
                      </TableCell>
                      <TableCell>
                        {editingId === product.id ? (
                          <Box>
                            <IconButton color="primary" onClick={handleSave}>
                              <SaveIcon />
                            </IconButton>
                            <IconButton color="secondary" onClick={handleCancelEdit}>
                              <CancelIcon />
                            </IconButton>
                          </Box>
                        ) : (
                          <Box>
                            <IconButton color="primary" onClick={() => handleEdit(product)}>
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              color="error"
                              onClick={() => setDeleteDialog({ open: true, id: product.id })}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, id: null })}>
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            Are you sure you want to delete this product? This action cannot be undone.
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialog({ open: false, id: null })}>Cancel</Button>
            <Button onClick={handleDelete} color="error" variant="contained">
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for notifications */}
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
