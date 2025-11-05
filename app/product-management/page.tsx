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
  Collapse,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Chip,
} from '@mui/material';
import {
  KeyboardArrowDown as ExpandMoreIcon,
  KeyboardArrowUp as ExpandLessIcon,
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
  vendor1_name: string;
  vendor1_price: number;
  vendor1_package_size: string;
  vendor2_name: string;
  vendor2_price: number;
  vendor2_package_size: string;
  vendor3_name: string;
  vendor3_price: number;
  vendor3_package_size: string;
  default_vendor_index: number;
}

function ProductRow({ product, onUpdate, onDelete }: { product: Product; onUpdate: () => void; onDelete: (id: number) => void }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState<Product>(product);

  const getDefaultPrice = () => {
    const prices = [product.vendor1_price, product.vendor2_price, product.vendor3_price];
    const price = prices[product.default_vendor_index];
    return typeof price === 'number' ? price : 0;
  };

  const getDefaultVendor = () => {
    const vendors = [product.vendor1_name, product.vendor2_name, product.vendor3_name];
    return vendors[product.default_vendor_index] || 'N/A';
  };

  const handleSave = async () => {
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
        setEditing(false);
        onUpdate();
      }
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  const handleCancel = () => {
    setEditData(product);
    setEditing(false);
  };

  const handleEditChange = (field: keyof Product, value: any) => {
    setEditData({ ...editData, [field]: value });
  };

  return (
    <>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell>
          <IconButton size="small" onClick={() => setOpen(!open)}>
            {open ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </TableCell>
        <TableCell>
          {editing ? (
            <TextField
              size="small"
              value={editData.name}
              onChange={(e) => handleEditChange('name', e.target.value)}
              fullWidth
            />
          ) : (
            <Typography fontWeight="bold">{product.name}</Typography>
          )}
        </TableCell>
        <TableCell>
          {editing ? (
            <TextField
              size="small"
              value={editData.description}
              onChange={(e) => handleEditChange('description', e.target.value)}
              fullWidth
            />
          ) : (
            product.description
          )}
        </TableCell>
        <TableCell>
          <Typography variant="body2" fontWeight="bold">
            ${getDefaultPrice().toFixed(2)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {getDefaultVendor()}
          </Typography>
        </TableCell>
        <TableCell>
          {editing ? (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton size="small" color="primary" onClick={handleSave}>
                <SaveIcon />
              </IconButton>
              <IconButton size="small" onClick={handleCancel}>
                <CancelIcon />
              </IconButton>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton size="small" color="primary" onClick={() => setEditing(true)}>
                <EditIcon />
              </IconButton>
              <IconButton size="small" color="error" onClick={() => onDelete(product.id)}>
                <DeleteIcon />
              </IconButton>
            </Box>
          )}
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 2 }}>
              <Typography variant="h6" gutterBottom component="div" sx={{ color: '#1976d2', fontWeight: 'bold' }}>
                Vendor Details
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Vendor</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Vendor Name</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Price</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Package Size</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Default</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {/* Vendor 1 */}
                  <TableRow>
                    <TableCell>Vendor 1</TableCell>
                    <TableCell>
                      {editing ? (
                        <TextField
                          size="small"
                          value={editData.vendor1_name}
                          onChange={(e) => handleEditChange('vendor1_name', e.target.value)}
                          fullWidth
                        />
                      ) : (
                        product.vendor1_name || '-'
                      )}
                    </TableCell>
                    <TableCell>
                      {editing ? (
                        <TextField
                          size="small"
                          type="number"
                          value={editData.vendor1_price}
                          onChange={(e) => handleEditChange('vendor1_price', parseFloat(e.target.value))}
                          inputProps={{ step: '0.01', min: '0' }}
                          fullWidth
                        />
                      ) : (
                        `$${product.vendor1_price?.toFixed(2) || '0.00'}`
                      )}
                    </TableCell>
                    <TableCell>
                      {editing ? (
                        <Select
                          size="small"
                          value={editData.vendor1_package_size}
                          onChange={(e) => handleEditChange('vendor1_package_size', e.target.value)}
                          fullWidth
                        >
                          <MenuItem value="g">Grams (g)</MenuItem>
                          <MenuItem value="kg">Kilograms (kg)</MenuItem>
                          <MenuItem value="lb">Pounds (lb)</MenuItem>
                          <MenuItem value="oz">Ounces (oz)</MenuItem>
                          <MenuItem value="ml">Milliliters (ml)</MenuItem>
                          <MenuItem value="l">Liters (l)</MenuItem>
                          <MenuItem value="pcs">Pieces (pcs)</MenuItem>
                        </Select>
                      ) : (
                        product.vendor1_package_size || '-'
                      )}
                    </TableCell>
                    <TableCell>
                      {editing ? (
                        <IconButton
                          size="small"
                          color={editData.default_vendor_index === 0 ? 'primary' : 'default'}
                          onClick={() => handleEditChange('default_vendor_index', 0)}
                        >
                          {editData.default_vendor_index === 0 ? '✓' : '○'}
                        </IconButton>
                      ) : (
                        product.default_vendor_index === 0 && <Chip label="Default" color="primary" size="small" />
                      )}
                    </TableCell>
                  </TableRow>

                  {/* Vendor 2 */}
                  <TableRow>
                    <TableCell>Vendor 2</TableCell>
                    <TableCell>
                      {editing ? (
                        <TextField
                          size="small"
                          value={editData.vendor2_name}
                          onChange={(e) => handleEditChange('vendor2_name', e.target.value)}
                          fullWidth
                        />
                      ) : (
                        product.vendor2_name || '-'
                      )}
                    </TableCell>
                    <TableCell>
                      {editing ? (
                        <TextField
                          size="small"
                          type="number"
                          value={editData.vendor2_price}
                          onChange={(e) => handleEditChange('vendor2_price', parseFloat(e.target.value))}
                          inputProps={{ step: '0.01', min: '0' }}
                          fullWidth
                        />
                      ) : (
                        `$${product.vendor2_price?.toFixed(2) || '0.00'}`
                      )}
                    </TableCell>
                    <TableCell>
                      {editing ? (
                        <Select
                          size="small"
                          value={editData.vendor2_package_size}
                          onChange={(e) => handleEditChange('vendor2_package_size', e.target.value)}
                          fullWidth
                        >
                          <MenuItem value="g">Grams (g)</MenuItem>
                          <MenuItem value="kg">Kilograms (kg)</MenuItem>
                          <MenuItem value="lb">Pounds (lb)</MenuItem>
                          <MenuItem value="oz">Ounces (oz)</MenuItem>
                          <MenuItem value="ml">Milliliters (ml)</MenuItem>
                          <MenuItem value="l">Liters (l)</MenuItem>
                          <MenuItem value="pcs">Pieces (pcs)</MenuItem>
                        </Select>
                      ) : (
                        product.vendor2_package_size || '-'
                      )}
                    </TableCell>
                    <TableCell>
                      {editing ? (
                        <IconButton
                          size="small"
                          color={editData.default_vendor_index === 1 ? 'primary' : 'default'}
                          onClick={() => handleEditChange('default_vendor_index', 1)}
                        >
                          {editData.default_vendor_index === 1 ? '✓' : '○'}
                        </IconButton>
                      ) : (
                        product.default_vendor_index === 1 && <Chip label="Default" color="primary" size="small" />
                      )}
                    </TableCell>
                  </TableRow>

                  {/* Vendor 3 */}
                  <TableRow>
                    <TableCell>Vendor 3</TableCell>
                    <TableCell>
                      {editing ? (
                        <TextField
                          size="small"
                          value={editData.vendor3_name}
                          onChange={(e) => handleEditChange('vendor3_name', e.target.value)}
                          fullWidth
                        />
                      ) : (
                        product.vendor3_name || '-'
                      )}
                    </TableCell>
                    <TableCell>
                      {editing ? (
                        <TextField
                          size="small"
                          type="number"
                          value={editData.vendor3_price}
                          onChange={(e) => handleEditChange('vendor3_price', parseFloat(e.target.value))}
                          inputProps={{ step: '0.01', min: '0' }}
                          fullWidth
                        />
                      ) : (
                        `$${product.vendor3_price?.toFixed(2) || '0.00'}`
                      )}
                    </TableCell>
                    <TableCell>
                      {editing ? (
                        <Select
                          size="small"
                          value={editData.vendor3_package_size}
                          onChange={(e) => handleEditChange('vendor3_package_size', e.target.value)}
                          fullWidth
                        >
                          <MenuItem value="g">Grams (g)</MenuItem>
                          <MenuItem value="kg">Kilograms (kg)</MenuItem>
                          <MenuItem value="lb">Pounds (lb)</MenuItem>
                          <MenuItem value="oz">Ounces (oz)</MenuItem>
                          <MenuItem value="ml">Milliliters (ml)</MenuItem>
                          <MenuItem value="l">Liters (l)</MenuItem>
                          <MenuItem value="pcs">Pieces (pcs)</MenuItem>
                        </Select>
                      ) : (
                        product.vendor3_package_size || '-'
                      )}
                    </TableCell>
                    <TableCell>
                      {editing ? (
                        <IconButton
                          size="small"
                          color={editData.default_vendor_index === 2 ? 'primary' : 'default'}
                          onClick={() => handleEditChange('default_vendor_index', 2)}
                        >
                          {editData.default_vendor_index === 2 ? '✓' : '○'}
                        </IconButton>
                      ) : (
                        product.default_vendor_index === 2 && <Chip label="Default" color="primary" size="small" />
                      )}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

export default function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([]);
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

  return (
    <DashboardLayout>
      <Box>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
          Product Management
        </Typography>

        <Card>
          <CardContent>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell />
                    <TableCell sx={{ fontWeight: 'bold' }}>Product Name</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Default Price</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {products.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                          No products found. Add products from the Product Entry page.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    products.map((product) => (
                      <ProductRow
                        key={product.id}
                        product={product}
                        onUpdate={fetchProducts}
                        onDelete={(id) => setDeleteDialog({ open: true, id })}
                      />
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

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
