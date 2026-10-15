const mongoose = require('mongoose');

const schema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    linkedinUrl: { type: String, default: '' },
    targetRole: { type: String, default: '' },
    profileText: { type: String, required: true },
    result: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);
schema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('LinkedinReport', schema);
