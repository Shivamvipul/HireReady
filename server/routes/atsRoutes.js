const router = require('express').Router();
const { param } = require('express-validator');
const c = require('../controllers/atsController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const { aiLimiter } = require('../middleware/rateLimit');
const { resumeUpload } = require('../middleware/upload');

router.use(auth);
router.post('/analyze', aiLimiter, resumeUpload, c.analyze);
router.get('/history', c.history);
router.get('/:id', [param('id').isMongoId().withMessage('Invalid id.')], validate, c.getOne);
router.delete('/:id', [param('id').isMongoId().withMessage('Invalid id.')], validate, c.remove);

module.exports = router;
