'use client';
import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
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

export default function RecipeCreationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const recipeId = searchParams.get('id');
  const isEditMode = !!recipeId;
  
  const [activeStep, setActiveStep] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingRecipe, setIsLoadingRecipe] = useState(false);
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

  useEffect(() => {
    if (isEditMode && recipeId && products.length > 0) {
      fetchRecipeData(recipeId);
    }
  }, [isEditMode, recipeId, products]);

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/products');
      const result = await response.json();
      if (result.success) {
        setProducts(result.data);
        // Set first product as default selection if products exist
        if (result.data.length > 0 && !selectedProduct) {
          setSelectedProduct(result.data[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchRecipeData = async (id: string) => {
    setIsLoadingRecipe(true);
    try {
      const response = await fetch(`http://localhost:3001/api/recipes/${id}`);
      const recipeData = await response.json();
      
      if (recipeData) {
        setRecipeName(recipeData.name || '');
        setRecipeDescription(recipeData.description || '');
        
        // Convert recipe ingredients to the format used in the form
        if (recipeData.ingredients && recipeData.ingredients.length > 0) {
          const formattedIngredients = recipeData.ingredients.map((ing: any) => {
            const product = products.find(p => p.id === ing.product_id);
            const cost = product ? calculateIngredientCost(product, parseFloat(ing.quantity), ing.unit) : 0;
            
            return {
              product_id: ing.product_id,
              product_name: ing.product_name,
              quantity: ing.quantity.toString(),
              unit: ing.unit,
              cost: cost
            };
          });
          setIngredients(formattedIngredients);
          
          // Auto-select next available product after loading ingredients
          const usedProductIds = formattedIngredients.map(ing => ing.product_id);
          const availableProduct = products.find(p => !usedProductIds.includes(p.id));
          setSelectedProduct(availableProduct ? availableProduct.id : '');
        }
      }
    } catch (error) {
      console.error('Error fetching recipe data:', error);
      setSnackbar({
        open: true,
        message: 'Error loading recipe data',
        severity: 'error',
      });
    } finally {
      setIsLoadingRecipe(false);
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

    const updatedIngredients = [...ingredients, newIngredient];
    setIngredients(updatedIngredients);
    
    // Get list of used product IDs
    const usedProductIds = updatedIngredients.map(ing => ing.product_id);
    
    // Find next available product that hasn't been used
    const availableProduct = products.find(p => !usedProductIds.includes(p.id));
    
    // Set next available product or empty if all products used
    setSelectedProduct(availableProduct ? availableProduct.id : '');
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
      if (!recipeName.trim()) {
        setSnackbar({
          open: true,
          message: 'Please enter a recipe name',
          severity: 'error',
        });
        return;
      }
    }

    if (activeStep === 1) {
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
      const url = isEditMode 
        ? `http://localhost:3001/api/recipes/${recipeId}`
        : 'http://localhost:3001/api/recipes';
      
      const method = isEditMode ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method: method,
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
          message: isEditMode ? 'Recipe updated successfully!' : 'Recipe saved successfully!',
          severity: 'success',
        });
        
        // Reset form only in create mode
        if (!isEditMode) {
          setTimeout(() => {
            setRecipeName('');
            setRecipeDescription('');
            setIngredients([]);
            setActiveStep(0);
          }, 1500);
        } else {
          // In edit mode, just go back to step 0 to show the updated data
          setTimeout(() => {
            setActiveStep(0);
          }, 1500);
        }
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
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, mt: 3 }}>
                <TextField
                  label="Recipe Name"
                  value={recipeName}
                  onChange={(e) => setRecipeName(e.target.value)}
                  required
                  fullWidth
                  placeholder="e.g., Chocolate Chip Cookies"
                  InputProps={{
                    sx: { fontSize: '1.1rem', padding: '4px 0' }
                  }}
                  InputLabelProps={{
                    sx: { fontSize: '1.05rem' }
                  }}
                />
                <TextField
                  label="Description"
                  value={recipeDescription}
                  onChange={(e) => setRecipeDescription(e.target.value)}
                  multiline
                  rows={5}
                  fullWidth
                  placeholder="Describe your recipe..."
                  InputProps={{
                    sx: { fontSize: '1.05rem' }
                  }}
                  InputLabelProps={{
                    sx: { fontSize: '1.05rem' }
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        );

      case 1:
        return (
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Add Ingredients
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={addIngredient}
                  size="small"
                >
                  Add Ingredient
                </Button>
              </Box>

              {/* Inline ingredient input form */}
              <Card variant="outlined" sx={{ position: 'relative' }}>
                <CardContent>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel sx={{ fontSize: '1.05rem' }}>Select Product</InputLabel>
                        <Select
                          value={selectedProduct}
                          onChange={(e) => setSelectedProduct(e.target.value as number)}
                          sx={{ fontSize: '1.05rem', minWidth: '200px' }}
                          label="Select Product"
                        >
                          {products
                            .filter(product => !ingredients.some(ing => ing.product_id === product.id))
                            .map((product) => (
                              <MenuItem key={product.id} value={product.id} sx={{ fontSize: '1.05rem' }}>
                                {product.name}
                              </MenuItem>
                            ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <TextField
                        label="Quantity"
                        required
                        fullWidth
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        placeholder="0"
                        inputProps={{ step: '0.01', min: '0' }}
                        InputProps={{
                          sx: { fontSize: '1.05rem' }
                        }}
                        InputLabelProps={{
                          sx: { fontSize: '1.05rem' }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <FormControl fullWidth>
                        <InputLabel sx={{ fontSize: '1.05rem' }}>Unit</InputLabel>
                        <Select
                          value={unit}
                          onChange={(e) => setUnit(e.target.value)}
                          sx={{ fontSize: '1.05rem' }}
                          label="Unit"
                        >
                          <MenuItem value="g" sx={{ fontSize: '1.05rem' }}>Grams (g)</MenuItem>
                          <MenuItem value="kg" sx={{ fontSize: '1.05rem' }}>Kilograms (kg)</MenuItem>
                          <MenuItem value="lb" sx={{ fontSize: '1.05rem' }}>Pounds (lb)</MenuItem>
                          <MenuItem value="oz" sx={{ fontSize: '1.05rem' }}>Ounces (oz)</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {ingredients.length > 0 && (
                <TableContainer component={Paper} variant="outlined" sx={{ mt: 3 }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Product</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Quantity</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Unit</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Cost</TableCell>
                        <TableCell sx={{ fontWeight: 600, width: 60 }}></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {ingredients.map((ingredient, index) => (
                        <TableRow key={index}>
                          <TableCell>{ingredient.product_name}</TableCell>
                          <TableCell>{ingredient.quantity}</TableCell>
                          <TableCell>{ingredient.unit}</TableCell>
                          <TableCell>${ingredient.cost.toFixed(2)}</TableCell>
                          <TableCell>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => removeIngredient(index)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              {ingredients.length > 0 && (
                <Card variant="outlined" sx={{ mt: 2, bgcolor: 'grey.50' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="subtitle1" fontWeight={700}>
                        Total Cost
                      </Typography>
                      <Typography variant="subtitle1" fontWeight={700} color="primary">
                        ${calculateTotalCost().toFixed(2)}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Review & Save
              </Typography>
              <Box sx={{ mt: 3 }}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                    Recipe Information
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    <strong>Name:</strong> {recipeName}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Description:</strong> {recipeDescription || 'No description'}
                  </Typography>
                </Box>

                <Divider sx={{ my: 3 }} />

                <Box>
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                    Ingredients ({ingredients.length})
                  </Typography>
                  <TableContainer component={Paper} variant="outlined" sx={{ mt: 2 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Product</TableCell>
                          <TableCell>Quantity</TableCell>
                          <TableCell>Unit</TableCell>
                          <TableCell align="right">Cost</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {ingredients.map((ingredient, index) => (
                          <TableRow key={index}>
                            <TableCell>{ingredient.product_name}</TableCell>
                            <TableCell>{ingredient.quantity}</TableCell>
                            <TableCell>{ingredient.unit}</TableCell>
                            <TableCell align="right">${ingredient.cost.toFixed(2)}</TableCell>
                          </TableRow>
                        ))}
                        <TableRow>
                          <TableCell colSpan={3}>
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
        {/* Navigation Buttons - Above header */}
        <Box sx={{ 
          position: 'fixed', 
          top: '190px',
          left: '246px',
          right: '24px',
          zIndex: 1000, 
          display: 'flex', 
          justifyContent: 'space-between',
          pb: 2
        }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            startIcon={<ArrowBackIcon />}
          >
            Back
          </Button>
          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleSaveRecipe}
              startIcon={<SaveIcon />}
            >
              {isEditMode ? 'Update Recipe' : 'Save Recipe'}
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

        {/* Spacer to prevent content overlap */}
        <Box sx={{ height: '60px' }} />

        <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
          {isEditMode ? 'Edit Recipe' : 'Create Recipe'}
        </Typography>
        {isLoadingRecipe && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Loading recipe data...
          </Typography>
        )}

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
        {renderStepContent(activeStep)}

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
