// Shared { success, data, error } response helpers + small request utilities,
// centralized so every controller returns the Assignment 2 envelope identically.

const ok = (res, data, status = 200) =>
  res.status(status).json({ success: true, data, error: null });

const fail = (res, status, code, message, details = {}) =>
  res.status(status).json({ success: false, data: null, error: { code, message, details } });

const parseId = (raw) => {
  const n = parseInt(raw, 10);
  return Number.isNaN(n) ? null : n;
};

// Current user id/role from the request headers (set by the frontend axios
// interceptor after login). Defaults to user 1 when absent so demo calls work.
const currentUserId = (req) => parseId(req.headers['x-user-id']) || 1;
const currentUserRole = (req) => req.headers['x-user-role'] || 'user';

module.exports = { ok, fail, parseId, currentUserId, currentUserRole };
