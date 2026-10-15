const router = require('express').Router();
const { body, param } = require('express-validator');
const c = require('../controllers/resumeController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const { aiLimiter } = require('../middleware/rateLimit');

const id = [param('id').isMongoId().withMessage('Invalid id.')];

// Public share (no auth)
router.get('/public/:slug', [param('slug').isAlphanumeric().isLength({ min: 6, max: 20 })], validate, c.getPublic);

router.use(auth);
router.get('/', c.list);
router.post('/', [body('title').optional().isString().isLength({ max: 100 })], validate, c.create);
router.get('/:id', id, validate, c.getOne);
router.put('/:id', id, [body('title').optional().isString().isLength({ min: 1, max: 100 })], validate, c.update);
router.delete('/:id', id, validate, c.remove);
router.post('/:id/duplicate', id, validate, c.duplicate);
router.post('/:id/ai-improve', aiLimiter, id, [body('mode').optional().isIn(['improve', 'summary'])], validate, c.aiImprove);
router.post('/:id/download/:format', id, [param('format').isIn(['pdf', 'docx'])], validate, c.download);

module.exports = router;
