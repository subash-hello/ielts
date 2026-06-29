const express = require('express');
const { auth } = require('../middleware/auth');
const ReadingTest = require('../models/ReadingTest');
const TestContent = require('../models/TestContent');
const geminiService = require('../services/gemini.service');
const { formatResponse } = require('../utils/helpers');
const mongoose = require('mongoose');

const router = express.Router();

router.get('/passages', auth, async (req, res) => {
  const staticPassages = [
    { id: '1', title: 'The Impact of Climate Change on Marine Ecosystems', difficulty: 'medium', questionCount: 13, timeEstimate: 20, type: 'academic', topic: 'Environment' },
    { id: '2', title: 'The Evolution of Artificial Intelligence', difficulty: 'hard', questionCount: 13, timeEstimate: 20, type: 'academic', topic: 'Technology' },
    { id: '3', title: 'Ancient Egyptian Architecture', difficulty: 'easy', questionCount: 13, timeEstimate: 20, type: 'academic', topic: 'History' },
    { id: '4', title: 'The Psychology of Decision Making', difficulty: 'medium', questionCount: 13, timeEstimate: 20, type: 'academic', topic: 'Psychology' },
    { id: '5', title: 'Space Exploration: Past and Future', difficulty: 'hard', questionCount: 13, timeEstimate: 20, type: 'academic', topic: 'Science' },
    { id: '6', title: 'Modern Urban Planning Strategies', difficulty: 'easy', questionCount: 13, timeEstimate: 20, type: 'general', topic: 'Society' }
  ];

  try {
    const dbPassages = await TestContent.find({ type: 'practice_task', subType: 'reading', isActive: true });
    const completedSet = new Set(req.user.completedTests || []);
    const mappedDb = dbPassages.map(p => ({
      id: p._id.toString(),
      title: p.title,
      difficulty: p.difficulty || 'medium',
      questionCount: p.content?.questions?.length || 13,
      timeEstimate: p.content?.timeLimit || p.content?.timeEstimate || 20,
      type: p.content?.type || p.content?.examType || 'academic',
      topic: p.content?.topic || 'General',
      completed: completedSet.has(p._id.toString())
    }));
    
    const mappedStatic = staticPassages.map(p => ({
      ...p,
      completed: completedSet.has(p.id)
    }));

    res.json(formatResponse([...mappedStatic, ...mappedDb]));
  } catch (error) {
    res.json(formatResponse(staticPassages));
  }
});

const readingTests = require('../data/readingTests');

router.get('/passage/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    if (mongoose.Types.ObjectId.isValid(id)) {
      const customPassage = await TestContent.findById(id);
      if (customPassage && customPassage.content) {
        return res.json(formatResponse(customPassage.content));
      }
    }
    const passage = readingTests[id] || readingTests['1'];
    res.json(formatResponse(passage));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/submit', auth, async (req, res) => {
  try {
    const { passageId, answers, questions, timeSpent } = req.body;
    let correct = 0;
    const results = questions.map((q, i) => {
      const isCorrect = answers[i]?.toLowerCase().trim() === q.correctAnswer.toLowerCase().trim();
      if (isCorrect) correct++;
      return { question: q.text, userAnswer: answers[i], correctAnswer: q.correctAnswer, isCorrect };
    });
    const score = correct;
    const bandScore = Math.min(9, Math.round((correct / questions.length) * 9 * 2) / 2);
    
    // Save ReadingTest document
    const ReadingTest = require('../models/ReadingTest');
    const readingTest = new ReadingTest({
      userId: req.user._id,
      passageType: req.body.passageType || 'academic',
      passage: {
        title: req.body.passageTitle || 'Reading Practice',
        content: '',
        difficulty: req.body.difficulty || 'medium'
      },
      answers: Array.isArray(answers) ? answers : [],
      correctAnswers: questions.map(q => q.correctAnswer),
      score: score,
      totalQuestions: questions.length,
      timeSpent: timeSpent || 0
    });
    await readingTest.save();

    // Update user completedTests
    if (passageId) {
      if (!req.user.completedTests) req.user.completedTests = [];
      if (!req.user.completedTests.includes(passageId)) {
        req.user.completedTests.push(passageId);
        await req.user.save();
      }
    }

    // Record activity and update progress
    const { recordActivity } = require('../utils/progressHelper');
    await recordActivity({
      userId: req.user._id,
      module: 'reading',
      score: bandScore,
      feedback: `Completed reading passage with score ${score}/${questions.length}`,
      timeSpent: Math.ceil((timeSpent || 0) / 60) || 20,
      data: {
        readingTestId: readingTest._id,
        passageId: passageId,
        passageTitle: req.body.passageTitle || 'Reading Practice'
      }
    });

    res.json(formatResponse({ score, total: questions.length, bandScore, results, timeSpent }));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/history', auth, async (req, res) => {
  try {
    const tests = await ReadingTest.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(20);
    res.json(formatResponse(tests));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
