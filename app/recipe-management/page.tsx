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
  Collapse,
  Grid,
  CardContent,
  Divider,
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

type OrderDirection = 'asc' | 'desc';
type OrderBy = 'id' | 'name' | 'created_at';

export default function RecipeManagement() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [orderBy, setOrderBy] = useState<OrderBy>('created_at');
  const [order, setOrder] = useState<OrderDirection>('desc');



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
    filterAndSortRecipes();
  }, [recipes, searchQuery, orderBy, order]);

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

  const filterAndSortRecipes = () => {
    let filtered = recipes.filter(
      (recipe) =>
        recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recipe.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Sort recipes
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      if (orderBy === 'id') {
        aValue = a.id;
        bValue = b.id;
      } else if (orderBy === 'name') {
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
      } else if (orderBy === 'created_at') {
        aValue = new Date(a.created_at).getTime();
        bValue = new Date(b.created_at).getTime();
      }

      if (order === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredRecipes(filtered);
  };

  const handleRequestSort = (property: OrderBy) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleDeleteRecipe = async () => {
    if (!deleteDialog.recipeId) return;

    try {
      const response = await fetch(`http://localhost:3001/api/recipes/${deleteDialog.recipeId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        setSnackbar({
          open: true,
          message: 'Recipe deleted successfully!',
          severity: 'success',
        });
        fetchRecipes();
      } else {
        throw new Error(result.error);
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

      const quantityInGrams = convertToGrams(ingredient.quantity, ingredient.unit);
      const vendorWeightInGrams = convertToGrams(defaultVendor.weight, defaultVendor.package_size);
      const pricePerGram = defaultVendor.price / vendorWeightInGrams;

      return total + (pricePerGram * quantityInGrams);
    }, 0);
  };

  const toggleRow = async (recipeId: number) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(recipeId)) {
      newExpandedRows.delete(recipeId);
    } else {
      newExpandedRows.add(recipeId);
      
      // Fetch full recipe details with ingredients and vendors
      try {
        const response = await fetch(`http://localhost:3001/api/recipes/${recipeId}`);
        const recipeData = await response.json();
        
        // Update the recipe in the recipes array with full ingredient data
        setRecipes(prevRecipes => 
          prevRecipes.map(r => 
            r.id === recipeId ? { ...r, ingredients: recipeData.ingredients } : r
          )
        );
      } catch (error) {
        console.error('Error fetching recipe details:', error);
      }
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
                <TableCell sortDirection={orderBy === 'id' ? order : false}>
                  <TableSortLabel
                    active={orderBy === 'id'}
                    direction={orderBy === 'id' ? order : 'asc'}
                    onClick={() => handleRequestSort('id')}
                  >
                    ID
                  </TableSortLabel>
                </TableCell>
                <TableCell sortDirection={orderBy === 'name' ? order : false}>
                  <TableSortLabel
                    active={orderBy === 'name'}
                    direction={orderBy === 'name' ? order : 'asc'}
                    onClick={() => handleRequestSort('name')}
                  >
                    Recipe Name
                  </TableSortLabel>
                </TableCell>
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
                      <IconButton size="small" onClick={() => toggleRow(recipe.id)}>
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
                        label={`${recipe.ingredients?.length || 0} ingredient${
                          (recipe.ingredients?.length || 0) !== 1 ? 's' : ''
                        }`}
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
                          href={`/recipe-creation?id=${recipe.id}`}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => setDeleteDialog({ open: true, recipeId: recipe.id })}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>

                  {/* Expandable Row */}
                  <TableRow>
                    <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                      <Collapse in={expandedRows.has(recipe.id)} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 2 }}>
                          <Typography variant="h6" gutterBottom component="div">
                            Ingredient Details
                          </Typography>
                          {!recipe.ingredients || recipe.ingredients.length === 0 || !recipe.ingredients[0]?.vendors ? (
                            <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                              Loading ingredient details...
                            </Typography>
                          ) : (
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
                              {recipe.ingredients?.map((ingredient: any) => {
                                const defaultVendor = ingredient.vendors?.find((v: any) => v.is_default) || ingredient.vendors?.[0];
                                const quantityInGrams = convertToGrams(ingredient.quantity, ingredient.unit);
                                const vendorWeightInGrams = defaultVendor
                                  ? convertToGrams(defaultVendor.weight, defaultVendor.package_size)
                                  : 0;
                                const cost = defaultVendor
                                  ? (Number(defaultVendor.price) / vendorWeightInGrams) * quantityInGrams
                                  : 0;

                                return (
                                  <TableRow key={ingredient.id}>
                                    <TableCell>{ingredient.product_name}</TableCell>
                                    <TableCell>{Number(ingredient.quantity).toFixed(2)}</TableCell>
                                    <TableCell>{ingredient.unit}</TableCell>
                                    <TableCell>{defaultVendor?.vendor_name || 'N/A'}</TableCell>
                                    <TableCell align="right">${cost.toFixed(2)}</TableCell>
                                  </TableRow>
                                );
                              })}
                              <TableRow>
                                <TableCell colSpan={4} align="right">
                                  <Typography variant="subtitle1" fontWeight="bold">
                                    Total Cost:
                                  </Typography>
                                </TableCell>
                                <TableCell align="right">
                                  <Typography variant="subtitle1" fontWeight="bold" color="primary">
                                    ${
                                      recipe.ingredients?.reduce((total: number, ingredient: any) => {
                                        const defaultVendor = ingredient.vendors?.find((v: any) => v.is_default) || ingredient.vendors?.[0];
                                        const quantityInGrams = convertToGrams(ingredient.quantity, ingredient.unit);
                                        const vendorWeightInGrams = defaultVendor
                                          ? convertToGrams(defaultVendor.weight, defaultVendor.package_size)
                                          : 0;
                                        const cost = defaultVendor
                                          ? (Number(defaultVendor.price) / vendorWeightInGrams) * quantityInGrams
                                          : 0;
                                        return total + cost;
                                      }, 0).toFixed(2) || '0.00'
                                    }
                                  </Typography>
                                </TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                          )}
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

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialog.open}
          onClose={() => setDeleteDialog({ open: false, recipeId: null })}
        >
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete this recipe? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialog({ open: false, recipeId: null })}>Cancel</Button>
            <Button onClick={handleDeleteRecipe} color="error" variant="contained">
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
