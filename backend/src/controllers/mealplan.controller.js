const db = require('../../models');
const { ok, fail, parseId, currentUserId, currentUserRole } = require('../utils/respond');

// Meal plans belonging to the current user.
exports.getAll = async (req, res) => {
  const plans = await db.MealPlan.findAll({ where: { userId: currentUserId(req) }, order: [['id', 'DESC']] });
  ok(res, plans);
};

exports.getById = async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return fail(res, 400, 'VALIDATION_ERROR', 'Invalid id param.', { param: 'id' });
  const plan = await db.MealPlan.findByPk(id);
  if (!plan) return fail(res, 404, 'NOT_FOUND', 'Meal plan not found.');
  ok(res, plan);
};

// Persist a meal plan (used to save a plan the user assembled or tweaked).
exports.create = async (req, res) => {
  const { title, planStartDate, planEndDate, planData } = req.body;
  if (!Array.isArray(planData))
    return fail(res, 400, 'VALIDATION_ERROR', 'planData (array) is required.', { field: 'planData' });
  const plan = await db.MealPlan.create({
    userId: currentUserId(req),
    title: title || 'Meal Plan',
    planStartDate: planStartDate || null,
    planEndDate: planEndDate || null,
    planData
  });
  ok(res, plan, 201);
};

// Replace the meals for a single day inside a plan.
exports.updateDay = async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return fail(res, 400, 'VALIDATION_ERROR', 'Invalid id param.', { param: 'id' });
  const plan = await db.MealPlan.findByPk(id);
  if (!plan) return fail(res, 404, 'NOT_FOUND', 'Meal plan not found.');
  if (plan.userId !== currentUserId(req) && !['admin', 'manager'].includes(currentUserRole(req)))
    return fail(res, 403, 'FORBIDDEN', 'You can only edit your own meal plans.');

  const { day, meals } = req.body;
  if (!day) return fail(res, 400, 'VALIDATION_ERROR', 'Missing required field: day', { field: 'day' });
  if (!Array.isArray(meals) || meals.length === 0)
    return fail(res, 400, 'VALIDATION_ERROR', 'Missing required field: meals', { field: 'meals' });

  const data = plan.planData || [];
  const entry = data.find((d) => d.day === day);
  if (!entry) return fail(res, 404, 'NOT_FOUND', `Day "${day}" not found in this meal plan.`);
  entry.meals = meals;
  plan.changed('planData', true); // JSON in-place mutation flag
  await plan.save();
  ok(res, { id: plan.id });
};

exports.patch = async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return fail(res, 400, 'VALIDATION_ERROR', 'Invalid id param.', { param: 'id' });
  const plan = await db.MealPlan.findByPk(id);
  if (!plan) return fail(res, 404, 'NOT_FOUND', 'Meal plan not found.');
  if (plan.userId !== currentUserId(req) && !['admin', 'manager'].includes(currentUserRole(req)))
    return fail(res, 403, 'FORBIDDEN', 'You can only edit your own meal plans.');
  if (req.body.title !== undefined) plan.title = req.body.title;
  await plan.save();
  ok(res, { id: plan.id, title: plan.title });
};

exports.remove = async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return fail(res, 400, 'VALIDATION_ERROR', 'Invalid id param.', { param: 'id' });
  const plan = await db.MealPlan.findByPk(id);
  if (!plan) return fail(res, 404, 'NOT_FOUND', 'Meal plan not found.');
  if (plan.userId !== currentUserId(req) && currentUserRole(req) !== 'admin')
    return fail(res, 403, 'FORBIDDEN', 'You can only delete your own meal plans.');
  await plan.destroy();
  ok(res, { id });
};
