const db = require('../../models');
const { ok, fail, parseId, currentUserId, currentUserRole } = require('../utils/respond');
const { recipePublic } = require('../utils/serialize');

const ownerInclude = { model: db.User, as: 'owner', attributes: ['id', 'firstName', 'lastName'] };

// Emit a socket event to a specific user's room, if Socket.IO is wired up.
const emitToUser = (req, userId, event, payload) => {
  const io = req.app.get('io');
  if (io) io.to(`user:${userId}`).emit(event, payload);
};

const isPrivileged = (req) => ['admin', 'manager'].includes(currentUserRole(req));

// All recipes (admin/back-compat view).
exports.getAll = async (req, res) => {
  const recipes = await db.Recipe.findAll({ include: [ownerInclude], order: [['id', 'ASC']] });
  ok(res, recipes.map(recipePublic));
};

// Recipes owned by the current user (their dashboard).
exports.getMine = async (req, res) => {
  const recipes = await db.Recipe.findAll({
    where: { ownerId: currentUserId(req) },
    include: [ownerInclude],
    order: [['id', 'ASC']]
  });
  ok(res, recipes.map(recipePublic));
};

// Recipes shared WITH the current user (many-to-many JOIN through recipe_shares).
exports.getShared = async (req, res) => {
  const user = await db.User.findByPk(currentUserId(req), {
    include: [{ model: db.Recipe, as: 'sharedRecipes', include: [ownerInclude], through: { attributes: [] } }]
  });
  if (!user) return fail(res, 404, 'NOT_FOUND', 'User not found.');
  ok(res, (user.sharedRecipes || []).map(recipePublic));
};

exports.getById = async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return fail(res, 400, 'VALIDATION_ERROR', 'Invalid id param.', { param: 'id' });
  const recipe = await db.Recipe.findByPk(id, { include: [ownerInclude] });
  if (!recipe) return fail(res, 404, 'NOT_FOUND', 'Recipe not found.');
  ok(res, recipePublic(recipe));
};

// Create a recipe owned by the current user.
exports.create = async (req, res) => {
  const missing = ['title', 'instructions'].find((f) => !req.body[f]);
  if (missing) return fail(res, 400, 'VALIDATION_ERROR', `Missing required field: ${missing}`, { field: missing });

  const b = req.body;
  const recipe = await db.Recipe.create({
    ownerId: currentUserId(req),
    title: b.title,
    ingredients: b.ingredients || [],
    instructions: b.instructions,
    prepTime: b.prepTime || null,
    servings: b.servings || 1,
    mealTypes: Array.isArray(b.mealTypes) && b.mealTypes.length > 0
      ? b.mealTypes.filter((t) => ['breakfast', 'lunch', 'dinner', 'snack'].includes(t))
      : (['breakfast', 'lunch', 'dinner', 'snack'].includes(b.mealType) ? [b.mealType] : ['dinner']),
    isPublic: b.isPublic !== undefined ? !!b.isPublic : true,
    imageUrl: b.imageUrl || null,
    cuisineType: b.cuisineType || null,
    tags: b.tags || []
  });

  emitToUser(req, currentUserId(req), 'recipe:created', recipePublic(recipe));
  ok(res, recipePublic(recipe), 201);
};

// Partial update. Allowed for the owner, or admin/manager. Notifies users the
// recipe is shared with so their view refreshes.
exports.update = async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return fail(res, 400, 'VALIDATION_ERROR', 'Invalid id param.', { param: 'id' });
  const recipe = await db.Recipe.findByPk(id);
  if (!recipe) return fail(res, 404, 'NOT_FOUND', 'Recipe not found.');
  if (recipe.ownerId !== currentUserId(req) && !isPrivileged(req))
    return fail(res, 403, 'FORBIDDEN', 'You can only edit your own recipes.');

  const fields = ['title', 'ingredients', 'instructions', 'prepTime', 'servings', 'mealTypes', 'isPublic', 'imageUrl', 'cuisineType', 'tags'];
  fields.forEach((f) => { if (req.body[f] !== undefined) recipe[f] = req.body[f]; });
  await recipe.save();

  const withOwner = await db.Recipe.findByPk(id, { include: [ownerInclude] });
  const shares = await db.RecipeShare.findAll({ where: { recipeId: id } });
  shares.forEach((s) => emitToUser(req, s.sharedWithUserId, 'recipe:updated', recipePublic(withOwner)));
  ok(res, recipePublic(withOwner));
};

