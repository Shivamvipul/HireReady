const multer = require('multer');
const AppError = require('../utils/AppError');

const DOC_TYPES = {
  'application/pdf': 'pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/zip': 'docx',
  'application/x-zip-compressed': 'docx',
  'application/octet-stream': 'unknown',
};
const IMG_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const getFileNameExtension = (fileName = '') => fileName.split('.').pop()?.toLowerCase();

exports.detectFileKind = (buffer = Buffer.alloc(0), mimetype, fileName = '') => {
  if (!buffer || !buffer.length) return null;

  const ext = getFileNameExtension(fileName);
  const head = buffer.subarray(0, 8);
  const hex = head.toString('hex');
  const pdfHeader = head.toString('latin1');

  if (pdfHeader.startsWith('%PDF')) return 'pdf';
  if (hex.startsWith('504b0304') || hex.startsWith('504b0506') || hex.startsWith('504b0708')) return 'docx';

  if (mimetype === 'application/pdf' || ext === 'pdf') return 'pdf';
  if ((mimetype && DOC_TYPES[mimetype] === 'docx') || ['docx', 'zip'].includes(ext || '')) return 'docx';

  return null;
};

exports.resumeUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (req, file, cb) => {
    const ext = (file.originalname || '').split('.').pop()?.toLowerCase();
    const isPdf = file.mimetype === 'application/pdf' || ext === 'pdf';
    const isDocx = ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/zip', 'application/x-zip-compressed', 'application/octet-stream'].includes(file.mimetype) || ext === 'docx' || ext === 'zip';
    if (isPdf || isDocx) return cb(null, true);
    return cb(new AppError('Only PDF or DOCX files are allowed.', 415));
  },
}).single('file');

exports.photoUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 1024 * 1024, files: 1 },
  fileFilter: (req, file, cb) =>
    IMG_TYPES.includes(file.mimetype) ? cb(null, true) : cb(new AppError('Photo must be JPG, PNG or WebP.', 415)),
}).single('photo');

// Verify magic bytes so a renamed file cannot slip through.
exports.assertMagic = (buffer, mimetype, fileName = '') => {
  const kind = exports.detectFileKind(buffer, mimetype, fileName);
  if (!kind) throw new AppError('The file content does not match its type.', 415);

  if (kind === 'pdf') {
    if (!buffer.subarray(0, 4).toString('latin1').startsWith('%PDF')) {
      throw new AppError('The file content does not match its type.', 415);
    }
    return;
  }

  if (kind === 'docx') {
    const zipSig = buffer.subarray(0, 4).toString('hex');
    if (!zipSig.startsWith('504b')) {
      throw new AppError('The file content does not match its type.', 415);
    }
  }
};
exports.DOC_TYPES = DOC_TYPES;
