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
  Divider,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Close as CloseIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
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

interface RecipeIngredient {
  id: number;
  recipe_id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  unit: string;
  vendors?: Vendor[];
}

interface Recipe {
  id: number;
  name: string;
  description: string;
  created_at: string;
  ingredients?: RecipeIngredient[];
}

export default function RecipeManagement() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name'>('newest');

  const [viewDialog, setViewDialog] = useState({
    open: false,
    recipe: null as Recipe | null,
  });

  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    recipeId: null as number | null,
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  useEffect(() => {
    fetchRecipes();
  }, []);

  useEffect(() => {
    let filtered = recipes.filter((recipe) =>
      recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipe.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === 'newest') {
        return b.id - a.id;
      } else if (sortBy === 'oldest') {
        return a.id - b.id;
      } else if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      return 0;
    });

    setFilteredRecipes(sorted);
    setPage(0);
  }, [searchQuery, recipes, sortBy]);

  const fetchRecipes = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/recipes');
      const result = await response.json();
      if (result.success) {
        setRecipes(result.data);
        setFilteredRecipes(result.data);
      }
    } catch (error) {
      console.error('Error fetching recipes:', error);
    }
  };

  const fetchRecipeDetails = async (recipeId: number) => {
    try {
      const response = await fetch(`http://localhost:3001/api/recipes/${recipeId}`);
      const recipe = await response.json();
      setViewDialog({ open: true, recipe });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error loading recipe details',
        severity: 'error',
      });
    }
  };

  const handleViewOpen = (recipe: Recipe) => {
    fetchRecipeDetails(recipe.id);
  };

  const handleViewClose = () => {
    setViewDialog({ open: false, recipe: null });
  };

  const handleDeleteOpen = (recipeId: number) => {
    setDeleteDialog({ open: true, recipeId });
  };

  const handleDeleteClose = () => {
    setDeleteDialog({ open: false, recipeId: null });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.recipeId) return;

    try {
      const response = await fetch(`http://localhost:3001/api/recipes/${deleteDialog.recipeId}`, {
        method: 'DELETE',
      });

      const result = await response.json();
      if (result.success) {
        setSnackbar({
          open: true,
          message: 'Recipe deleted successfully',
          severity: 'success',
        });
        fetchRecipes();
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error deleting recipe',
        severity: 'error',
      });
    }

    setDeleteDialog({ open: false, recipeId: null });
  };

  const calculateRecipeCost = (recipe: Recipe): number => {
    if (!recipe.ingredients) return 0;

    return recipe.ingredients.reduce((total, ingredient) => {
      if (!ingredient.vendors || ingredient.vendors.length === 0) return total;

      const defaultVendor = ingredient.vendors.find((v) => v.is_default) || ingredient.vendors[0];
      if (!defaultVendor) return total;

      // Convert ingredient quantity to grams
      const quantityInGrams = convertToGrams(ingredient.quantity, ingredient.unit);

      // Convert vendor weight to grams
      const vendorWeightInGrams = convertToGrams(defaultVendor.weight, defaultVendor.package_size);

      // Calculate price per gram
      const pricePerGram = defaultVendor.price / vendorWeightInGrams;

      // Calculate ingredient cost
      return total + (pricePerGram * quantityInGrams);
    }, 0);
  };

  const toggleRow = (recipeId: number) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(recipeId)) {
      newExpandedRows.delete(recipeId);
    } else {
      newExpandedRows.add(recipeId);
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

  const paginatedRecipes = filteredRecipes.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <DashboardLayout>
      <Box sx={{ p: 3 }}>
        <Card sx={{ mb: 3 }}>
          <Toolbar sx={{ justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
            <Typography variant="h5" component="h1" sx={{ fontWeight: 600 }}>
              Recipes
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
                placeholder="Search recipes..."
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
                href="/recipe-creation"
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
                <TableCell>Recipe Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Ingredients</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedRecipes.map((recipe) => (
                <React.Fragment key={recipe.id}>
                  <TableRow hover>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => toggleRow(recipe.id)}
                      >
                        {expandedRows.has(recipe.id) ? (
                          <KeyboardArrowUpIcon />
                        ) : (
                          <KeyboardArrowDownIcon />
                        )}
                      </IconButton>
                    </TableCell>
                    <TableCell>{recipe.id}</TableCell>
                    <TableCell>
                      <Typography variant="body1" fontWeight={500}>
                        {recipe.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {recipe.description || 'No description'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={`${recipe.ingredients?.length || 0} ingredient${recipe.ingredients?.length !== 1 ? 's' : ''}`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={() => handleViewOpen(recipe)}
                          color="primary"
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          href={`/recipe-creation?id=${recipe.id}`}
                          color="primary"
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteOpen(recipe.id)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                      <Collapse in={expandedRows.has(recipe.id)} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 2 }}>
                          <Typography variant="h6" gutterBottom component="div" sx={{ mb: 2 }}>
                            Quick Preview
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Click "View Details" to see full ingredient list and cost breakdown
                          </Typography>
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
            count={filteredRecipes.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </TableContainer>

        {/* View Recipe Dialog */}
        <Dialog
          open={viewDialog.open}
          onClose={handleViewClose}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            Recipe Details
            <IconButton
              onClick={handleViewClose}
              sx={{ position: 'absolute', right: 8, top: 8 }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers>
            {viewDialog.recipe && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Recipe Information */}
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {viewDialog.recipe.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {viewDialog.recipe.description || 'No description'}
                    </Typography>
                  </CardContent>
                </Card>

                {/* Ingredients */}
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Ingredients ({viewDialog.recipe.ingredients?.length || 0})
                  </Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Product</TableCell>
                          <TableCell>Quantity</TableCell>
                          <TableCell>Unit</TableCell>
                          <TableCell>Vendor</TableCell>
                          <TableCell align="right">Cost</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {viewDialog.recipe.ingredients?.map((ingredient, index) => {
                          const defaultVendor = ingredient.vendors?.find((v) => v.is_default) || ingredient.vendors?.[0];
                          const quantityInGrams = convertToGrams(ingredient.quantity, ingredient.unit);
                          const vendorWeightInGrams = defaultVendor ? convertToGrams(defaultVendor.weight, defaultVendor.package_size) : 0;
                          const cost = defaultVendor ? (defaultVendor.price / vendorWeightInGrams) * quantityInGrams : 0;

                          return (
                            <TableRow key={index}>
                              <TableCell>{ingredient.product_name}</TableCell>
                              <TableCell>{ingredient.quantity}</TableCell>
                              <TableCell>{ingredient.unit}</TableCell>
                              <TableCell>{defaultVendor?.vendor_name || 'N/A'}</TableCell>
                              <TableCell align="right">${cost.toFixed(2)}</TableCell>
                            </TableRow>
                          );
                        })}
                        <TableRow>
                          <TableCell colSpan={4}>
                            <Typography variant="subtitle1" fontWeight={600}>
                              Total Cost
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="subtitle1" fontWeight={600} color="primary">
                              ${calculateRecipeCost(viewDialog.recipe).toFixed(2)}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleViewClose}>Close</Button>
            <Button
              variant="contained"
              href={`/recipe-creation?id=${viewDialog.recipe?.id}`}
              startIcon={<EditIcon />}
            >
              Edit Recipe
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialog.open} onClose={handleDeleteClose}>
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            Are you sure you want to delete this recipe? This action cannot be undone.
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
