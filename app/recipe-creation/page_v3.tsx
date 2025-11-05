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
  Stepper,
  Step,
  StepLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Snackbar,
  Alert,
  Chip,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Save as SaveIcon,
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

const steps = ['Recipe Information', 'Add Ingredients', 'Review & Save'];

export default function RecipeCreation() {
  const [activeStep, setActiveStep] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [recipeName, setRecipeName] = useState('');
  const [recipeDescription, setRecipeDescription] = useState('');
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<number | ''>('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('g');

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

    const quantityInGrams = convertToGrams(quantity, unit);
    const vendorWeightInGrams = convertToGrams(vendor.weight, vendor.package_size);
    const pricePerGram = vendor.price / vendorWeightInGrams;

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

  const handleNext = () => {
    if (activeStep === 0) {
      if (!recipeName) {
        setSnackbar({
          open: true,
          message: 'Please enter recipe name',
          severity: 'error',
        });
        return;
      }
    } else if (activeStep === 1) {
      if (ingredients.length === 0) {
        setSnackbar({
          open: true,
          message: 'Please add at least one ingredient',
          severity: 'error',
        });
        return;
      }
    }
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSaveRecipe = async () => {
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
        setTimeout(() => {
          setRecipeName('');
          setRecipeDescription('');
          setIngredients([]);
          setActiveStep(0);
        }, 1500);
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

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recipe Information
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
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
                  rows={4}
                  value={recipeDescription}
                  onChange={(e) => setRecipeDescription(e.target.value)}
                  placeholder="Brief description of the recipe"
                />
              </Box>
            </CardContent>
          </Card>
        );

      case 1:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Add Ingredient Form */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Add Ingredient
                </Typography>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid size={12} md={6}>
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
                  </Grid>
                  <Grid size={12} md={3}>
                    <TextField
                      label="Quantity"
                      type="number"
                      fullWidth
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      inputProps={{ step: '0.01', min: '0' }}
                    />
                  </Grid>
                  <Grid size={12} md={3}>
                    <FormControl fullWidth>
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
                  </Grid>
                  <Grid size={12}>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={addIngredient}
                      fullWidth
                    >
                      Add Ingredient
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Ingredients List */}
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    Ingredients ({ingredients.length})
                  </Typography>
                  <Typography variant="h6" color="primary">
                    Total: ${calculateTotalCost().toFixed(2)}
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
                          <TableCell align="right">Cost</TableCell>
                          <TableCell align="right">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {ingredients.map((ingredient, index) => (
                          <TableRow key={index}>
                            <TableCell>{ingredient.product_name}</TableCell>
                            <TableCell>{ingredient.quantity}</TableCell>
                            <TableCell>{ingredient.unit}</TableCell>
                            <TableCell align="right">${ingredient.cost.toFixed(2)}</TableCell>
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
                      No ingredients added yet. Add ingredients to create your recipe.
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Box>
        );

      case 2:
        return (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Review Recipe
              </Typography>
              
              {/* Recipe Info */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Recipe Information
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Name:</strong> {recipeName}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  <strong>Description:</strong> {recipeDescription || 'No description'}
                </Typography>
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* Ingredients */}
              <Box>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Ingredients ({ingredients.length})
                </Typography>
                <TableContainer component={Paper} variant="outlined" sx={{ mt: 2 }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Product</TableCell>
                        <TableCell>Quantity</TableCell>
                        <TableCell align="right">Cost</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {ingredients.map((ingredient, index) => (
                        <TableRow key={index}>
                          <TableCell>{ingredient.product_name}</TableCell>
                          <TableCell>
                            {ingredient.quantity} {ingredient.unit}
                          </TableCell>
                          <TableCell align="right">${ingredient.cost.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell colSpan={2}>
                          <Typography variant="subtitle1" fontWeight={600}>
                            Total Cost
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="subtitle1" fontWeight={600} color="primary">
                            ${calculateTotalCost().toFixed(2)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <DashboardLayout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
          Create Recipe
        </Typography>

        {/* Stepper */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Stepper activeStep={activeStep}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </CardContent>
        </Card>

        {/* Step Content */}
        <Box sx={{ mb: 3 }}>
          {renderStepContent(activeStep)}
        </Box>

        {/* Navigation Buttons */}
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                startIcon={<ArrowBackIcon />}
              >
                Back
              </Button>
              <Box sx={{ display: 'flex', gap: 2 }}>
                {activeStep === steps.length - 1 ? (
                  <Button
                    variant="contained"
                    onClick={handleSaveRecipe}
                    startIcon={<SaveIcon />}
                  >
                    Save Recipe
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    endIcon={<ArrowForwardIcon />}
                  >
                    Next
                  </Button>
                )}
              </Box>
            </Box>
          </CardContent>
        </Card>

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
