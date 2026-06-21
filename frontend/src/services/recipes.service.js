import api from './api';

// Recipe browsing
export const getRecipes = () => api.get('/recipes');           // all (admin view)
export const getMyRecipes = () => api.get('/recipes/mine');     // current user's own
export const getSharedRecipes = () => api.get('/recipes/shared'); // shared with me
export const getRecipe = (id) => api.get(`/recipes/${id}`);

// Recipe CRUD (scoped to the current user on the backend)
export const createRecipe = (recipe) => api.post('/recipes', recipe);
export const updateRecipe = (id, recipe) => api.put(`/recipes/${id}`, recipe);
export const deleteRecipe = (id) => api.delete(`/recipes/${id}`);

// Sharing (many-to-many)
export const shareRecipe = (id, email) => api.post(`/recipes/${id}/share`, { email });
export const unshareRecipe = (id, userId) => api.delete(`/recipes/${id}/share/${userId}`);
export const removeSharedRecipe = (id) => api.delete(`/recipes/${id}/share/me`);
