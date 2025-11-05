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
  Collapse,
  Grid,
  CardContent,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Close as CloseIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
} from '@mui/icons-material';
import DashboardLayout from '../components/DashboardLayout';

interface Vendor {
  id: number;
  product_id: number;
  vendor_name: string;
  price: number;
  weight: number;
  package_size: string;
  is_default: boolean;
}

interface Product {
  id: number;
  name: string;
  description: string;
  vendors: Vendor[];
}

export default function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name'>('newest');

  const [editDialog, setEditDialog] = useState({
    open: false,
    product: null as Product | null,
  });

  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    productId: null as number | null,
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    let filtered = products.filter((product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.vendors.some((v) => v.vendor_name.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === 'newest') {
        return b.id - a.id; // Newest first (higher ID = newer)
      } else if (sortBy === 'oldest') {
        return a.id - b.id; // Oldest first
      } else if (sortBy === 'name') {
        return a.name.localeCompare(b.name); // Alphabetical
      }
      return 0;
    });

    setFilteredProducts(sorted);
    setPage(0);
  }, [searchQuery, products, sortBy]);

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/products');
      const result = await response.json();
      if (result.success) {
        setProducts(result.data);
        setFilteredProducts(result.data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleEditOpen = (product: Product) => {
    setEditDialog({ open: true, product: JSON.parse(JSON.stringify(product)) });
  };

  const handleEditClose = () => {
    setEditDialog({ open: false, product: null });
  };

  const handleEditSave = async () => {
    if (!editDialog.product) return;

    try {
      const response = await fetch(`http://localhost:3001/api/products/${editDialog.product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editDialog.product),
      });

      const result = await response.json();
      if (result.success) {
        setSnackbar({
          open: true,
          message: 'Product updated successfully',
          severity: 'success',
        });
        fetchProducts();
        handleEditClose();
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error updating product',
        severity: 'error',
      });
    }
  };

  const handleDeleteOpen = (productId: number) => {
    setDeleteDialog({ open: true, productId });
  };

  const handleDeleteClose = () => {
    setDeleteDialog({ open: false, productId: null });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.productId) return;

    try {
      const response = await fetch(`http://localhost:3001/api/products/${deleteDialog.productId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSnackbar({
          open: true,
          message: 'Product deleted successfully',
          severity: 'success',
        });
        fetchProducts();
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

  const handleVendorChange = (index: number, field: keyof Vendor, value: any) => {
    if (editDialog.product) {
      const updatedVendors = [...editDialog.product.vendors];
      updatedVendors[index] = {
        ...updatedVendors[index],
        [field]: value,
      };
      setEditDialog({
        ...editDialog,
        product: {
          ...editDialog.product,
          vendors: updatedVendors,
        },
      });
    }
  };

  const addVendorToEdit = () => {
    if (editDialog.product) {
      setEditDialog({
        ...editDialog,
        product: {
          ...editDialog.product,
          vendors: [
            ...editDialog.product.vendors,
            {
              id: 0,
              product_id: editDialog.product.id,
              vendor_name: '',
              price: 0,
              weight: 0,
              package_size: 'g',
              is_default: false,
            },
          ],
        },
      });
    }
  };

  const removeVendorFromEdit = (index: number) => {
    if (editDialog.product && editDialog.product.vendors.length > 1) {
      const updatedVendors = editDialog.product.vendors.filter((_, i) => i !== index);
      // If removed vendor was default, set first vendor as default
      if (editDialog.product.vendors[index].is_default && updatedVendors.length > 0) {
        updatedVendors[0].is_default = true;
      }
      setEditDialog({
        ...editDialog,
        product: {
          ...editDialog.product,
          vendors: updatedVendors,
        },
      });
    }
  };

  const setDefaultVendorInEdit = (index: number) => {
    if (editDialog.product) {
      const updatedVendors = editDialog.product.vendors.map((v, i) => ({
        ...v,
        is_default: i === index,
      }));
      setEditDialog({
        ...editDialog,
        product: {
          ...editDialog.product,
          vendors: updatedVendors,
        },
      });
    }
  };

  const getDefaultPrice = (product: Product): number => {
    const defaultVendor = product.vendors.find((v) => v.is_default);
    return defaultVendor ? Number(defaultVendor.price) : 0;
  };

  const getDefaultVendor = (product: Product): string => {
    const defaultVendor = product.vendors.find((v) => v.is_default);
    return defaultVendor ? defaultVendor.vendor_name : 'N/A';
  };

  const toggleRow = (productId: number) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(productId)) {
      newExpandedRows.delete(productId);
    } else {
      newExpandedRows.add(productId);
    }
    setExpandedRows(newExpandedRows);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedProducts = filteredProducts.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <DashboardLayout>
      <Box sx={{ p: 3 }}>
        <Card sx={{ mb: 3 }}>
          <Toolbar sx={{ justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
            <Typography variant="h5" component="h1" sx={{ fontWeight: 600 }}>
              Products
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'name')}
                  label="Sort By"
                >
                  <MenuItem value="newest">Newest First</MenuItem>
                  <MenuItem value="oldest">Oldest First</MenuItem>
                  <MenuItem value="name">Name (A-Z)</MenuItem>
                </Select>
              </FormControl>
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
                sx={{ minWidth: 300 }}
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
        </Card>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell width={50} />
                <TableCell>ID</TableCell>
                <TableCell>Product Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Default Price</TableCell>
                <TableCell>Vendors</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedProducts.map((product) => (
                <React.Fragment key={product.id}>
                  <TableRow hover>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => toggleRow(product.id)}
                      >
                        {expandedRows.has(product.id) ? (
                          <KeyboardArrowUpIcon />
                        ) : (
                          <KeyboardArrowDownIcon />
                        )}
                      </IconButton>
                    </TableCell>
                    <TableCell>{product.id}</TableCell>
                    <TableCell>
                      <Typography variant="body1" fontWeight={500}>
                        {product.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {product.description}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body1" fontWeight={600}>
                        ${getDefaultPrice(product).toFixed(2)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {getDefaultVendor(product)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={`${product.vendors.length} vendor${product.vendors.length !== 1 ? 's' : ''}`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={() => handleEditOpen(product)}
                          color="primary"
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteOpen(product.id)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
                      <Collapse in={expandedRows.has(product.id)} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 2 }}>
                          <Typography variant="h6" gutterBottom component="div" sx={{ mb: 2 }}>
                            Vendor Details
                          </Typography>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Vendor Name</TableCell>
                                <TableCell>Price</TableCell>
                                <TableCell>Weight</TableCell>
                                <TableCell>Package Size</TableCell>
                                <TableCell>Price per Unit</TableCell>
                                <TableCell>Default</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {product.vendors.map((vendor, index) => (
                                <TableRow key={index}>
                                  <TableCell>{vendor.vendor_name}</TableCell>
                                  <TableCell>${Number(vendor.price).toFixed(2)}</TableCell>
                                  <TableCell>{vendor.weight}</TableCell>
                                  <TableCell>{vendor.package_size}</TableCell>
                                  <TableCell>
                                    ${(Number(vendor.price) / Number(vendor.weight)).toFixed(4)}
                                  </TableCell>
                                  <TableCell>
                                    {vendor.is_default && (
                                      <Chip label="Default" size="small" color="success" />
                                    )}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={filteredProducts.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </TableContainer>

        {/* Edit Dialog */}
        <Dialog
          open={editDialog.open}
          onClose={handleEditClose}
          maxWidth="md"
          fullWidth
          fullScreen
        >
          <DialogTitle>
            Edit Product
            <IconButton
              onClick={handleEditClose}
              sx={{ position: 'absolute', right: 8, top: 8 }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers>
            {editDialog.product && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Product Information */}
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Product Information
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <TextField
                        label="Product Name"
                        fullWidth
                        value={editDialog.product.name}
                        onChange={(e) => handleEditChange('name', e.target.value)}
                      />
                      <TextField
                        label="Description"
                        fullWidth
                        multiline
                        rows={2}
                        value={editDialog.product.description}
                        onChange={(e) => handleEditChange('description', e.target.value)}
                      />
                    </Box>
                  </CardContent>
                </Card>

                {/* Vendors */}
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">
                      Vendors ({editDialog.product.vendors.length})
                    </Typography>
                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={addVendorToEdit}
                      size="small"
                    >
                      Add Vendor
                    </Button>
                  </Box>

                  {editDialog.product.vendors.map((vendor, index) => (
                    <Card key={index} variant="outlined" sx={{ mb: 2 }}>
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
                                onClick={() => setDefaultVendorInEdit(index)}
                                sx={{ mr: 1 }}
                              >
                                Set as Default
                              </Button>
                            )}
                            {editDialog.product.vendors.length > 1 && (
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => removeVendorFromEdit(index)}
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
                              fullWidth
                              value={vendor.vendor_name}
                              onChange={(e) => handleVendorChange(index, 'vendor_name', e.target.value)}
                            />
                          </Grid>
                          <Grid item xs={12} sm={4}>
                            <TextField
                              label="Price"
                              fullWidth
                              type="number"
                              value={vendor.price}
                              onChange={(e) => handleVendorChange(index, 'price', parseFloat(e.target.value))}
                              inputProps={{ step: '0.01', min: '0' }}
                            />
                          </Grid>
                          <Grid item xs={12} sm={4}>
                            <TextField
                              label="Weight"
                              fullWidth
                              type="number"
                              value={vendor.weight}
                              onChange={(e) => handleVendorChange(index, 'weight', parseFloat(e.target.value))}
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
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleEditClose}>Cancel</Button>
            <Button onClick={handleEditSave} variant="contained">
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialog.open} onClose={handleDeleteClose}>
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            Are you sure you want to delete this product? This action cannot be undone.
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDeleteClose}>Cancel</Button>
            <Button onClick={handleDeleteConfirm} color="error" variant="contained">
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar */}
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
