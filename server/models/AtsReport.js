const mongoose = require('mongoose');

const schema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    fileName: { type: String, default: 'Pasted text' },
    resumeText: { type: String, required: true },
    jobRole: { type: String, default: '' },
    jobDescription: { type: String, default: '' },
    result: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);
schema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('AtsReport', schema);
