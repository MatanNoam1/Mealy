// Role gate: blocks the request with 403 unless x-user-role is one of the
// allowed roles. Used on admin/manager-only endpoints.
const allowRoles = (...roles) => (req, res, next) => {
  const role = req.headers['x-user-role'];
  if (!roles.includes(role)) {
    return res.status(403).json({
      success: false,
      data: null,
      error: {
        code: 'FORBIDDEN',
        message: 'You do not have permission to perform this action.',
        details: {}
      }
    });
  }
  next();
};

module.exports = { allowRoles };
