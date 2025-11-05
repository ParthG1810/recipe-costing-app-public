'use client';
import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  IconButton,
  Snackbar,
  Alert,
  Divider,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  CalendarMonth as CalendarIcon,
} from '@mui/icons-material';
import DashboardLayout from '../../components/DashboardLayout';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const CATEGORIES = ['Sabzi', 'Dal/Kadhi', 'Rice', 'Roti/Paratha', 'Special Items'];

interface Recipe {
  id: number;
  name: string;
  description: string;
}

interface MenuItem {
  id?: number;
  recipe_id: number;
  recipe_name?: string;
  category: string;
  cost?: number;
}

interface DayMenu {
  [key: string]: MenuItem[];
}

interface WeeklyMenu {
  id?: number;
  week_start_date: string;
  name: string;
  description: string;
  total_cost?: number;
}

export default function WeeklyMenuBuilderContent() {
  const [weekStartDate, setWeekStartDate] = useState('');
  const [menuName, setMenuName] = useState('');
  const [menuDescription, setMenuDescription] = useState('');
  const [menuId, setMenuId] = useState<number | null>(null);
  const [dayMenus, setDayMenus] = useState<DayMenu>({
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
  });
  
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoadingRecipes, setIsLoadingRecipes] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  useEffect(() => {
    fetchRecipes();
    setDefaultWeekStartDate();
  }, []);

  const setDefaultWeekStartDate = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(today);
    monday.setDate(today.getDate() + diff);
    setWeekStartDate(monday.toISOString().split('T')[0]);
  };

  const fetchRecipes = async () => {
    setIsLoadingRecipes(true);
    try {
      const response = await fetch(`${API_URL}/api/recipes`);
      const result = await response.json();
      
      if (result.success) {
        setRecipes(result.data);
      } else {
        showSnackbar(result.error || 'Failed to load recipes', 'error');
      }
    } catch (error) {
      console.error('Error fetching recipes:', error);
      showSnackbar('Failed to load recipes', 'error');
    } finally {
      setIsLoadingRecipes(false);
    }
  };

  const openAddItemDialog = (day: string, category: string) => {
    setSelectedDay(day);
    setSelectedCategory(category);
    setDialogOpen(true);
  };

  const addItemToDay = (recipe: Recipe) => {
    const newItem: MenuItem = {
      recipe_id: recipe.id,
      recipe_name: recipe.name,
      category: selectedCategory,
    };

    setDayMenus((prev) => ({
      ...prev,
      [selectedDay]: [...prev[selectedDay], newItem],
    }));

    setDialogOpen(false);
    showSnackbar(`Added ${recipe.name} to ${selectedDay}`, 'success');
  };

  const removeItemFromDay = (day: string, index: number) => {
    setDayMenus((prev) => ({
      ...prev,
      [day]: prev[day].filter((_, i) => i !== index),
    }));
    showSnackbar('Item removed', 'success');
  };

  const calculateTotalCost = () => {
    let total = 0;
    Object.values(dayMenus).forEach((items) => {
      items.forEach((item) => {
        if (item.cost) {
          total += item.cost;
        }
      });
    });
    return total;
  };

  const saveMenu = async () => {
    if (!weekStartDate) {
      showSnackbar('Please select a week start date', 'error');
      return;
    }

    if (!menuName) {
      showSnackbar('Please enter a menu name', 'error');
      return;
    }

    // Check if any day has items
    const hasItems = Object.values(dayMenus).some((items) => items.length > 0);
    if (!hasItems) {
      showSnackbar('Please add at least one item to the menu', 'error');
      return;
    }

    setIsSaving(true);

    try {
      // Step 1: Create or update menu
      let currentMenuId = menuId;
      
      if (!currentMenuId) {
        const menuResponse = await fetch(`${API_URL}/api/weekly-menus`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            weekStartDate,
            name: menuName,
            description: menuDescription,
          }),
        });

        const menuResult = await menuResponse.json();

        if (!menuResult.success) {
          throw new Error(menuResult.error || 'Failed to create menu');
        }

        currentMenuId = menuResult.data.id;
        setMenuId(currentMenuId);
      } else {
        // Update existing menu
        await fetch(`${API_URL}/api/weekly-menus/${currentMenuId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: menuName,
            description: menuDescription,
            totalCost: calculateTotalCost(),
          }),
        });
      }

      // Step 2: Add items
      const items: any[] = [];
      Object.entries(dayMenus).forEach(([day, dayItems]) => {
        dayItems.forEach((item, index) => {
          items.push({
            dayOfWeek: day,
            recipeId: item.recipe_id,
            category: item.category,
            displayOrder: index,
            cost: item.cost || null,
          });
        });
      });

      if (items.length > 0) {
        const itemsResponse = await fetch(`${API_URL}/api/weekly-menus/${currentMenuId}/items`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items }),
        });

        const itemsResult = await itemsResponse.json();

        if (!itemsResult.success) {
          throw new Error(itemsResult.error || 'Failed to add items');
        }
      }

      showSnackbar('Menu saved successfully', 'success');
    } catch (error: any) {
      console.error('Error saving menu:', error);
      showSnackbar(error.message || 'Failed to save menu', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const getItemsByCategory = (day: string, category: string) => {
    return dayMenus[day].filter((item) => item.category === category);
  };

  return (
    <DashboardLayout>
      {/* Fixed Navigation */}
      <Box sx={{ position: 'sticky', top: 0, zIndex: 10, bgcolor: 'background.default', py: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Weekly Menu Builder
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="outlined" href="/weekly-menu">
              Manage Images
            </Button>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={saveMenu}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Menu'}
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Menu Metadata */}
      <Card sx={{ mt: 3, mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Menu Information
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                label="Week Start Date (Monday)"
                type="date"
                value={weekStartDate}
                onChange={(e) => setWeekStartDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                label="Menu Name"
                value={menuName}
                onChange={(e) => setMenuName(e.target.value)}
                placeholder="e.g., Diwali Special Week"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                label="Description (Optional)"
                value={menuDescription}
                onChange={(e) => setMenuDescription(e.target.value)}
                placeholder="e.g., Festive menu with special items"
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* 6-Day Menu Builder */}
      <Grid container spacing={2}>
        {DAYS.map((day) => (
          <Grid size={12} md={6} key={day}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {day}
                  </Typography>
                  <Chip
                    label={`${dayMenus[day].length} items`}
                    size="small"
                    color={dayMenus[day].length > 0 ? 'primary' : 'default'}
                  />
                </Box>
                <Divider sx={{ mb: 2 }} />

                {/* Categories */}
                {CATEGORIES.map((category) => {
                  const items = getItemsByCategory(day, category);
                  return (
                    <Box key={category} sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          {category}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => openAddItemDialog(day, category)}
                          color="primary"
                        >
                          <AddIcon fontSize="small" />
                        </IconButton>
                      </Box>

                      {items.length > 0 ? (
                        <Box sx={{ pl: 2 }}>
                          {items.map((item, index) => (
                            <Box
                              key={index}
                              sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                py: 0.5,
                              }}
                            >
                              <Typography variant="body2">{item.recipe_name}</Typography>
                              <IconButton
                                size="small"
                                onClick={() => {
                                  const itemIndex = dayMenus[day].findIndex(
                                    (i) => i.recipe_id === item.recipe_id && i.category === category
                                  );
                                  removeItemFromDay(day, itemIndex);
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          ))}
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ pl: 2, fontStyle: 'italic' }}>
                          No items added
                        </Typography>
                      )}
                    </Box>
                  );
                })}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Add Item Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Add Item to {selectedDay} - {selectedCategory}
        </DialogTitle>
        <DialogContent>
          {isLoadingRecipes ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              Loading recipes...
            </Box>
          ) : recipes.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
              No recipes found. Create a recipe first.
            </Typography>
          ) : (
            <List>
              {recipes.map((recipe) => (
                <ListItem key={recipe.id} disablePadding>
                  <ListItemButton onClick={() => addItemToDay(recipe)}>
                    <ListItemText
                      primary={recipe.name}
                      secondary={recipe.description}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </DashboardLayout>
  );
}
