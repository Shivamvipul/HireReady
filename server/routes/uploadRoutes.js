const router = require('express').Router();
const c = require('../controllers/uploadController');
const auth = require('../middleware/auth');
const { photoUpload, resumeUpload } = require('../middleware/upload');

router.use(auth);
router.post('/photo', photoUpload, c.photo);
router.post('/resume-text', resumeUpload, c.resumeText);

module.exports = router;
