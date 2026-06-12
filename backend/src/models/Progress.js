const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  module: { type: String, enum: ['speaking', 'writing', 'reading', 'listening'], required: true },
  scores: [{ type: Number }],
  averageBand: { type: Number, default: 0 },
  totalSessions: { type: Number, default: 0 },
  totalTimeMinutes: { type: Number, default: 0 },
  strengths: [String],
  weaknesses: [String],
  history: [{
    date: { type: Date, default: Date.now },
    score: Number,
    feedback: String,
    sessionId: { type: mongoose.Schema.Types.ObjectId }
  }]
}, { timestamps: true });

progressSchema.index({ userId: 1, module: 1 }, { unique: true });

module.exports = mongoose.model('Progress', progressSchema);
