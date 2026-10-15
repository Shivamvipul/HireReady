const rateLimit = require('express-rate-limit');

const json = (message) => (req, res) => res.status(429).json({ success: false, data: null, message });

exports.apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 600,
  standardHeaders: true,
  legacyHeaders: false,
  handler: json('Too many requests. Please slow down.'),
});

exports.authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  handler: json('Too many attempts. Try again in a few minutes.'),
});

// 20 AI calls per hour per user (must run after auth).
exports.aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => `user:${req.user?.id || 'anon'}`,
  handler: json('You have reached the limit of 20 AI requests per hour. Try again later.'),
});
