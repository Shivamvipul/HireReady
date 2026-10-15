const router = require('express').Router();
const { body, param } = require('express-validator');
const c = require('../controllers/linkedinController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const { aiLimiter } = require('../middleware/rateLimit');

const id = [param('id').isMongoId().withMessage('Invalid id.')];

router.use(auth);
router.post('/optimize', aiLimiter, [
  body('linkedinUrl').optional({ values: 'falsy' }).trim()
    .matches(/^https?:\/\/([a-z]{2,3}\.)?linkedin\.com\/in\/[\w\-%.]+\/?(\?.*)?$/i)
    .withMessage('Enter a LinkedIn profile URL like https://www.linkedin.com/in/your-name'),
  body('targetRole').optional({ values: 'falsy' }).isLength({ max: 120 }),
  body('resumeId').optional({ values: 'falsy' }).isMongoId(),
], validate, c.optimize);
router.get('/history', c.history);
router.get('/:id', id, validate, c.getOne);
router.delete('/:id', id, validate, c.remove);

module.exports = router;
