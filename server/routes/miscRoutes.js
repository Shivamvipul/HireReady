const router = require('express').Router();
const auth = require('../middleware/auth');
const { ok } = require('../utils/response');
const { templates, STYLES, LAYOUTS } = require('../utils/templateCatalog');
const { summary } = require('../controllers/dashboardController');

router.get('/templates', (req, res) => ok(res, { templates, styles: STYLES, layouts: LAYOUTS }));
router.get('/dashboard', auth, summary);
router.get('/health', (req, res) => ok(res, { status: 'up' }));

module.exports = router;
