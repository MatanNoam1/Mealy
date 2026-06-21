import api from './api';

// POST /api/ai/recommendations -> { recommendations: [...] }
export const getRecommendations = (dietaryPreferences) =>
  api.post('/ai/recommendations', { dietaryPreferences });

// POST /api/ai/mealplan -> { mealPlanId, plan, params }
export const generateMealPlan = ({ days, diversity, targetServings, mealTypes, name }) =>
  api.post('/ai/mealplan', { days, diversity, targetServings, mealTypes, name });

// POST /api/ai/recipe-scan (multipart image) -> parsed recipe object
export const scanRecipeImage = (file) => {
  const form = new FormData();
  form.append('image', file);
  return api.post('/ai/recipe-scan', form, { headers: { 'Content-Type': 'multipart/form-data' } });
};
