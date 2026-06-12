const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  module: { type: String, enum: ['speaking', 'writing', 'reading', 'listening'], required: true },
  type: { type: String, enum: ['practice', 'mockTest'], default: 'practice' },
  startedAt: { type: Date, default: Date.now },
  endedAt: { type: Date },
  score: { type: Number },
  feedback: { type: String },
  data: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true });

sessionSchema.index({ userId: 1, module: 1 });

module.exports = mongoose.model('Session', sessionSchema);
