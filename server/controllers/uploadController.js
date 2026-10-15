const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { ok } = require('../utils/response');
const { parseResumeFile } = require('../services/parserService');
const { assertMagic } = require('../middleware/upload');

// Photos are cropped client-side to a small square, validated here and returned as a data URL.
exports.photo = asyncHandler(async (req, res) => {
  if (!req.file) throw new AppError('Choose an image to upload.', 400);
  assertMagic(req.file.buffer, req.file.mimetype);
  const url = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
  ok(res, { url }, 'Photo uploaded');
});

// Parse a PDF/DOCX into clean text (used by ATS, interview and LinkedIn forms).
exports.resumeText = asyncHandler(async (req, res) => {
  if (!req.file) throw new AppError('Choose a PDF or DOCX file.', 400);
  const { text, meta } = await parseResumeFile(req.file);
  ok(res, { text, fileName: req.file.originalname, meta }, 'File read');
});
