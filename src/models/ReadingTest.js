const mongoose = require('mongoose');

const readingTestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  passageType: { type: String, enum: ['academic', 'general'], default: 'academic' },
  passage: { title: String, content: String, difficulty: String },
  questions: [{ type: String, questionType: String, options: [String] }],
  answers: [String],
  correctAnswers: [String],
  score: { type: Number },
  totalQuestions: { type: Number },
  timeSpent: { type: Number },
  explanations: [String]
}, { timestamps: true });

module.exports = mongoose.model('ReadingTest', readingTestSchema);
