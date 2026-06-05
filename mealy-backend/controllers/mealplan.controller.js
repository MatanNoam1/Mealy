const { mealplans, getNextId } = require('../models/mealplans.model');
const { recipes } = require('../models/recipes.model');

// Helpers for the shared { success, data, error } response shape.
const ok = (res, data, status = 200) =>
  res.status(status).json({ success: true, data, error: null });

const fail = (res, status, code, message, details = {}) =>
  res.status(status).json({ success: false, data: null, error: { code, message, details } });

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const parseId = (raw) => {
  const n = parseInt(raw, 10);
  return isNaN(n) ? null : n;
};

exports.getAll = (req, res) => ok(res, mealplans);

exports.getById = (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return fail(res, 400, 'VALIDATION_ERROR', 'Invalid id param.', { param: 'id' });
  const plan = mealplans.find(p => p.id === id);
  if (!plan) return fail(res, 404, 'NOT_FOUND', 'Meal plan not found.');
  ok(res, plan);
};

// Builds a meal plan over the requested number of days. Walks the chosen
// recipes in order and repeats each one for as many days as it has servings,
// then saves and returns the new plan.
exports.generate = (req, res) => {
  const { days = 7, preferences = [], recipeIds = [] } = req.body;
  const id = getNextId();
  const start = new Date();
  const end = new Date(start);
  end.setDate(end.getDate() + days - 1);

  const queue = recipeIds.length > 0 ? [...recipeIds] : [1];
  const planData = [];
  let queueIndex = 0;
  let slotsLeft = 0;
  let currentRecipeId = null;
  let currentServings = 1;

  for (let i = 0; i < days; i++) {
    if (slotsLeft === 0) {
      currentRecipeId = queue[queueIndex % queue.length];
      queueIndex++;
      const recipe = recipes.find(r => r.id === currentRecipeId);
      currentServings = recipe ? recipe.servings : 1;
      slotsLeft = currentServings;
    }
    planData.push({
      day: DAY_NAMES[(start.getDay() + i) % 7],
      meals: [{ recipeId: currentRecipeId, mealType: 'dinner', servings: currentServings }]
    });
    slotsLeft--;
  }

  const plan = {
    id,
    userId: 1,
    planStartDate: start.toISOString().split('T')[0],
    planEndDate: end.toISOString().split('T')[0],
    planData,
    createdAt: new Date().toISOString()
  };
  mealplans.push(plan);
  ok(res, plan, 201);
};

// Replaces the meals for a single day inside an existing plan.
exports.updateDay = (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return fail(res, 400, 'VALIDATION_ERROR', 'Invalid id param.', { param: 'id' });
  const plan = mealplans.find(p => p.id === id);
  if (!plan) return fail(res, 404, 'NOT_FOUND', 'Meal plan not found.');

  const { day, meals } = req.body;
  if (!day)
    return fail(res, 400, 'VALIDATION_ERROR', 'Missing required field: day', { field: 'day' });
  if (!meals || !Array.isArray(meals) || meals.length === 0)
    return fail(res, 400, 'VALIDATION_ERROR', 'Missing required field: meals', { field: 'meals' });

  const dayEntry = plan.planData.find(d => d.day === day);
  if (!dayEntry)
    return fail(res, 404, 'NOT_FOUND', `Day "${day}" not found in this meal plan.`);

  dayEntry.meals = meals;
  ok(res, { id: plan.id });
};

// Stub: returns a fixed shopping list rather than computing it from the plan.
exports.generateShoppingList = (req, res) => {
  const { planId } = req.body;
  ok(res, {
    planId: planId || 1,
    items: [
      { name: 'Eggs', quantity: 8, unit: 'pcs' },
      { name: 'Tomatoes', quantity: 6, unit: 'pcs' },
      { name: 'Chicken breast', quantity: 800, unit: 'g' },
      { name: 'Olive oil', quantity: 1, unit: 'bottle' },
      { name: 'Spaghetti', quantity: 400, unit: 'g' }
    ]
  });
};

exports.remove = (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return fail(res, 400, 'VALIDATION_ERROR', 'Invalid id param.', { param: 'id' });
  const idx = mealplans.findIndex(p => p.id === id);
  if (idx === -1) return fail(res, 404, 'NOT_FOUND', 'Meal plan not found.');
  const [plan] = mealplans.splice(idx, 1);
  ok(res, { id: plan.id });
};
