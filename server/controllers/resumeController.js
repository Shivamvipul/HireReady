const crypto = require('crypto');
const Resume = require('../models/Resume');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { ok } = require('../utils/response');
const { cleanText, resumeToText } = require('../utils/sanitize');
const { callJSON } = require('../services/aiService');
const { htmlToPdf } = require('../services/pdfService');
const { buildDocx } = require('../services/docxService');
const prompt = require('../prompts/resumeImprove');

const own = async (req) => {
  const r = await Resume.findOne({ _id: req.params.id, userId: req.user.id });
  if (!r) throw new AppError('Resume not found.', 404);
  return r;
};
const newSlug = () => crypto.randomBytes(5).toString('hex');
const FIELDS = ['title', 'templateId', 'data', 'settings', 'photoUrl'];

exports.list = asyncHandler(async (req, res) => {
  const items = await Resume.find({ userId: req.user.id }).sort({ updatedAt: -1 })
    .select('title templateId updatedAt isPublic slug data.contact.name data.contact.title');
  ok(res, items);
});

exports.create = asyncHandler(async (req, res) => {
  const body = {};
  FIELDS.forEach((f) => { if (req.body[f] !== undefined) body[f] = req.body[f]; });
  const r = await Resume.create({ ...body, userId: req.user.id });
  ok(res, r, 'Resume created', 201);
});

exports.getOne = asyncHandler(async (req, res) => ok(res, await own(req)));

exports.update = asyncHandler(async (req, res) => {
  const r = await own(req);
  FIELDS.forEach((f) => { if (req.body[f] !== undefined) r[f] = req.body[f]; });
  if (typeof req.body.isPublic === 'boolean') {
    r.isPublic = req.body.isPublic;
    if (r.isPublic && !r.slug) r.slug = newSlug();
  }
  r.markModified('data'); r.markModified('settings');
  await r.save();
  ok(res, r, 'Saved');
});

exports.remove = asyncHandler(async (req, res) => {
  const r = await own(req);
  await r.deleteOne();
  ok(res, null, 'Resume deleted');
});

exports.duplicate = asyncHandler(async (req, res) => {
  const r = await own(req);
  const copy = await Resume.create({
    userId: req.user.id, title: `${r.title} (copy)`.slice(0, 100), templateId: r.templateId,
    data: r.data, settings: r.settings, photoUrl: r.photoUrl,
  });
  ok(res, copy, 'Resume duplicated', 201);
});

exports.getPublic = asyncHandler(async (req, res) => {
  const r = await Resume.findOne({ slug: req.params.slug, isPublic: true }).select('title templateId data settings photoUrl');
  if (!r) throw new AppError('This resume is not available.', 404);
  ok(res, r);
});

exports.aiImprove = asyncHandler(async (req, res) => {
  const r = await own(req);
  const { section = 'general', text = '', mode = 'improve' } = req.body;
  if (mode === 'improve' && cleanText(text).length < 5) throw new AppError('Write something first, then use AI Improve.', 422);
  const out = await callJSON({
    system: prompt.system,
    user: prompt.buildUser({ mode, section, text: cleanText(text, 4000), context: resumeToText(r.data) }),
    schema: prompt.schema,
    maxTokens: 1500,
  });
  ok(res, out, 'Suggestion ready');
});

exports.download = asyncHandler(async (req, res) => {
  const r = await own(req);
  const format = req.params.format;
  const safeName = (r.title || 'resume').replace(/[^\w\- ]+/g, '').trim().replace(/\s+/g, '-') || 'resume';

  if (format === 'pdf') {
    const html = String(req.body.html || '');
    if (html.length < 50 || html.length > 3_000_000) throw new AppError('Nothing to export yet.', 422);
    const pdf = await htmlToPdf(html, r.title);
    res.set({ 'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename="${safeName}.pdf"` });
    return res.send(pdf);
  }
  if (format === 'docx') {
    const buf = await buildDocx(req.body.data ? { ...r.toObject(), data: req.body.data, settings: req.body.settings || r.settings } : r.toObject());
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename="${safeName}.docx"`,
    });
    return res.send(buf);
  }
  throw new AppError('Format must be pdf or docx.', 400);
});
