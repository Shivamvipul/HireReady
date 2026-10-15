const { ZodError } = require('zod');
const multer = require('multer');
const env = require('../config/env');

exports.notFound = (req, res) =>
  res.status(404).json({ success: false, data: null, message: `Route not found: ${req.method} ${req.originalUrl}` });

// eslint-disable-next-line no-unused-vars
exports.errorHandler = (err, req, res, next) => {
  let status = err.status || 500;
  let message = err.message || 'Something went wrong.';

  if (err instanceof ZodError) { status = 422; message = 'Some fields are invalid.'; }
  else if (err instanceof multer.MulterError) {
    status = 400;
    message = err.code === 'LIMIT_FILE_SIZE' ? 'File is too large. The limit is 5 MB (1 MB for photos).' : err.message;
  } else if (err.name === 'CastError') { status = 400; message = 'Invalid id.'; }
  else if (err.name === 'ValidationError') { status = 422; message = err.message; }
  else if (err.code === 11000) { status = 409; message = 'That value is already in use.'; }

  if (status >= 500) console.error(err);
  res.status(status).json({
    success: false,
    data: err.details || null,
    message: status >= 500 && env.isProd ? 'Something went wrong on our side. Please try again.' : message,
  });
};
