const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const db = require('../../models');
const { ok, fail } = require('../utils/respond');
const { userPublic } = require('../utils/serialize');

// Opaque session token. We are not using full JWT (out of scope) - the frontend
// identifies itself on later requests with the x-user-id / x-user-role headers.
const makeToken = () => crypto.randomBytes(24).toString('hex');

// Create a real account: hash the password and persist the user.
exports.register = async (req, res) => {
  const { firstName, lastName, email, password, dietaryPreferences } = req.body;
  if (!firstName || !lastName || !email || !password)
    return fail(res, 400, 'VALIDATION_ERROR', 'firstName, lastName, email, and password are required.');

  const existing = await db.User.findOne({ where: { email } });
  if (existing) return fail(res, 409, 'EMAIL_TAKEN', 'An account with this email already exists.', { field: 'email' });

  const user = await db.User.create({
    firstName,
    lastName,
    email,
    passwordHash: bcrypt.hashSync(password, 10),
    dietaryPreferences: Array.isArray(dietaryPreferences) ? dietaryPreferences : [],
    userRole: 'user'
  });

  ok(res, { userId: user.id, userRole: user.userRole, token: makeToken(), user: userPublic(user) }, 201);
};

// Verify email + password against the database.
exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return fail(res, 400, 'VALIDATION_ERROR', 'email and password are required.');

  const user = await db.User.findOne({ where: { email } });
  if (!user || !bcrypt.compareSync(password, user.passwordHash))
    return fail(res, 401, 'INVALID_CREDENTIALS', 'Invalid email or password.');

  ok(res, { userId: user.id, userRole: user.userRole, token: makeToken(), user: userPublic(user) });
};

exports.logout = (req, res) => ok(res, { message: 'Logged out.' });
