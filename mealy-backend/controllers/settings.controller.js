const { users } = require('../models/users.model');

const ok = (res, data, status = 200) =>
  res.status(status).json({ success: true, data, error: null });

const fail = (res, status, code, message, details = {}) =>
  res.status(status).json({ success: false, data: null, error: { code, message, details } });

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Settings belong to the current logged-in user. Auth is mock, so the client
// sends the id it received at login via the x-user-id header (defaults to 1).
const currentUser = (req) => {
  const id = parseInt(req.headers['x-user-id'], 10) || 1;
  return users.find((u) => u.userId === id);
};

const toSettings = (u) => ({
  userId: u.userId,
  firstName: u.firstName,
  lastName: u.lastName,
  email: u.email,
  theme: u.theme || 'light',
  dietaryPreferences: u.dietaryPreferences || []
});

exports.getSettings = (req, res) => {
  const user = currentUser(req);
  if (!user) return fail(res, 404, 'NOT_FOUND', 'User not found.');
  ok(res, toSettings(user));
};

exports.updateSettings = (req, res) => {
  const user = currentUser(req);
  if (!user) return fail(res, 404, 'NOT_FOUND', 'User not found.');

  const { firstName, email, theme, dietaryPreferences } = req.body;

  if (!firstName)
    return fail(res, 400, 'VALIDATION_ERROR', 'Missing required field: firstName', { field: 'firstName' });
  if (email !== undefined && email !== '' && !EMAIL_RE.test(email))
    return fail(res, 400, 'VALIDATION_ERROR', 'Invalid email format.', { field: 'email' });
  if (theme !== undefined && !['light', 'dark'].includes(theme))
    return fail(res, 400, 'VALIDATION_ERROR', 'Theme must be "light" or "dark".', { field: 'theme' });

  user.firstName = firstName;
  if (email !== undefined) user.email = email;
  if (theme !== undefined) user.theme = theme;
  if (dietaryPreferences !== undefined) user.dietaryPreferences = dietaryPreferences;
  user.updateDate = new Date().toISOString();

  ok(res, toSettings(user));
};
