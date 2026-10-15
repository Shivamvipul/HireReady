const router = require('express').Router();
const { body } = require('express-validator');
const c = require('../controllers/authController');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimit');

router.post('/register', authLimiter, [
  body('name').trim().isLength({ min: 2, max: 80 }).withMessage('Enter your name (2-80 characters).'),
  body('email').isEmail().withMessage('Enter a valid email address.').normalizeEmail(),
  body('password').isLength({ min: 8, max: 100 }).withMessage('Password must be at least 8 characters.'),
], validate, c.register);
router.post('/login', authLimiter, [
  body('email').isEmail().withMessage('Enter a valid email address.').normalizeEmail(),
  body('password').notEmpty().withMessage('Enter your password.'),
], validate, c.login);
router.post('/logout', c.logout);
router.post('/refresh', c.refresh);
router.post('/forgot-password', [body('email').isEmail().withMessage('Enter a valid email address.').normalizeEmail()], validate, c.forgotPassword);
router.post('/reset-password', [
  body('token').notEmpty().withMessage('Reset token is missing.'),
  body('password').isLength({ min: 8, max: 100 }).withMessage('Password must be at least 8 characters.'),
], validate, c.resetPassword);
router.get('/me', auth, c.me);
router.put('/me', auth, [body('name').trim().isLength({ min: 2, max: 80 }).withMessage('Enter your name (2-80 characters).')], validate, c.updateProfile);

module.exports = router;
