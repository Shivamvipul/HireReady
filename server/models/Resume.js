const mongoose = require('mongoose');

const schema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, default: 'Untitled resume', trim: true, maxlength: 100 },
    templateId: { type: String, default: 'ats-safe-1' },
    data: { type: mongoose.Schema.Types.Mixed, default: {} },
    settings: { type: mongoose.Schema.Types.Mixed, default: {} },
    photoUrl: { type: String, default: '' },
    slug: { type: String, unique: true, sparse: true },
    isPublic: { type: Boolean, default: false },
  },
  { timestamps: true, minimize: false }
);
schema.index({ userId: 1, updatedAt: -1 });

module.exports = mongoose.model('Resume', schema);
