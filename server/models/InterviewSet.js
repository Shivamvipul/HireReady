const mongoose = require('mongoose');

const schema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    role: { type: String, required: true },
    company: { type: String, default: '' },
    level: { type: String, enum: ['Fresher', 'Junior', 'Mid', 'Senior'], required: true },
    module: { type: String, enum: ['technical', 'behavioral', 'project', 'company'], required: true },
    resumeText: { type: String, default: '' },
    questions: { type: [mongoose.Schema.Types.Mixed], default: [] },
    bookmarks: { type: [Number], default: [] },
    practiced: { type: [Number], default: [] },
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);
schema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('InterviewSet', schema);
