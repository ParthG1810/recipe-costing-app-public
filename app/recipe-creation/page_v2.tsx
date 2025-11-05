'use client';
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Snackbar,
  Alert,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import DashboardLayout from '../components/DashboardLayout';
import { convertToGrams } from '../utils/helpers';

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

interface RecipeIngredient {
  product_id: number;
  product_name: string;
  quantity: string;
  unit: string;
  cost: number;
}

export default function RecipeCreation() {
  const [products, setProducts] = useState<Product[]>([]);
  const [recipeName, setRecipeName] = useState('');
  const [recipeDescription, setRecipeDescription] = useState('');
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<number | ''>('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('g');

  const [viewDialog, setViewDialog] = useState({
    open: false,
    recipeName: '',
    ingredients: [] as RecipeIngredient[],
    totalCost: 0,
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

  const getDefaultVendor = (product: Product): Vendor | null => {
    return product.vendors.find((v) => v.is_default) || product.vendors[0] || null;
  };

  const calculateIngredientCost = (product: Product, quantity: number, unit: string): number => {
    const vendor = getDefaultVendor(product);
    if (!vendor) return 0;

    // Convert ingredient quantity to grams
    const quantityInGrams = convertToGrams(quantity, unit);

    // Convert vendor weight to grams
    const vendorWeightInGrams = convertToGrams(vendor.weight, vendor.package_size);

    // Calculate price per gram
    const pricePerGram = vendor.price / vendorWeightInGrams;

    // Calculate total cost
    return pricePerGram * quantityInGrams;
  };

  const addIngredient = () => {
    if (!selectedProduct || !quantity) {
      setSnackbar({
        open: true,
        message: 'Please select a product and enter quantity',
        severity: 'error',
      });
      return;
    }

    const product = products.find((p) => p.id === selectedProduct);
    if (!product) return;

    const cost = calculateIngredientCost(product, parseFloat(quantity), unit);

    const newIngredient: RecipeIngredient = {
      product_id: product.id,
      product_name: product.name,
      quantity,
      unit,
      cost,
    };

    setIngredients([...ingredients, newIngredient]);
    setSelectedProduct('');
    setQuantity('');
    setUnit('g');
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const calculateTotalCost = (): number => {
    return ingredients.reduce((sum, ingredient) => sum + ingredient.cost, 0);
  };

  const handleSaveRecipe = async () => {
    if (!recipeName || ingredients.length === 0) {
      setSnackbar({
        open: true,
        message: 'Please enter recipe name and add at least one ingredient',
        severity: 'error',
      });
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: recipeName,
          description: recipeDescription,
          ingredients: ingredients.map((ing) => ({
            product_id: ing.product_id,
            quantity: parseFloat(ing.quantity),
            unit: ing.unit,
          })),
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSnackbar({
          open: true,
          message: 'Recipe saved successfully!',
          severity: 'success',
        });
        // Reset form
        setRecipeName('');
        setRecipeDescription('');
        setIngredients([]);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error saving recipe',
        severity: 'error',
      });
    }
  };

  const handleViewRecipe = () => {
    setViewDialog({
      open: true,
      recipeName,
      ingredients,
      totalCost: calculateTotalCost(),
    });
  };

  return (
    <DashboardLayout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
          Create Recipe
        </Typography>

        <Grid container spacing={3}>
          {/* Recipe Information */}
          <Grid size={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Recipe Information
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    label="Recipe Name"
                    required
                    fullWidth
                    value={recipeName}
                    onChange={(e) => setRecipeName(e.target.value)}
                    placeholder="e.g., Chocolate Chip Cookies"
                  />
                  <TextField
                    label="Description"
                    fullWidth
                    multiline
                    rows={3}
                    value={recipeDescription}
                    onChange={(e) => setRecipeDescription(e.target.value)}
                    placeholder="Brief description of the recipe"
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Add Ingredient */}
          <Grid size={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Add Ingredient
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <FormControl fullWidth>
                    <InputLabel>Product</InputLabel>
                    <Select
                      value={selectedProduct}
                      onChange={(e) => setSelectedProduct(e.target.value as number)}
                      label="Product"
                    >
                      {products.map((product) => (
                        <MenuItem key={product.id} value={product.id}>
                          {product.name}
                          {product.vendors.length > 0 && (
                            <Chip
                              label={`${product.vendors.length} vendor${product.vendors.length !== 1 ? 's' : ''}`}
                              size="small"
                              sx={{ ml: 1 }}
                            />
                          )}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                      label="Quantity"
                      type="number"
                      fullWidth
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      inputProps={{ step: '0.01', min: '0' }}
                    />
                    <FormControl sx={{ minWidth: 120 }}>
                      <InputLabel>Unit</InputLabel>
                      <Select
                        value={unit}
                        onChange={(e) => setUnit(e.target.value)}
                        label="Unit"
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
                  </Box>

                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={addIngredient}
                    fullWidth
                  >
                    Add Ingredient
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Ingredients Table */}
          <Grid size={12}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    Recipe Ingredients ({ingredients.length})
                  </Typography>
                  <Typography variant="h6" color="primary">
                    Total Cost: ${calculateTotalCost().toFixed(2)}
                  </Typography>
                </Box>

                {ingredients.length > 0 ? (
                  <TableContainer component={Paper} variant="outlined">
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Product</TableCell>
                          <TableCell>Quantity</TableCell>
                          <TableCell>Unit</TableCell>
                          <TableCell>Cost</TableCell>
                          <TableCell align="right">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {ingredients.map((ingredient, index) => (
                          <TableRow key={index}>
                            <TableCell>{ingredient.product_name}</TableCell>
                            <TableCell>{ingredient.quantity}</TableCell>
                            <TableCell>{ingredient.unit}</TableCell>
                            <TableCell>${ingredient.cost.toFixed(2)}</TableCell>
                            <TableCell align="right">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => removeIngredient(index)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Box
                    sx={{
                      p: 4,
                      textAlign: 'center',
                      bgcolor: 'grey.50',
                      borderRadius: 1,
                    }}
                  >
                    <Typography variant="body1" color="text.secondary">
                      No ingredients added yet. Add ingredients to start creating your recipe.
                    </Typography>
                  </Box>
                )}

                {ingredients.length > 0 && (
                  <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                    <Button
                      variant="outlined"
                      startIcon={<VisibilityIcon />}
                      onClick={handleViewRecipe}
                    >
                      Preview Recipe
                    </Button>
                    <Button
                      variant="contained"
                      onClick={handleSaveRecipe}
                    >
                      Save Recipe
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* View Recipe Dialog */}
        <Dialog
          open={viewDialog.open}
          onClose={() => setViewDialog({ ...viewDialog, open: false })}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Recipe Preview</DialogTitle>
          <DialogContent dividers>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box>
                <Typography variant="h6" gutterBottom>
                  {viewDialog.recipeName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {recipeDescription || 'No description'}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Ingredients
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Product</TableCell>
                        <TableCell>Quantity</TableCell>
                        <TableCell>Cost</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {viewDialog.ingredients.map((ingredient, index) => (
                        <TableRow key={index}>
                          <TableCell>{ingredient.product_name}</TableCell>
                          <TableCell>
                            {ingredient.quantity} {ingredient.unit}
                          </TableCell>
                          <TableCell>${ingredient.cost.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell colSpan={2}>
                          <Typography variant="subtitle1" fontWeight={600}>
                            Total Cost
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="subtitle1" fontWeight={600} color="primary">
                            ${viewDialog.totalCost.toFixed(2)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setViewDialog({ ...viewDialog, open: false })}>
              Close
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
