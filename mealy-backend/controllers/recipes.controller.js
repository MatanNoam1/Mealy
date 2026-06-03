const { recipes, getNextId } = require('../models/recipes.model');

const ok = (res, data, status = 200) =>
  res.status(status).json({ success: true, data, error: null });

const fail = (res, status, code, message, details = {}) =>
  res.status(status).json({ success: false, data: null, error: { code, message, details } });

const parseId = (raw) => {
  const n = parseInt(raw, 10);
  return isNaN(n) ? null : n;
};

exports.getAll = (req, res) => ok(res, recipes);

exports.getById = (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return fail(res, 400, 'VALIDATION_ERROR', 'Invalid id param.', { param: 'id' });
  const recipe = recipes.find(r => r.id === id);
  if (!recipe) return fail(res, 404, 'NOT_FOUND', 'Recipe not found.');
  ok(res, recipe);
};

exports.create = (req, res) => {
  const { title, ingredients, instructions, prepTime, servings, isPublic, imageUrl, cuisineType, tags, userId } = req.body;
  const missing = ['title', 'instructions'].find(f => !req.body[f]);
  if (missing) return fail(res, 400, 'VALIDATION_ERROR', `Missing required field: ${missing}`, { field: missing });
  const recipe = {
    id: getNextId(),
    userId: userId || 1,
    title,
    ingredients: ingredients || [],
    instructions,
    prepTime: prepTime || 0,
    servings: servings || 1,
    isPublic: isPublic !== undefined ? isPublic : true,
    imageUrl: imageUrl || '',
    cuisineType: cuisineType || '',
    tags: tags || [],
    createDate: new Date().toISOString()
  };
  recipes.push(recipe);
  ok(res, { id: recipe.id }, 201);
};

exports.update = (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return fail(res, 400, 'VALIDATION_ERROR', 'Invalid id param.', { param: 'id' });
  const recipe = recipes.find(r => r.id === id);
  if (!recipe) return fail(res, 404, 'NOT_FOUND', 'Recipe not found.');
  const fields = ['title', 'ingredients', 'instructions', 'prepTime', 'servings', 'isPublic', 'imageUrl', 'cuisineType', 'tags'];
  fields.forEach(f => { if (req.body[f] !== undefined) recipe[f] = req.body[f]; });
  ok(res, { id: recipe.id });
};

exports.remove = (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return fail(res, 400, 'VALIDATION_ERROR', 'Invalid id param.', { param: 'id' });
  const idx = recipes.findIndex(r => r.id === id);
  if (idx === -1) return fail(res, 404, 'NOT_FOUND', 'Recipe not found.');
  const [recipe] = recipes.splice(idx, 1);
  ok(res, { id: recipe.id });
};

exports.scan = (req, res) => {
  ok(res, {
    id: 99,
    userId: 1,
    title: 'AI Detected: Avocado Toast',
    ingredients: [
      { name: 'Avocado', quantity: 1, unit: 'pcs' },
      { name: 'Bread', quantity: 2, unit: 'slices' },
      { name: 'Salt', quantity: 1, unit: 'pinch' }
    ],
    instructions: 'Mash avocado, spread on toasted bread, season with salt and pepper.',
    prepTime: 5,
    servings: 1,
    isPublic: true,
    imageUrl: req.body.imageUrl || '',
    cuisineType: 'Modern',
    tags: ['vegan', 'quick'],
    createDate: new Date().toISOString()
  }, 201);
};