// Delete. Allowed for the owner, or admin. Notifies recipients it is gone.
exports.remove = async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return fail(res, 400, 'VALIDATION_ERROR', 'Invalid id param.', { param: 'id' });
  const recipe = await db.Recipe.findByPk(id);
  if (!recipe) return fail(res, 404, 'NOT_FOUND', 'Recipe not found.');
  if (recipe.ownerId !== currentUserId(req) && currentUserRole(req) !== 'admin')
    return fail(res, 403, 'FORBIDDEN', 'You can only delete your own recipes.');

  const shares = await db.RecipeShare.findAll({ where: { recipeId: id } });
  await recipe.destroy(); // cascades recipe_shares rows
  shares.forEach((s) => emitToUser(req, s.sharedWithUserId, 'recipe:unshared', { recipeId: id }));
  ok(res, { id });
};

// Share one of my recipes with another user, by email. Creates a junction row
// and pushes a live notification to that user.
exports.share = async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return fail(res, 400, 'VALIDATION_ERROR', 'Invalid id param.', { param: 'id' });
  const { email } = req.body;
  if (!email) return fail(res, 400, 'VALIDATION_ERROR', 'Missing required field: email', { field: 'email' });

  const recipe = await db.Recipe.findByPk(id, { include: [ownerInclude] });
  if (!recipe) return fail(res, 404, 'NOT_FOUND', 'Recipe not found.');
  if (recipe.ownerId !== currentUserId(req))
    return fail(res, 403, 'FORBIDDEN', 'You can only share your own recipes.');

  const target = await db.User.findOne({ where: { email } });
  if (!target) return fail(res, 404, 'USER_NOT_FOUND', 'No user with that email.', { field: 'email' });
  if (target.id === currentUserId(req))
    return fail(res, 400, 'VALIDATION_ERROR', 'You cannot share a recipe with yourself.');

  const [share, created] = await db.RecipeShare.findOrCreate({
    where: { recipeId: id, sharedWithUserId: target.id },
    defaults: { sharedByUserId: currentUserId(req) }
  });
  if (!created) return fail(res, 409, 'ALREADY_SHARED', 'Recipe is already shared with this user.');

  emitToUser(req, target.id, 'recipe:shared', recipePublic(recipe));
  ok(res, { recipeId: id, sharedWithUserId: target.id }, 201);
};

// Recipient removes a recipe shared with them (no owner required).
exports.removeSelf = async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return fail(res, 400, 'VALIDATION_ERROR', 'Invalid id param.');
  const userId = currentUserId(req);
  const count = await db.RecipeShare.destroy({ where: { recipeId: id, sharedWithUserId: userId } });
  if (count === 0) return fail(res, 404, 'NOT_FOUND', 'Share not found.');
  ok(res, { recipeId: id, removedBy: userId });
};

// Stop sharing a recipe with a user.
exports.unshare = async (req, res) => {
  const id = parseId(req.params.id);
  const targetId = parseId(req.params.userId);
  if (!id || !targetId) return fail(res, 400, 'VALIDATION_ERROR', 'Invalid id param.');

  const recipe = await db.Recipe.findByPk(id);
  if (!recipe) return fail(res, 404, 'NOT_FOUND', 'Recipe not found.');
  if (recipe.ownerId !== currentUserId(req))
    return fail(res, 403, 'FORBIDDEN', 'You can only unshare your own recipes.');

  const count = await db.RecipeShare.destroy({ where: { recipeId: id, sharedWithUserId: targetId } });
  if (count === 0) return fail(res, 404, 'NOT_FOUND', 'Share not found.');

  emitToUser(req, targetId, 'recipe:unshared', { recipeId: id });
  ok(res, { recipeId: id, unsharedFrom: targetId });
};
