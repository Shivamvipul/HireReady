const InterviewSet = require('../models/InterviewSet');
const Resume = require('../models/Resume');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { ok } = require('../utils/response');
const { cleanText, resumeToText } = require('../utils/sanitize');
const { callJSON } = require('../services/aiService');
const p = require('../prompts/interview');

const loadResumeText = async (userId, { resumeId, resumeText }) => {
  if (resumeId) {
    const r = await Resume.findOne({ _id: resumeId, userId });
    if (!r) throw new AppError('Saved resume not found.', 404);
    return resumeToText(r.data);
  }
  return cleanText(resumeText || '');
};

exports.generate = asyncHandler(async (req, res) => {
  const { module, role, company = '', level } = req.body;
  const text = await loadResumeText(req.user.id, req.body);
  const out = await callJSON({
    system: p.system,
    user: p.buildUser({ module, role: cleanText(role, 120), company: cleanText(company, 120), level, text }),
    schema: p.schema,
    maxTokens: 7000,
  });
  const questions = out.questions.map((q, i) => ({ ...q, id: i + 1 }));
  const set = await InterviewSet.create({
    userId: req.user.id, role, company, level, module, resumeText: text, questions,
  });
  ok(res, set, 'Questions ready', 201);
});

exports.regenerate = asyncHandler(async (req, res) => {
  const set = await InterviewSet.findOne({ _id: req.body.setId, userId: req.user.id });
  if (!set) throw new AppError('Question set not found.', 404);
  const idx = set.questions.findIndex((q) => q.id === Number(req.body.questionId));
  if (idx === -1) throw new AppError('Question not found.', 404);

  const out = await callJSON({
    system: p.singleSystem,
    user: p.buildSingleUser({
      module: set.module, role: set.role, company: set.company, level: set.level, text: set.resumeText,
      existing: set.questions.map((q) => q.question),
    }),
    schema: p.singleSchema,
    maxTokens: 1500,
  });
  const id = set.questions[idx].id;
  set.questions[idx] = { ...out.question, id };
  set.bookmarks = set.bookmarks.filter((b) => b !== id);
  set.practiced = set.practiced.filter((b) => b !== id);
  set.markModified('questions');
  await set.save();
  ok(res, set, 'Question replaced');
});

exports.evaluate = asyncHandler(async (req, res) => {
  const { question, answer, role, level, setId } = req.body;
  let text = '';
  if (setId) {
    const set = await InterviewSet.findOne({ _id: setId, userId: req.user.id });
    text = set?.resumeText || '';
  }
  const out = await callJSON({
    system: p.evaluateSystem,
    user: `Role: ${role || 'not specified'}\nLevel: ${level || 'not specified'}\n\n<resume>\n${text || 'not provided'}\n</resume>\n\n<question>\n${cleanText(question, 1000)}\n</question>\n\n<answer>\n${cleanText(answer, 4000)}\n</answer>`,
    schema: p.evaluateSchema,
    maxTokens: 1800,
  });
  ok(res, out, 'Answer evaluated');
});

exports.history = asyncHandler(async (req, res) => {
  const items = await InterviewSet.find({ userId: req.user.id }).sort({ createdAt: -1 }).limit(50)
    .select('role company level module createdAt bookmarks practiced questions.id');
  ok(res, items.map((s) => ({
    _id: s._id, role: s.role, company: s.company, level: s.level, module: s.module, createdAt: s.createdAt,
    total: s.questions.length, practiced: s.practiced.length, bookmarks: s.bookmarks.length,
  })));
});

exports.getOne = asyncHandler(async (req, res) => {
  const s = await InterviewSet.findOne({ _id: req.params.id, userId: req.user.id });
  if (!s) throw new AppError('Question set not found.', 404);
  ok(res, s);
});

exports.remove = asyncHandler(async (req, res) => {
  const s = await InterviewSet.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
  if (!s) throw new AppError('Question set not found.', 404);
  ok(res, null, 'Question set deleted');
});

// body: { questionId, field: 'bookmarks' | 'practiced', value: boolean }
exports.toggle = asyncHandler(async (req, res) => {
  const { questionId, field = 'bookmarks', value } = req.body;
  if (!['bookmarks', 'practiced'].includes(field)) throw new AppError('Invalid field.', 400);
  const s = await InterviewSet.findOne({ _id: req.params.id, userId: req.user.id });
  if (!s) throw new AppError('Question set not found.', 404);
  const id = Number(questionId);
  const list = new Set(s[field]);
  const on = typeof value === 'boolean' ? value : !list.has(id);
  if (on) list.add(id); else list.delete(id);
  s[field] = [...list];
  await s.save();
  ok(res, { bookmarks: s.bookmarks, practiced: s.practiced });
});
