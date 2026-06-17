const express = require('express');
const { auth } = require('../middleware/auth');
const { formatResponse } = require('../utils/helpers');
const mongoose = require('mongoose');
const TestContent = require('../models/TestContent');

const router = express.Router();
const cambridgeTests = require('../data/cambridgeListeningTests');

router.get('/tests', auth, async (req, res) => {
  try {
    const completedSet = new Set(req.user.completedTests || []);

    // Return all 30 tests
    const testsList = Object.values(cambridgeTests).map(t => ({
      id: t.id,
      title: t.title,
      difficulty: t.difficulty,
      duration: t.duration,
      partsCount: t.parts.length,
      questionCount: t.parts.reduce((acc, part) => acc + (part.questions ? part.questions.length : 0), 0),
      completed: completedSet.has(t.id)
    }));

    // Add DB practice tests if needed
    const dbTests = await TestContent.find({ type: 'practice_task', subType: 'listening', isActive: true });
    const mappedDb = dbTests.map(t => ({
      id: t._id.toString(),
      title: t.title,
      difficulty: t.difficulty || 'medium',
      duration: t.content?.duration || '30 min',
      partsCount: t.content?.parts?.length || 0,
      questionCount: t.content?.parts?.reduce((acc, part) => acc + (part.questions ? part.questions.length : 0), 0) || 0,
      completed: completedSet.has(t._id.toString())
    }));

    res.json(formatResponse([...testsList, ...mappedDb]));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/test/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    if (mongoose.Types.ObjectId.isValid(id)) {
      const dbTest = await TestContent.findById(id);
      if (dbTest && dbTest.content) {
        let parts = dbTest.content.parts;
        if (!parts || parts.length === 0) {
          if (dbTest.content.questions && dbTest.content.transcript) {
            parts = [{
              part: dbTest.content.section || 1,
              title: dbTest.content.title || dbTest.title,
              transcript: dbTest.content.transcript,
              audioUrl: dbTest.content.audioUrl,
              questions: dbTest.content.questions
            }];
          } else {
            parts = [];
          }
        } else {
          // Ensure each part has audioUrl - fallback to content-level audioUrl if missing on part
          parts = parts.map(p => ({
            ...p.toObject ? p.toObject() : p,
            audioUrl: p.audioUrl || dbTest.content.audioUrl
          }));
        }
        return res.json(formatResponse({
          id: dbTest._id.toString(),
          title: dbTest.title,
          audioUrl: dbTest.content.audioUrl,
          duration: dbTest.content.duration || '30 min',
          parts: parts
        }));
      }
    }

    const test = cambridgeTests[id];
    if (!test) {
      return res.status(404).json({ error: 'Test not found' });
    }
    res.json(formatResponse(test));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/submit', auth, async (req, res) => {
  try {
    const { testId, answers, questions } = req.body;
    let correct = 0;
    const results = questions.map((q, i) => {
      // Find the answer for this question ID. Assuming answers is an object mapping question ID to answer string.
      // If answers is an array, we match by index. 
      const userAnswer = Array.isArray(answers) ? answers[i] : (answers[q.id] || '');
      const isCorrect = userAnswer?.toLowerCase().trim() === q.correctAnswer.toLowerCase().trim();
      if (isCorrect) correct++;
      return { questionId: q.id, question: q.text, userAnswer, correctAnswer: q.correctAnswer, isCorrect };
    });
    res.json(formatResponse({ score: correct, total: questions.length, results }));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/history', auth, async (req, res) => {
  res.json(formatResponse([]));
});

module.exports = router;
