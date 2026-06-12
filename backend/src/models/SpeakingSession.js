const mongoose = require('mongoose');

const speakingSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  part: { type: Number, enum: [1, 2, 3], required: true },
  questions: [{ type: String }],
  responses: [{
    question: String,
    transcript: String,
    audioUrl: String,
    duration: Number
  }],
  scores: {
    fluency: { type: Number, min: 0, max: 9 },
    lexical: { type: Number, min: 0, max: 9 },
    grammar: { type: Number, min: 0, max: 9 },
    pronunciation: { type: Number, min: 0, max: 9 },
    overall: { type: Number, min: 0, max: 9 }
  },
  feedback: { type: String },
  modelAnswers: [String],
  totalDuration: { type: Number }
}, { timestamps: true });

module.exports = mongoose.model('SpeakingSession', speakingSessionSchema);
