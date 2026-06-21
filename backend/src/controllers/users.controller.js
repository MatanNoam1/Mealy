const bcrypt = require('bcryptjs');
const db = require('../../models');
const { ok, fail, parseId, currentUserId } = require('../utils/respond');
const { userPublic } = require('../utils/serialize');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

exports.getAll = async (req, res) => {
  const users = await db.User.findAll({ order: [['id', 'ASC']] });
  ok(res, users.map(userPublic));
};

// Current user, identified by the x-user-id header.
exports.getMe = async (req, res) => {
  const user = await db.User.findByPk(currentUserId(req));
  if (!user) return fail(res, 404, 'NOT_FOUND', 'User not found.');
  ok(res, userPublic(user));
};

// Self-update of own profile. No role gate (separate from admin PUT /users/:id).
exports.updateMe = async (req, res) => {
  const user = await db.User.findByPk(currentUserId(req));
  if (!user) return fail(res, 404, 'NOT_FOUND', 'User not found.');

  const { firstName, lastName, email, dietaryPreferences, theme } = req.body;
  if (!firstName) return fail(res, 400, 'VALIDATION_ERROR', 'Missing required field: firstName', { field: 'firstName' });
  if (email !== undefined && email !== '' && !EMAIL_RE.test(email))
    return fail(res, 400, 'VALIDATION_ERROR', 'Invalid email format.', { field: 'email' });
  if (theme !== undefined && !['light', 'dark'].includes(theme))
    return fail(res, 400, 'VALIDATION_ERROR', 'Theme must be "light" or "dark".', { field: 'theme' });

  user.firstName = firstName;
  if (lastName !== undefined) user.lastName = lastName;
  if (email !== undefined) user.email = email;
  if (dietaryPreferences !== undefined) user.dietaryPreferences = dietaryPreferences;
  if (theme !== undefined) user.theme = theme;
  await user.save();
  ok(res, userPublic(user));
};

exports.getById = async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return fail(res, 400, 'VALIDATION_ERROR', 'Invalid id param.', { param: 'id' });
  const user = await db.User.findByPk(id);
  if (!user) return fail(res, 404, 'NOT_FOUND', 'User not found.');
  ok(res, userPublic(user));
};

// Admin/manager: create a user. A password is required to hash an account.
exports.create = async (req, res) => {
  const { firstName, lastName, userRole, email, password, dietaryPreferences } = req.body;
  const missing = ['firstName', 'lastName', 'userRole', 'email', 'password'].find((f) => !req.body[f]);
  if (missing) return fail(res, 400, 'VALIDATION_ERROR', `Missing required field: ${missing}`, { field: missing });

  const existing = await db.User.findOne({ where: { email } });
  if (existing) return fail(res, 409, 'EMAIL_TAKEN', 'An account with this email already exists.', { field: 'email' });

  const user = await db.User.create({
    firstName, lastName, email,
    passwordHash: bcrypt.hashSync(password, 10),
    dietaryPreferences: dietaryPreferences || [],
    userRole
  });
  ok(res, { userId: user.id }, 201);
};

// Admin/manager: replace another user's core fields.
exports.update = async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return fail(res, 400, 'VALIDATION_ERROR', 'Invalid id param.', { param: 'id' });
  const user = await db.User.findByPk(id);
  if (!user) return fail(res, 404, 'NOT_FOUND', 'User not found.');
  const missing = ['firstName', 'lastName', 'userRole'].find((f) => !req.body[f]);
  if (missing) return fail(res, 400, 'VALIDATION_ERROR', `Missing required field: ${missing}`, { field: missing });

  user.firstName = req.body.firstName;
  user.lastName = req.body.lastName;
  user.userRole = req.body.userRole;
  if (req.body.email !== undefined) user.email = req.body.email;
  if (req.body.dietaryPreferences !== undefined) user.dietaryPreferences = req.body.dietaryPreferences;
  await user.save();
  ok(res, { userId: user.id });
};

exports.updatePreferences = async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return fail(res, 400, 'VALIDATION_ERROR', 'Invalid id param.', { param: 'id' });
  const user = await db.User.findByPk(id);
  if (!user) return fail(res, 404, 'NOT_FOUND', 'User not found.');
  if (req.body.dietaryPreferences === undefined)
    return fail(res, 400, 'VALIDATION_ERROR', 'Missing required field: dietaryPreferences', { field: 'dietaryPreferences' });
  user.dietaryPreferences = req.body.dietaryPreferences;
  await user.save();
  ok(res, { userId: user.id });
};

// Admin only: delete a user.
exports.remove = async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return fail(res, 400, 'VALIDATION_ERROR', 'Invalid id param.', { param: 'id' });
  const user = await db.User.findByPk(id);
  if (!user) return fail(res, 404, 'NOT_FOUND', 'User not found.');
  await user.destroy();
  ok(res, { userId: id });
};
