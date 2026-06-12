const mongoose = require('mongoose');

const testContentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['mock_test', 'practice_task'], 
    required: true 
  },
  subType: { 
    type: String, 
    enum: ['reading', 'listening', 'writing', 'speaking', 'full'], 
    default: 'full' 
  },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  content: { type: mongoose.Schema.Types.Mixed, required: true }, // Contains JSON specific to the type (e.g. readingPassage, questions, etc.)
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('TestContent', testContentSchema);
