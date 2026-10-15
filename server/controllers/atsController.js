const AtsReport = require('../models/AtsReport');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { ok } = require('../utils/response');
const { cleanText } = require('../utils/sanitize');
const { parseResumeFile } = require('../services/parserService');
const rules = require('../services/atsRules');
const { callJSON } = require('../services/aiService');
const prompt = require('../prompts/ats');

exports.analyze = asyncHandler(async (req, res) => {
  let text = '';
  let fileName = 'Pasted text';
  let meta = {};

  if (req.file) {
    const parsed = await parseResumeFile(req.file);
    text = parsed.text; meta = parsed.meta; fileName = req.file.originalname;
  } else {
    text = cleanText(req.body.resumeText || '');
    if (req.body.fileName) fileName = String(req.body.fileName).slice(0, 120);
    // Pasted text uploaded earlier carries its parse flags.
    try { meta = req.body.meta ? JSON.parse(req.body.meta) : {}; } catch { meta = {}; }
  }
  if (text.length < 80) throw new AppError('Add your resume (upload a file or paste at least a few lines).', 422);

  const jobRole = cleanText(req.body.jobRole || '', 120);
  const jobDescription = cleanText(req.body.jobDescription || '', 6000);

  const ruleResult = rules.run(text, meta);
  const ai = await callJSON({
    system: prompt.system,
    user: prompt.buildUser({ text, jobRole, jobDescription, rules: ruleResult }),
    schema: prompt.schema,
    maxTokens: 4500,
  });

  const result = {
    ...ai,
    ai_score: ai.overall_score,
    rule_score: ruleResult.score,
    overall_score: Math.round(ai.overall_score * 0.65 + ruleResult.score * 0.35),
    rule_checks: ruleResult.checks.map(({ weight, ...c }) => c),
    stats: ruleResult.stats,
    job_match_percent: jobDescription || jobRole ? ai.job_match_percent : null,
  };

  const report = await AtsReport.create({
    userId: req.user.id, fileName, resumeText: text, jobRole, jobDescription, result,
  });
  ok(res, report, 'Analysis complete', 201);
});

exports.history = asyncHandler(async (req, res) => {
  const items = await AtsReport.find({ userId: req.user.id })
    .sort({ createdAt: -1 }).limit(50)
    .select('fileName jobRole createdAt result.overall_score result.job_match_percent');
  ok(res, items);
});

exports.getOne = asyncHandler(async (req, res) => {
  const r = await AtsReport.findOne({ _id: req.params.id, userId: req.user.id });
  if (!r) throw new AppError('Report not found.', 404);
  ok(res, r);
});

exports.remove = asyncHandler(async (req, res) => {
  const r = await AtsReport.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
  if (!r) throw new AppError('Report not found.', 404);
  ok(res, null, 'Report deleted');
});
