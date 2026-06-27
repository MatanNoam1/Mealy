const db = require('../../models');
const { ok, fail, currentUserId } = require('../utils/respond');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Public settings view of a user record.
const toSettings = (u) => ({
  userId: u.id,
  firstName: u.firstName,
  lastName: u.lastName,
  email: u.email,
  theme: u.theme || 'light',
  dietaryPreferences: u.dietaryPreferences || []
});

exports.getSettings = async (req, res) => {
  const user = await db.User.findByPk(currentUserId(req));
  if (!user) return fail(res, 404, 'NOT_FOUND', 'User not found.');
  ok(res, toSettings(user));
};

exports.updateSettings = async (req, res) => {
  const user = await db.User.findByPk(currentUserId(req));
  if (!user) return fail(res, 404, 'NOT_FOUND', 'User not found.');

  const { firstName, email, theme, dietaryPreferences } = req.body;
  if (!firstName) return fail(res, 400, 'VALIDATION_ERROR', 'Missing required field: firstName', { field: 'firstName' });
  if (email !== undefined && email !== '' && !EMAIL_RE.test(email))
    return fail(res, 400, 'VALIDATION_ERROR', 'Invalid email format.', { field: 'email' });
  if (theme !== undefined && !['light', 'dark'].includes(theme))
    return fail(res, 400, 'VALIDATION_ERROR', 'Theme must be "light" or "dark".', { field: 'theme' });

  user.firstName = firstName;
  if (email !== undefined) user.email = email;
  if (theme !== undefined) user.theme = theme;
  if (dietaryPreferences !== undefined) user.dietaryPreferences = dietaryPreferences;
  await user.save();
  ok(res, toSettings(user));
};
