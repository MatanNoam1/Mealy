const { users, getNextId } = require('../models/users.model');

const ok = (res, data, status = 200) =>
  res.status(status).json({ success: true, data, error: null });

const fail = (res, status, code, message, details = {}) =>
  res.status(status).json({ success: false, data: null, error: { code, message, details } });

const parseId = (raw) => {
  const n = parseInt(raw, 10);
  return isNaN(n) ? null : n;
};

const validateRequired = (body, fields) => fields.find(f => !body[f]);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

exports.getAll = (req, res) => ok(res, users);

// Current logged-in user. Auth is mock, so the client sends the id it got at
// login via the x-user-id header. Defaults to user 1 when the header is absent.
exports.getMe = (req, res) => {
  const id = parseId(req.headers['x-user-id']) || 1;
  const user = users.find(u => u.userId === id);
  if (!user) return fail(res, 404, 'NOT_FOUND', 'User not found.');
  ok(res, user);
};

// Self-update: the logged-in user changes their OWN details. Identified by the
// x-user-id header (default 1), with NO role restriction -- any authenticated
// user can edit their own profile. This is distinct from PUT /users/:id, which
// is an admin/manager user-management endpoint.
exports.updateMe = (req, res) => {
  const id = parseId(req.headers['x-user-id']) || 1;
  const user = users.find(u => u.userId === id);
  if (!user) return fail(res, 404, 'NOT_FOUND', 'User not found.');

  const { firstName, lastName, email, dietaryPreferences, theme } = req.body;

  if (!firstName)
    return fail(res, 400, 'VALIDATION_ERROR', 'Missing required field: firstName', { field: 'firstName' });
  if (email !== undefined && email !== '' && !EMAIL_RE.test(email))
    return fail(res, 400, 'VALIDATION_ERROR', 'Invalid email format.', { field: 'email' });
  if (theme !== undefined && !['light', 'dark'].includes(theme))
    return fail(res, 400, 'VALIDATION_ERROR', 'Theme must be "light" or "dark".', { field: 'theme' });

  user.firstName = firstName;
  if (lastName !== undefined) user.lastName = lastName;
  if (email !== undefined) user.email = email;
  if (dietaryPreferences !== undefined) user.dietaryPreferences = dietaryPreferences;
  if (theme !== undefined) user.theme = theme;
  user.updateDate = new Date().toISOString();

  ok(res, user);
};

exports.getById = (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return fail(res, 400, 'VALIDATION_ERROR', 'Invalid id param.', { param: 'id' });
  const user = users.find(u => u.userId === id);
  if (!user) return fail(res, 404, 'NOT_FOUND', 'User not found.');
  ok(res, user);
};

exports.create = (req, res) => {
  const { firstName, lastName, userRole, email, dietaryPreferences } = req.body;
  const missing = validateRequired(req.body, ['firstName', 'lastName', 'userRole']);
  if (missing) return fail(res, 400, 'VALIDATION_ERROR', `Missing required field: ${missing}`, { field: missing });
  const now = new Date().toISOString();
  const user = {
    userId: getNextId(),
    firstName,
    lastName,
    email: email || '',
    dietaryPreferences: dietaryPreferences || [],
    createDate: now,
    updateDate: now,
    userRole
  };
  users.push(user);
  ok(res, { userId: user.userId }, 201);
};

exports.update = (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return fail(res, 400, 'VALIDATION_ERROR', 'Invalid id param.', { param: 'id' });
  const user = users.find(u => u.userId === id);
  if (!user) return fail(res, 404, 'NOT_FOUND', 'User not found.');
  const missing = validateRequired(req.body, ['firstName', 'lastName', 'userRole']);
  if (missing) return fail(res, 400, 'VALIDATION_ERROR', `Missing required field: ${missing}`, { field: missing });
  user.firstName = req.body.firstName;
  user.lastName = req.body.lastName;
  user.userRole = req.body.userRole;
  if (req.body.email !== undefined) user.email = req.body.email;
  if (req.body.dietaryPreferences !== undefined) user.dietaryPreferences = req.body.dietaryPreferences;
  user.updateDate = new Date().toISOString();
  ok(res, { userId: user.userId });
};

exports.updatePreferences = (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return fail(res, 400, 'VALIDATION_ERROR', 'Invalid id param.', { param: 'id' });
  const user = users.find(u => u.userId === id);
  if (!user) return fail(res, 404, 'NOT_FOUND', 'User not found.');
  if (req.body.dietaryPreferences === undefined)
    return fail(res, 400, 'VALIDATION_ERROR', 'Missing required field: dietaryPreferences', { field: 'dietaryPreferences' });
  user.dietaryPreferences = req.body.dietaryPreferences;
  user.updateDate = new Date().toISOString();
  ok(res, { userId: user.userId });
};

exports.remove = (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return fail(res, 400, 'VALIDATION_ERROR', 'Invalid id param.', { param: 'id' });
  const idx = users.findIndex(u => u.userId === id);
  if (idx === -1) return fail(res, 404, 'NOT_FOUND', 'User not found.');
  const [user] = users.splice(idx, 1);
  ok(res, { userId: user.userId });
};
