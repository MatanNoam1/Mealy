import api from './api';

// GET /api/mealplan -> current user's saved meal plans
export const getMealPlans = () => api.get('/mealplan');
// PATCH /api/mealplan/:id -> rename a plan
export const renameMealPlan = (id, title) => api.patch(`/mealplan/${id}`, { title });
// DELETE /api/mealplan/:id
export const deleteMealPlan = (id) => api.delete(`/mealplan/${id}`);
