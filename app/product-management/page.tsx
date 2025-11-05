'use client';
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Chip,
  Toolbar,
  InputAdornment,
  TablePagination,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import DashboardLayout from '../components/DashboardLayout';

interface Product {
  id: number;
  name: string;
  description: string;
  vendor1_name: string | null;
  vendor1_price: number | null;
  vendor1_weight: number | null;
  vendor1_package_size: string | null;
  vendor2_name: string | null;
  vendor2_price: number | null;
  vendor2_weight: number | null;
  vendor2_package_size: string | null;
  vendor3_name: string | null;
  vendor3_price: number | null;
  vendor3_weight: number | null;
  vendor3_package_size: string | null;
  default_vendor_index: number;
}

export default function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [editDialog, setEditDialog] = useState({ open: false, product: null as Product | null });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, productId: null as number | null });
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

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    // Filter products based on search query
    if (searchQuery.trim() === '') {
      setFilteredProducts(products);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        product.vendor1_name?.toLowerCase().includes(query) ||
        product.vendor2_name?.toLowerCase().includes(query) ||
        product.vendor3_name?.toLowerCase().includes(query)
      );
      setFilteredProducts(filtered);
    }
    setPage(0); // Reset to first page when searching
  }, [searchQuery, products]);

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/products');
      const data = await response.json();
      if (data.success) {
        setProducts(data.data);
        setFilteredProducts(data.data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleEdit = (product: Product) => {
    setEditDialog({ open: true, product: { ...product } });
  };

  const handleCloseEdit = () => {
    setEditDialog({ open: false, product: null });
  };

  const handleSaveEdit = async () => {
    if (!editDialog.product) return;

    try {
      const response = await fetch(`http://localhost:3001/api/products/${editDialog.product.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editDialog.product),
      });

      const result = await response.json();

      if (result.success) {
        setSnackbar({
          open: true,
          message: 'Product updated successfully!',
          severity: 'success',
        });
        fetchProducts();
        handleCloseEdit();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error updating product',
        severity: 'error',
      });
    }
  };

  const handleDelete = (productId: number) => {
    setDeleteDialog({ open: true, productId });
  };

  const confirmDelete = async () => {
    if (!deleteDialog.productId) return;

    try {
      const response = await fetch(`http://localhost:3001/api/products/${deleteDialog.productId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        setSnackbar({
          open: true,
          message: 'Product deleted successfully!',
          severity: 'success',
        });
        fetchProducts();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error deleting product',
        severity: 'error',
      });
    }

    setDeleteDialog({ open: false, productId: null });
  };

  const handleEditChange = (field: keyof Product, value: any) => {
    if (editDialog.product) {
      setEditDialog({
        ...editDialog,
        product: {
          ...editDialog.product,
          [field]: value,
        },
      });
    }
  };

  const getDefaultPrice = (product: Product): number => {
    const prices = [product.vendor1_price, product.vendor2_price, product.vendor3_price];
    const price = prices[product.default_vendor_index];
    return typeof price === 'number' ? price : 0;
  };

  const getDefaultVendor = (product: Product) => {
    const vendors = [product.vendor1_name, product.vendor2_name, product.vendor3_name];
    return vendors[product.default_vendor_index] || 'N/A';
  };

  const getActiveVendorsCount = (product: Product) => {
    let count = 0;
    if (product.vendor1_name) count++;
    if (product.vendor2_name) count++;
    if (product.vendor3_name) count++;
    return count;
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <DashboardLayout>
      <Box sx={{ p: 3 }}>
        <Card>
          {/* Toolbar */}
          <Toolbar sx={{ px: 3, py: 2, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
            <Typography variant="h5" fontWeight="bold">
              Products
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <TextField
                size="small"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ minWidth: 250 }}
              />
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                href="/product-entry"
              >
                Create
              </Button>
            </Box>
          </Toolbar>

          {/* Table */}
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.50' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Product Name</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Default Price</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Vendors</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }} align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                      <Typography variant="body1" color="text.secondary">
                        {searchQuery ? 'No products found matching your search' : 'No products available'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((product) => (
                      <TableRow key={product.id} hover>
                        <TableCell>{product.id}</TableCell>
                        <TableCell>
                          <Typography fontWeight="medium">{product.name}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {product.description.length > 50
                              ? `${product.description.substring(0, 50)}...`
                              : product.description}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="bold">
                            ${getDefaultPrice(product).toFixed(2)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {getDefaultVendor(product)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={`${getActiveVendorsCount(product)} vendor${getActiveVendorsCount(product) !== 1 ? 's' : ''}`}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="Edit">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleEdit(product)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDelete(product.id)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={filteredProducts.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Card>

        {/* Edit Dialog */}
        <Dialog open={editDialog.open} onClose={handleCloseEdit} maxWidth="md" fullWidth>
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Edit Product</Typography>
            <IconButton onClick={handleCloseEdit} size="small">
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers>
            {editDialog.product && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Product Information */}
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom color="primary">
                    Product Information
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                      fullWidth
                      label="Product Name"
                      value={editDialog.product.name}
                      onChange={(e) => handleEditChange('name', e.target.value)}
                    />
                    <TextField
                      fullWidth
                      label="Description"
                      value={editDialog.product.description}
                      onChange={(e) => handleEditChange('description', e.target.value)}
                      multiline
                      rows={3}
                    />
                  </Box>
                </Box>

                {/* Vendor 1 */}
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom color="primary">
                    Vendor 1 {editDialog.product.default_vendor_index === 0 && <Chip label="Default" size="small" color="success" sx={{ ml: 1 }} />}
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                      fullWidth
                      label="Vendor Name"
                      value={editDialog.product.vendor1_name || ''}
                      onChange={(e) => handleEditChange('vendor1_name', e.target.value)}
                    />
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <TextField
                        label="Price"
                        type="number"
                        value={editDialog.product.vendor1_price || ''}
                        onChange={(e) => handleEditChange('vendor1_price', parseFloat(e.target.value))}
                        InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                        inputProps={{ step: '0.01', min: '0' }}
                        sx={{ flex: 1 }}
                      />
                      <TextField
                        label="Weight"
                        type="number"
                        value={editDialog.product.vendor1_weight || ''}
                        onChange={(e) => handleEditChange('vendor1_weight', parseFloat(e.target.value))}
                        inputProps={{ step: '0.01', min: '0' }}
                        sx={{ flex: 1 }}
                      />
                      <FormControl sx={{ flex: 1 }}>
                        <InputLabel>Package Size</InputLabel>
                        <Select
                          value={editDialog.product.vendor1_package_size || 'kg'}
                          onChange={(e) => handleEditChange('vendor1_package_size', e.target.value)}
                          label="Package Size"
                        >
                          {packageSizeOptions.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Box>
                    <Button
                      variant={editDialog.product.default_vendor_index === 0 ? 'contained' : 'outlined'}
                      size="small"
                      onClick={() => handleEditChange('default_vendor_index', 0)}
                      sx={{ alignSelf: 'flex-start' }}
                    >
                      {editDialog.product.default_vendor_index === 0 ? 'Default Vendor' : 'Set as Default'}
                    </Button>
                  </Box>
                </Box>

                {/* Vendor 2 */}
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom color="primary">
                    Vendor 2 (Optional) {editDialog.product.default_vendor_index === 1 && <Chip label="Default" size="small" color="success" sx={{ ml: 1 }} />}
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                      fullWidth
                      label="Vendor Name"
                      value={editDialog.product.vendor2_name || ''}
                      onChange={(e) => handleEditChange('vendor2_name', e.target.value)}
                    />
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <TextField
                        label="Price"
                        type="number"
                        value={editDialog.product.vendor2_price || ''}
                        onChange={(e) => handleEditChange('vendor2_price', parseFloat(e.target.value))}
                        InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                        inputProps={{ step: '0.01', min: '0' }}
                        sx={{ flex: 1 }}
                      />
                      <TextField
                        label="Weight"
                        type="number"
                        value={editDialog.product.vendor2_weight || ''}
                        onChange={(e) => handleEditChange('vendor2_weight', parseFloat(e.target.value))}
                        inputProps={{ step: '0.01', min: '0' }}
                        sx={{ flex: 1 }}
                      />
                      <FormControl sx={{ flex: 1 }}>
                        <InputLabel>Package Size</InputLabel>
                        <Select
                          value={editDialog.product.vendor2_package_size || 'kg'}
                          onChange={(e) => handleEditChange('vendor2_package_size', e.target.value)}
                          label="Package Size"
                        >
                          {packageSizeOptions.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Box>
                    {editDialog.product.vendor2_name && (
                      <Button
                        variant={editDialog.product.default_vendor_index === 1 ? 'contained' : 'outlined'}
                        size="small"
                        onClick={() => handleEditChange('default_vendor_index', 1)}
                        sx={{ alignSelf: 'flex-start' }}
                      >
                        {editDialog.product.default_vendor_index === 1 ? 'Default Vendor' : 'Set as Default'}
                      </Button>
                    )}
                  </Box>
                </Box>

                {/* Vendor 3 */}
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom color="primary">
                    Vendor 3 (Optional) {editDialog.product.default_vendor_index === 2 && <Chip label="Default" size="small" color="success" sx={{ ml: 1 }} />}
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                      fullWidth
                      label="Vendor Name"
                      value={editDialog.product.vendor3_name || ''}
                      onChange={(e) => handleEditChange('vendor3_name', e.target.value)}
                    />
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <TextField
                        label="Price"
                        type="number"
                        value={editDialog.product.vendor3_price || ''}
                        onChange={(e) => handleEditChange('vendor3_price', parseFloat(e.target.value))}
                        InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                        inputProps={{ step: '0.01', min: '0' }}
                        sx={{ flex: 1 }}
                      />
                      <TextField
                        label="Weight"
                        type="number"
                        value={editDialog.product.vendor3_weight || ''}
                        onChange={(e) => handleEditChange('vendor3_weight', parseFloat(e.target.value))}
                        inputProps={{ step: '0.01', min: '0' }}
                        sx={{ flex: 1 }}
                      />
                      <FormControl sx={{ flex: 1 }}>
                        <InputLabel>Package Size</InputLabel>
                        <Select
                          value={editDialog.product.vendor3_package_size || 'kg'}
                          onChange={(e) => handleEditChange('vendor3_package_size', e.target.value)}
                          label="Package Size"
                        >
                          {packageSizeOptions.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Box>
                    {editDialog.product.vendor3_name && (
                      <Button
                        variant={editDialog.product.default_vendor_index === 2 ? 'contained' : 'outlined'}
                        size="small"
                        onClick={() => handleEditChange('default_vendor_index', 2)}
                        sx={{ alignSelf: 'flex-start' }}
                      >
                        {editDialog.product.default_vendor_index === 2 ? 'Default Vendor' : 'Set as Default'}
                      </Button>
                    )}
                  </Box>
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={handleCloseEdit} variant="outlined">
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} variant="contained">
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, productId: null })}>
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <Typography>Are you sure you want to delete this product? This action cannot be undone.</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialog({ open: false, productId: null })} variant="outlined">
              Cancel
            </Button>
            <Button onClick={confirmDelete} variant="contained" color="error">
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar */}
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
