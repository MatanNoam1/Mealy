const { users } = require('../models/users.model');

// Helpers for the shared { success, data, error } response shape.
const ok = (res, data, status = 200) =>
  res.status(status).json({ success: true, data, error: null });

const fail = (res, status, code, message, details = {}) =>
  res.status(status).json({ success: false, data: null, error: { code, message, details } });

// Validates the body and returns a mock user id and token (no real account is
// created in this in-memory backend).
exports.register = (req, res) => {
  const { firstName, lastName, email, password, preferences } = req.body;
  if (!firstName || !lastName || !email || !password)
    return fail(res, 400, 'VALIDATION_ERROR', 'firstName, lastName, email, and password are required.');
  ok(res, { userId: 42, token: 'mock-jwt-token-abc123' }, 201);
};

exports.login = (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return fail(res, 400, 'VALIDATION_ERROR', 'email and password are required.');
  // Mock auth: match the user by email so the correct profile loads, and
  // fall back to user 1 for unknown emails so demo logins still work.
  const matched = users.find((u) => u.email === email);
  const userId = matched ? matched.userId : 1;
  ok(res, { userId, token: 'mock-jwt-token-abc123' });
};

exports.logout = (req, res) => {
  ok(res, { message: 'Logged out.' });
};
