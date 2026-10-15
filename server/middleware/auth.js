const AppError = require('../utils/AppError');
const { verifyAccess } = require('../utils/tokens');

module.exports = (req, res, next) => {
  const token = req.cookies?.accessToken;
  if (!token) return next(new AppError('Please sign in to continue.', 401));
  try {
    const payload = verifyAccess(token);
    if (!payload?.id) return next(new AppError('Please sign in to continue.', 401));
    req.user = { id: payload.id };
    next();
  } catch {
    next(new AppError('Your session expired. Please sign in again.', 401));
  }
};
