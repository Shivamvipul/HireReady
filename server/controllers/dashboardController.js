const AtsReport = require('../models/AtsReport');
const InterviewSet = require('../models/InterviewSet');
const Resume = require('../models/Resume');
const LinkedinReport = require('../models/LinkedinReport');
const asyncHandler = require('../utils/asyncHandler');
const { ok } = require('../utils/response');

exports.summary = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const [ats, interviews, resumes, linkedin, counts] = await Promise.all([
    AtsReport.find({ userId }).sort({ createdAt: -1 }).limit(5).select('fileName jobRole createdAt result.overall_score'),
    InterviewSet.find({ userId }).sort({ createdAt: -1 }).limit(5).select('role company module createdAt'),
    Resume.find({ userId }).sort({ updatedAt: -1 }).limit(6).select('title templateId updatedAt'),
    LinkedinReport.find({ userId }).sort({ createdAt: -1 }).limit(5).select('targetRole createdAt result.profile_score'),
    Promise.all([
      AtsReport.countDocuments({ userId }), InterviewSet.countDocuments({ userId }),
      Resume.countDocuments({ userId }), LinkedinReport.countDocuments({ userId }),
    ]),
  ]);

  const activity = [
    ...ats.map((a) => ({ type: 'ats', id: a._id, title: `ATS check: ${a.jobRole || a.fileName}`, detail: `Score ${a.result?.overall_score}`, at: a.createdAt })),
    ...interviews.map((i) => ({ type: 'interview', id: i._id, title: `Interview prep: ${i.role}${i.company ? ' @ ' + i.company : ''}`, detail: i.module, at: i.createdAt })),
    ...linkedin.map((l) => ({ type: 'linkedin', id: l._id, title: `LinkedIn: ${l.targetRole || 'profile review'}`, detail: `Score ${l.result?.profile_score}`, at: l.createdAt })),
    ...resumes.map((r) => ({ type: 'resume', id: r._id, title: `Resume: ${r.title}`, detail: r.templateId, at: r.updatedAt })),
  ].sort((a, b) => new Date(b.at) - new Date(a.at)).slice(0, 8);

  ok(res, {
    counts: { ats: counts[0], interview: counts[1], resumes: counts[2], linkedin: counts[3] },
    latestAts: ats[0] ? { id: ats[0]._id, score: ats[0].result?.overall_score, at: ats[0].createdAt, label: ats[0].jobRole || ats[0].fileName } : null,
    resumes, activity,
  });
});
