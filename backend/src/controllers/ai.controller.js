const db = require('../../models');
const ai = require('../services/ai.service');
const { ok, fail, currentUserId } = require('../utils/respond');

// Translate a thrown AI error into the standard envelope.
const aiError = (res, err) => {
  console.error('[ai]', err.message);
  if (err.code === 'AI_NOT_CONFIGURED')
    return fail(res, 503, 'AI_NOT_CONFIGURED', 'AI is not configured. Set GEMINI_API_KEY on the server.');
  return fail(res, 502, 'AI_ERROR', 'The AI service failed to produce a result.', { detail: err.message });
};

// Gather the recipes the user can plan from: their own + shared with them.
async function userRecipes(userId) {
  const own = await db.Recipe.findAll({ where: { ownerId: userId } });
  const user = await db.User.findByPk(userId, {
    include: [{ model: db.Recipe, as: 'sharedRecipes', through: { attributes: [] } }]
  });
  const shared = (user && user.sharedRecipes) || [];
  const map = new Map();
  [...own, ...shared].forEach((r) => map.set(r.id, r));
  return [...map.values()].map((r) => ({
    id: r.id, title: r.title, mealTypes: r.mealTypes || ['dinner'], servings: r.servings, ingredients: r.ingredients
  }));
}

// POST /api/ai/mealplan - generate, then persist as a MealPlan.
exports.mealplan = async (req, res) => {
  try {
    const days = Math.min(Math.max(parseInt(req.body.days, 10) || 7, 1), 14);
    const diversity = Math.min(Math.max(parseInt(req.body.diversity, 10) || 1, 1), 7);
    const customName = req.body.name && req.body.name.trim() ? req.body.name.trim() : null;
    const allowedTypes = Array.isArray(req.body.mealTypes) && req.body.mealTypes.length > 0
      ? req.body.mealTypes
      : ['breakfast', 'lunch', 'dinner'];

    const userId = currentUserId(req);
    const allRecipes = await userRecipes(userId);
    const recipes = allRecipes.filter((r) => allowedTypes.some((t) => (r.mealTypes || []).includes(t)));
    if (recipes.length === 0)
      return fail(res, 400, 'NO_RECIPES', 'No recipes found for the selected meal types. Add some recipes first.');

    const user = await db.User.findByPk(userId);
    const plan = await ai.generateMealPlan({
      days, diversity, allowedTypes,
      dietaryPreferences: (user && user.dietaryPreferences) || [],
      recipes
    });

    const recipeMap = new Map(recipes.map((r) => [r.id, r]));
    const rawDays = plan.days || plan;
    const normalizedDays = rawDays.map((dayEntry) => {
      const normalizedSlots = {};
      for (const [slot, meal] of Object.entries(dayEntry.slots || {})) {
        if (!meal) { normalizedSlots[slot] = null; continue; }
        const id = meal.recipeId ?? meal.id ?? (typeof meal === 'number' ? meal : null);
        if (!id) { normalizedSlots[slot] = null; continue; }
        const rec = recipeMap.get(id);
        normalizedSlots[slot] = {
          recipeId: id,
          title: meal.title || (rec && rec.title) || `Recipe #${id}`,
        };
      }
      return { day: dayEntry.day, slots: normalizedSlots };
    });

    // Aggregate scaled ingredients across all slots for meal-prep shopping list.
    const ingTotals = new Map(); // key: "name||unit" -> { name, unit, quantity }
    for (const dayEntry of normalizedDays) {
      for (const meal of Object.values(dayEntry.slots || {})) {
        if (!meal) continue;
        const rec = recipeMap.get(meal.recipeId);
        if (!rec || !rec.ingredients) continue;
        const scale = 1;
        for (const ing of rec.ingredients) {
          const key = `${ing.name}||${ing.unit || ''}`;
          const existing = ingTotals.get(key);
          const qty = (Number(ing.quantity) || 0) * scale;
          if (existing) existing.quantity += qty;
          else ingTotals.set(key, { name: ing.name, unit: ing.unit || '', quantity: qty });
        }
      }
    }
    const shoppingList = [...ingTotals.values()]
      .map((i) => ({ ...i, quantity: Math.round(i.quantity * 10) / 10 }))
      .sort((a, b) => a.name.localeCompare(b.name));

    const count = await db.MealPlan.count({ where: { userId } });
    const title = customName || `NewPlan No.${count + 1}`;

    const saved = await db.MealPlan.create({
      userId,
      title,
      planData: { days: normalizedDays, shoppingList }
    });
    ok(res, { mealPlanId: saved.id, plan: { days: normalizedDays, shoppingList }, params: { days, diversity } }, 201);
  } catch (err) {
    aiError(res, err);
  }
};

// POST /api/ai/recommendations
exports.recommendations = async (req, res) => {
  try {
    const userId = currentUserId(req);
    const user = await db.User.findByPk(userId);
    const own = await db.Recipe.findAll({ where: { ownerId: userId }, attributes: ['title'] });
    const data = await ai.recommendRecipes({
      dietaryPreferences: (req.body.dietaryPreferences) || (user && user.dietaryPreferences) || [],
      recipeTitles: own.map((r) => r.title)
    });
    ok(res, data);
  } catch (err) {
    aiError(res, err);
  }
};

// POST /api/ai/recipe-scan - multipart image upload -> parsed recipe (not saved;
// the frontend prefills the form so the user reviews before saving).
exports.recipeScan = async (req, res) => {
  try {
    if (!req.file) return fail(res, 400, 'VALIDATION_ERROR', 'An image file is required.', { field: 'image' });
    const base64 = req.file.buffer.toString('base64');
    const recipe = await ai.scanRecipeImage(base64, req.file.mimetype);
    ok(res, recipe);
  } catch (err) {
    aiError(res, err);
  }
};
