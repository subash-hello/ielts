const express = require('express');
const mongoose = require('mongoose');
const { auth } = require('../middleware/auth');
const geminiService = require('../services/gemini.service');
const { formatResponse, extractJSON } = require('../utils/helpers');

// Models
const Progress = require('../models/Progress');
const MockTest = require('../models/MockTest');
const SpeakingSession = require('../models/SpeakingSession');
const Essay = require('../models/Essay');

const router = express.Router();

router.post('/chat', auth, async (req, res) => {
  try {
    const { messages, image } = req.body;

    let progressData = [];
    let mockTests = [];
    let speakingSessions = [];
    let essays = [];

    if (mongoose.connection.readyState === 1) {
      try {
        const [prog, mock, speak, essayList] = await Promise.all([
          Progress.find({ userId: req.user._id }),
          MockTest.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(5),
          SpeakingSession.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(5),
          Essay.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(5)
        ]);
        progressData = prog;
        mockTests = mock;
        speakingSessions = speak;
        essays = essayList;
      } catch (err) {
        console.error('Error fetching student dashboard context:', err);
      }
    }

    // Construct a rich, live dashboard context for the AI Tutor
    let dashboardSummary = `
STUDENT PROFILE:
- Name: ${req.user.name}
- Current IELTS Level: ${req.user.currentLevel || 'Intermediate'}
- Current IELTS Band Estimate: ${req.user.currentBand || 'Not evaluated yet'}
- Target IELTS Band Goal: ${req.user.ieltsGoal || 7.0}
- Active Practice Streak: ${req.user.streak || 0} days (Best: ${req.user.bestStreak || 0} days)
- Experience Points (XP): ${req.user.xp || 0} XP (Level ${req.user.level || 1})
- Earned Badges: ${req.user.badges?.map(b => b.name).join(', ') || 'None yet'}
`;

    if (progressData.length > 0) {
      dashboardSummary += `\nMODULE PROGRESS:`;
      progressData.forEach(p => {
        dashboardSummary += `\n- ${p.module.toUpperCase()}: Avg Band: ${p.averageBand || 0}, Total Sessions: ${p.totalSessions || 0}, Weaknesses: ${p.weaknesses?.join(', ') || 'None identified'}, Strengths: ${p.strengths?.join(', ') || 'None identified'}`;
      });
    }

    if (mockTests.length > 0) {
      dashboardSummary += `\n\nRECENT MOCK TESTS:`;
      mockTests.forEach((mt, idx) => {
        dashboardSummary += `\n- Mock Test ${idx + 1}: Overall Band: ${mt.overallBand || 'In-Progress'}, Status: ${mt.status}, Taken: ${mt.completedAt ? new Date(mt.completedAt).toDateString() : 'N/A'}`;
      });
    }

    if (speakingSessions.length > 0) {
      dashboardSummary += `\n\nRECENT SPEAKING SESSIONS:`;
      speakingSessions.forEach((ss, idx) => {
        dashboardSummary += `\n- Session ${idx + 1} (Part ${ss.part}): Score: ${ss.scores?.overall || 'N/A'}, Fluency: ${ss.scores?.fluency || 'N/A'}, Pronunciation: ${ss.scores?.pronunciation || 'N/A'}, Grammar: ${ss.scores?.grammar || 'N/A'}, Lexical: ${ss.scores?.lexical || 'N/A'}`;
      });
    }

    if (essays.length > 0) {
      dashboardSummary += `\n\nRECENT ESSAYS (WRITING):`;
      essays.forEach((es, idx) => {
        dashboardSummary += `\n- Essay ${idx + 1} (Task ${es.taskType}): Score: ${es.scores?.overall || 'N/A'}, Task Achievement: ${es.scores?.taskAchievement || 'N/A'}, Coherence: ${es.scores?.coherence || 'N/A'}, Grammar: ${es.scores?.grammar || 'N/A'}, Lexical: ${es.scores?.lexical || 'N/A'}`;
      });
    }

    const response = await geminiService.chatWithTutor(messages, dashboardSummary, image);
    res.json(formatResponse({ reply: response }));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/generate-plan', auth, async (req, res) => {
  try {
    const plan = await geminiService.generateStudyPlan(req.user);
    res.json(formatResponse(plan));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/generate-quiz', auth, async (req, res) => {
  try {
    const { topic } = req.body;
    const model = require('../config/gemini').getModel();
    const result = await model.generateContent(`Generate a 5-question IELTS quiz about "${topic || 'general IELTS'}". Return JSON: {"questions": [{"question": "...", "options": ["A","B","C","D"], "correct": "A", "explanation": "..."}]}`);
    const text = result.response.text();
    const quiz = extractJSON(text);
    res.json(formatResponse(quiz));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/history', auth, async (req, res) => {
  res.json(formatResponse([]));
});

module.exports = router;
