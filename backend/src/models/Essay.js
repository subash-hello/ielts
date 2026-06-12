const mongoose = require('mongoose');

const essaySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  taskType: { type: Number, enum: [1, 2], required: true },
  prompt: { type: String, required: true },
  content: { type: String, required: true },
  wordCount: { type: Number },
  scores: {
    taskAchievement: { type: Number, min: 0, max: 9 },
    coherence: { type: Number, min: 0, max: 9 },
    lexical: { type: Number, min: 0, max: 9 },
    grammar: { type: Number, min: 0, max: 9 },
    overall: { type: Number, min: 0, max: 9 }
  },
  feedback: { type: String },
  strengths: [{ type: String }],
  improvements: [{ type: String }],
  corrections: [{ original: String, corrected: String, explanation: String }],
  vocabularySuggestions: [{ basic: String, advanced: String }],
  modelAnswer: { type: String },
  isDraft: { type: Boolean, default: false }
}, { timestamps: true });

essaySchema.index({ userId: 1, taskType: 1 });

module.exports = mongoose.model('Essay', essaySchema);
