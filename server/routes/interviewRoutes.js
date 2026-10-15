const router = require('express').Router();
const { body, param } = require('express-validator');
const c = require('../controllers/interviewController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const { aiLimiter } = require('../middleware/rateLimit');

const id = [param('id').isMongoId().withMessage('Invalid id.')];

router.use(auth);
router.post('/generate', aiLimiter, [
  body('module').isIn(['technical', 'behavioral', 'project', 'company']).withMessage('Choose a valid module.'),
  body('role').trim().isLength({ min: 2, max: 120 }).withMessage('Enter the target role.'),
  body('company').optional({ values: 'falsy' }).trim().isLength({ max: 120 }),
  body('level').isIn(['Fresher', 'Junior', 'Mid', 'Senior']).withMessage('Choose a level.'),
  body('resumeId').optional({ values: 'falsy' }).isMongoId(),
], validate, c.generate);
router.post('/regenerate', aiLimiter, [
  body('setId').isMongoId().withMessage('Invalid set.'),
  body('questionId').isInt({ min: 1 }).withMessage('Invalid question.'),
], validate, c.regenerate);
router.post('/evaluate', aiLimiter, [
  body('question').trim().isLength({ min: 5, max: 1000 }),
  body('answer').trim().isLength({ min: 10, max: 4000 }).withMessage('Write a longer answer (at least a couple of sentences).'),
], validate, c.evaluate);
router.get('/history', c.history);
router.get('/:id', id, validate, c.getOne);
router.delete('/:id', id, validate, c.remove);
router.patch('/:id/bookmark', id, [body('questionId').isInt({ min: 1 })], validate, c.toggle);

module.exports = router;
