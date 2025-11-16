'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  TableSortLabel,
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

export default function ProductManagementContent() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [orderBy, setOrderBy] = useState<'id' | 'name'>('id');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');

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
      let comparison = 0;
      if (orderBy === 'id') {
        comparison = a.id - b.id;
      } else if (orderBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      }
      return order === 'asc' ? comparison : -comparison;
    });

    setFilteredProducts(sorted);
    setPage(0);
  }, [searchQuery, products, orderBy, order]);

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
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'id'}
                    direction={orderBy === 'id' ? order : 'asc'}
                    onClick={() => {
                      if (orderBy === 'id') {
                        setOrder(order === 'asc' ? 'desc' : 'asc');
                      } else {
                        setOrderBy('id');
                        setOrder('desc');
                      }
                    }}
                  >
                    ID
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'name'}
                    direction={orderBy === 'name' ? order : 'asc'}
                    onClick={() => {
                      if (orderBy === 'name') {
                        setOrder(order === 'asc' ? 'desc' : 'asc');
                      } else {
                        setOrderBy('name');
                        setOrder('asc');
                      }
                    }}
                  >
                    Product Name
                  </TableSortLabel>
                </TableCell>
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
                          onClick={() => router.push(`/product-entry?id=${product.id}`)}
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
