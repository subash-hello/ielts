const mongoose = require('mongoose');

const mockTestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  modules: {
    speaking: { score: Number, completed: Boolean, data: mongoose.Schema.Types.Mixed },
    writing: { score: Number, completed: Boolean, data: mongoose.Schema.Types.Mixed },
    reading: { score: Number, completed: Boolean, data: mongoose.Schema.Types.Mixed },
    listening: { score: Number, completed: Boolean, data: mongoose.Schema.Types.Mixed }
  },
  overallBand: { type: Number },
  startedAt: { type: Date, default: Date.now },
  completedAt: { type: Date },
  report: { type: String },
  status: { type: String, enum: ['in-progress', 'completed', 'abandoned'], default: 'in-progress' }
}, { timestamps: true });

module.exports = mongoose.model('MockTest', mockTestSchema);
