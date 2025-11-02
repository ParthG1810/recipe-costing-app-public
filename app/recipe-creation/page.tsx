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

interface Product {
  id: number;
  name: string;
  vendor1_price: number;
  vendor2_price: number;
  vendor3_price: number;
  default_vendor_index: number;
  purchase_quantity: number;
  purchase_unit: string;
}

interface RecipeIngredient {
  product_id: number;
  quantity: number;
  unit: string;
}

interface Recipe {
  id: number;
  name: string;
  description: string;
}

export default function RecipeCreation() {
  const [products, setProducts] = useState<Product[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>([]);
  const [newIngredient, setNewIngredient] = useState({
    product_id: '',
    quantity: '',
    unit: 'grams',
  });
  const [viewDialog, setViewDialog] = useState<{ open: boolean; recipeId: number | null }>({
    open: false,
    recipeId: null,
  });
  const [recipeDetails, setRecipeDetails] = useState<any>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  useEffect(() => {
    fetchProducts();
    fetchRecipes();
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

  const fetchRecipes = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/recipes');
      const result = await response.json();
      if (result.success) {
        setRecipes(result.data);
      }
    } catch (error) {
      console.error('Error fetching recipes:', error);
    }
  };

  const fetchRecipeDetails = async (recipeId: number) => {
    try {
      const response = await fetch(`http://localhost:3001/api/recipes/${recipeId}`);
      const result = await response.json();
      if (result.success) {
        setRecipeDetails(result.data);
      }
    } catch (error) {
      console.error('Error fetching recipe details:', error);
    }
  };

  const handleAddIngredient = () => {
    if (newIngredient.product_id && newIngredient.quantity) {
      setIngredients([
        ...ingredients,
        {
          product_id: parseInt(newIngredient.product_id),
          quantity: parseFloat(newIngredient.quantity),
          unit: newIngredient.unit,
        },
      ]);
      setNewIngredient({ product_id: '', quantity: '', unit: 'grams' });
    }
  };

  const handleRemoveIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const getProductById = (id: number) => {
    return products.find((p) => p.id === id);
  };

  const calculateIngredientCost = (ingredient: RecipeIngredient) => {
    const product = getProductById(ingredient.product_id);
    if (!product) return 0;

    const prices = [product.vendor1_price, product.vendor2_price, product.vendor3_price];
    const defaultPrice = prices[product.default_vendor_index] || 0;

    // Convert quantity to match product unit
    let adjustedQuantity = ingredient.quantity;
    if (ingredient.unit === 'kg' && product.purchase_unit === 'grams') {
      adjustedQuantity = ingredient.quantity * 1000;
    } else if (ingredient.unit === 'grams' && product.purchase_unit === 'kg') {
      adjustedQuantity = ingredient.quantity / 1000;
    }

    const costPerUnit = defaultPrice / product.purchase_quantity;
    return costPerUnit * adjustedQuantity;
  };

  const calculateTotalCost = () => {
    return ingredients.reduce((total, ingredient) => {
      return total + calculateIngredientCost(ingredient);
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (ingredients.length === 0) {
      setSnackbar({
        open: true,
        message: 'Please add at least one ingredient',
        severity: 'error',
      });
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/recipes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          ingredients,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSnackbar({
          open: true,
          message: 'Recipe created successfully!',
          severity: 'success',
        });
        setFormData({ name: '', description: '' });
        setIngredients([]);
        fetchRecipes();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: `Error: ${error instanceof Error ? error.message : 'Failed to create recipe'}`,
        severity: 'error',
      });
    }
  };

  const handleViewRecipe = async (recipeId: number) => {
    await fetchRecipeDetails(recipeId);
    setViewDialog({ open: true, recipeId });
  };

  const calculateRecipeDetailsCost = () => {
    if (!recipeDetails || !recipeDetails.ingredients) return 0;
    return recipeDetails.ingredients.reduce((total: number, ingredient: any) => {
      const prices = [ingredient.vendor1_price, ingredient.vendor2_price, ingredient.vendor3_price];
      const defaultPrice = prices[ingredient.default_vendor_index] || 0;
      
      let adjustedQuantity = ingredient.quantity;
      if (ingredient.unit === 'kg' && ingredient.purchase_unit === 'grams') {
        adjustedQuantity = ingredient.quantity * 1000;
      } else if (ingredient.unit === 'grams' && ingredient.purchase_unit === 'kg') {
        adjustedQuantity = ingredient.quantity / 1000;
      }

      const costPerUnit = defaultPrice / ingredient.purchase_quantity;
      return total + (costPerUnit * adjustedQuantity);
    }, 0);
  };

  return (
    <DashboardLayout>
      <Box>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
          Recipe Creation
        </Typography>

        <Grid container spacing={3}>
          {/* Recipe Form */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: '#1976d2' }}>
                  Create New Recipe
                </Typography>
                <form onSubmit={handleSubmit}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        required
                        label="Recipe Name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Description"
                        multiline
                        rows={2}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      />
                    </Grid>

                    {/* Add Ingredient Section */}
                    <Grid item xs={12}>
                      <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
                        Add Ingredients
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={5}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Select Product</InputLabel>
                        <Select
                          value={newIngredient.product_id}
                          label="Select Product"
                          onChange={(e) =>
                            setNewIngredient({ ...newIngredient, product_id: e.target.value })
                          }
                        >
                          {products.map((product) => (
                            <MenuItem key={product.id} value={product.id}>
                              {product.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Quantity"
                        type="number"
                        value={newIngredient.quantity}
                        onChange={(e) =>
                          setNewIngredient({ ...newIngredient, quantity: e.target.value })
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Unit</InputLabel>
                        <Select
                          value={newIngredient.unit}
                          label="Unit"
                          onChange={(e) =>
                            setNewIngredient({ ...newIngredient, unit: e.target.value })
                          }
                        >
                          <MenuItem value="grams">Grams</MenuItem>
                          <MenuItem value="kg">Kilograms</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={1}>
                      <IconButton color="primary" onClick={handleAddIngredient}>
                        <AddIcon />
                      </IconButton>
                    </Grid>

                    {/* Ingredients List */}
                    {ingredients.length > 0 && (
                      <Grid item xs={12}>
                        <TableContainer component={Paper} sx={{ maxHeight: 300 }}>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Product</TableCell>
                                <TableCell>Quantity</TableCell>
                                <TableCell>Cost</TableCell>
                                <TableCell>Action</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {ingredients.map((ingredient, index) => {
                                const product = getProductById(ingredient.product_id);
                                return (
                                  <TableRow key={index}>
                                    <TableCell>{product?.name}</TableCell>
                                    <TableCell>
                                      {ingredient.quantity} {ingredient.unit}
                                    </TableCell>
                                    <TableCell>${calculateIngredientCost(ingredient).toFixed(2)}</TableCell>
                                    <TableCell>
                                      <IconButton
                                        size="small"
                                        color="error"
                                        onClick={() => handleRemoveIngredient(index)}
                                      >
                                        <DeleteIcon />
                                      </IconButton>
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                              <TableRow>
                                <TableCell colSpan={2} sx={{ fontWeight: 'bold' }}>
                                  Total Cost
                                </TableCell>
                                <TableCell sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                                  ${calculateTotalCost().toFixed(2)}
                                </TableCell>
                                <TableCell />
                              </TableRow>
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Grid>
                    )}

                    <Grid item xs={12}>
                      <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
                        Create Recipe
                      </Button>
                    </Grid>
                  </Grid>
                </form>
              </CardContent>
            </Card>
          </Grid>

          {/* Recipes List */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: '#1976d2' }}>
                  Saved Recipes
                </Typography>
                <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {recipes.map((recipe) => (
                        <TableRow key={recipe.id}>
                          <TableCell>{recipe.name}</TableCell>
                          <TableCell>{recipe.description}</TableCell>
                          <TableCell>
                            <IconButton
                              color="primary"
                              onClick={() => handleViewRecipe(recipe.id)}
                            >
                              <VisibilityIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* View Recipe Dialog */}
        <Dialog
          open={viewDialog.open}
          onClose={() => setViewDialog({ open: false, recipeId: null })}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Recipe Details</DialogTitle>
          <DialogContent>
            {recipeDetails && (
              <Box>
                <Typography variant="h6">{recipeDetails.recipe?.name}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {recipeDetails.recipe?.description}
                </Typography>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Ingredient</TableCell>
                        <TableCell>Quantity</TableCell>
                        <TableCell>Cost</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {recipeDetails.ingredients?.map((ingredient: any, index: number) => {
                        const prices = [ingredient.vendor1_price, ingredient.vendor2_price, ingredient.vendor3_price];
                        const defaultPrice = prices[ingredient.default_vendor_index] || 0;
                        let adjustedQuantity = ingredient.quantity;
                        if (ingredient.unit === 'kg' && ingredient.purchase_unit === 'grams') {
                          adjustedQuantity = ingredient.quantity * 1000;
                        } else if (ingredient.unit === 'grams' && ingredient.purchase_unit === 'kg') {
                          adjustedQuantity = ingredient.quantity / 1000;
                        }
                        const costPerUnit = defaultPrice / ingredient.purchase_quantity;
                        const cost = costPerUnit * adjustedQuantity;

                        return (
                          <TableRow key={index}>
                            <TableCell>{ingredient.product_name}</TableCell>
                            <TableCell>
                              {ingredient.quantity} {ingredient.unit}
                            </TableCell>
                            <TableCell>${cost.toFixed(2)}</TableCell>
                          </TableRow>
                        );
                      })}
                      <TableRow>
                        <TableCell colSpan={2} sx={{ fontWeight: 'bold' }}>
                          Total Recipe Cost
                        </TableCell>
                        <TableCell sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                          ${calculateRecipeDetailsCost().toFixed(2)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setViewDialog({ open: false, recipeId: null })}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar */}
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
