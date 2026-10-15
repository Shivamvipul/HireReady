const LinkedinReport = require('../models/LinkedinReport');
const Resume = require('../models/Resume');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { ok } = require('../utils/response');
const { cleanText, resumeToText } = require('../utils/sanitize');
const { callJSON } = require('../services/aiService');
const prompt = require('../prompts/linkedin');

exports.optimize = asyncHandler(async (req, res) => {
  const { linkedinUrl = '', targetRole = '', jobDescription = '', content = '', resumeId } = req.body;
  let text = cleanText(content);
  if (resumeId) {
    const r = await Resume.findOne({ _id: resumeId, userId: req.user.id });
    if (!r) throw new AppError('Saved resume not found.', 404);
    text = cleanText(`${text}\n\n${resumeToText(r.data)}`);
  }
  if (text.length < 80) throw new AppError('Paste your profile sections, upload the LinkedIn PDF export, or pick a saved resume.', 422);

  const out = await callJSON({
    system: prompt.system,
    user: prompt.buildUser({ url: linkedinUrl, role: cleanText(targetRole, 120), jd: cleanText(jobDescription, 6000), text }),
    schema: prompt.schema,
    maxTokens: 5000,
  });
  const report = await LinkedinReport.create({
    userId: req.user.id, linkedinUrl, targetRole, profileText: text, result: out,
  });
  ok(res, report, 'Profile analysis ready', 201);
});

exports.history = asyncHandler(async (req, res) => {
  const items = await LinkedinReport.find({ userId: req.user.id }).sort({ createdAt: -1 }).limit(50)
    .select('linkedinUrl targetRole createdAt result.profile_score');
  ok(res, items);
});

exports.getOne = asyncHandler(async (req, res) => {
  const r = await LinkedinReport.findOne({ _id: req.params.id, userId: req.user.id });
  if (!r) throw new AppError('Report not found.', 404);
  ok(res, r);
});

exports.remove = asyncHandler(async (req, res) => {
  const r = await LinkedinReport.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
  if (!r) throw new AppError('Report not found.', 404);
  ok(res, null, 'Report deleted');
});
