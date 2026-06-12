const express = require('express');
const mongoose = require('mongoose');
const { auth } = require('../middleware/auth');
const geminiService = require('../services/gemini.service');
const SpeakingSession = require('../models/SpeakingSession');
const Progress = require('../models/Progress');
const { formatResponse, calculateBand } = require('../utils/helpers');

const router = express.Router();

router.get('/questions/:part', auth, async (req, res) => {
  try {
    const part = parseInt(req.params.part);
    const questions = await geminiService.generateSpeakingQuestions(part);
    res.json(formatResponse(questions));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/respond', auth, async (req, res) => {
  try {
    const { currentQuestion, studentAnswer, nextQuestion } = req.body;
    const reply = await geminiService.generateSpeakingResponse(currentQuestion, studentAnswer, nextQuestion);
    res.json(formatResponse({ reply }));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/evaluate', auth, async (req, res) => {
  try {
    const { transcript, part, questions } = req.body;
    const evaluation = await geminiService.evaluateSpeaking(transcript, part);
    
    // RESILIENCE LAYER: Bypass DB writes if database is offline
    if (mongoose.connection.readyState !== 1) {
      return res.json(formatResponse({ ...evaluation, sessionId: 'sandbox-session-id' }));
    }
    
    const session = new SpeakingSession({
      userId: req.user._id,
      part,
      questions,
      responses: [{ question: questions?.[0] || '', transcript, duration: req.body.duration || 0 }],
      scores: evaluation.scores,
      feedback: evaluation.feedback,
      modelAnswers: [evaluation.modelAnswer]
    });
    await session.save();

    await Progress.findOneAndUpdate(
      { userId: req.user._id, module: 'speaking' },
      {
        $push: { scores: evaluation.scores.overall, history: { score: evaluation.scores.overall, feedback: evaluation.feedback } },
        $inc: { totalSessions: 1, totalTimeMinutes: Math.ceil((req.body.duration || 60) / 60) }
      },
      { upsert: true, new: true }
    );

    res.json(formatResponse({ ...evaluation, sessionId: session._id }));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/history', auth, async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json(formatResponse([]));
    }
    const sessions = await SpeakingSession.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(20);
    res.json(formatResponse(sessions));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

