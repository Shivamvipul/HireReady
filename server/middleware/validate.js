const { validationResult } = require('express-validator');
const AppError = require('../utils/AppError');

module.exports = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();
  const list = errors.array().map((e) => ({ field: e.path, message: e.msg }));
  next(new AppError(list[0].message, 422, list));
};
