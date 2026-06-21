import api from './api';

// GET /api/recipes -> array of recipes (the dashboard's main data set)
export const getRecipes = () => api.get('/recipes');

// GET /api/recipes/:id -> single recipe
export const getRecipe = (id) => api.get(`/recipes/${id}`);
