const express = require('express');
const { auth } = require('../middleware/auth');
const MockTest = require('../models/MockTest');
const TestContent = require('../models/TestContent');
const { formatResponse } = require('../utils/helpers');

const router = express.Router();

// Add a dev-only seed route to populate db
router.post('/seed', async (req, res) => {
  try {
    const mockTestsData = [
      {
        title: 'Full Mock Test',
        type: 'mock_test',
        subType: 'full',
        difficulty: 'medium',
        content: {
          readingPassage: "The Impact of AI on Language Acquisition...",
          readingQuestions: [
            { id: 'r1', text: 'According to the passage...', options: ['A', 'B', 'C', 'D'], correct: 'B' },
            { id: 'r2', text: 'AI tutors create...', options: ['A', 'B', 'C', 'D'], correct: 'C' }
          ],
          speakingPrompts: [
            { id: 's1', question: "Could you tell me a little about your hometown?", examinerText: "Let's start. Could you tell me a little about your hometown?" }
          ],
          writingPrompt: "Discuss both views and give your opinion.",
          listeningTranscript: "Welcome to the IELTS Listening Test...",
          listeningQuestions: [
            { id: 'l1', type: 'fillBlank', text: 'The guest wants to book a room for _____ nights.', correctAnswer: 'three' }
          ]
        }
      }
    ];

    const practiceTasksData = [
      {
        title: 'Speaking Practice',
        type: 'practice_task',
        subType: 'speaking',
        difficulty: 'easy',
        content: {
          part: 1,
          desc: 'Answer simple questions about your daily routine.',
          duration: '4 min',
          color: 'from-violet-500 to-accent-bright'
        }
      },
      {
        title: 'Writing Practice',
        type: 'practice_task',
        subType: 'writing',
        difficulty: 'hard',
        content: {
          taskType: 2,
          prompt: 'Discuss the impact of climate change on coastal cities and propose solutions.',
          duration: '40 min',
          color: 'from-accent-bright to-pink-400'
        }
      }
    ];

    const mockTestsToInsert = [];
    for (let i = 1; i <= 30; i++) {
      const template = mockTestsData[0];
      mockTestsToInsert.push({
        title: `Mock Test ${i}: Standard Academic`,
        type: template.type,
        subType: template.subType,
        difficulty: i > 20 ? 'hard' : (i > 10 ? 'medium' : 'easy'),
        content: template.content,
        isActive: true
      });
    }
    await TestContent.insertMany(mockTestsToInsert);

    const practiceToInsert = [];
    for (let i = 1; i <= 30; i++) {
      const isSpeaking = i % 2 === 0;
      const template = isSpeaking ? practiceTasksData[0] : practiceTasksData[1];
      
      practiceToInsert.push({
        title: `${isSpeaking ? 'Speaking' : 'Writing'} Task - Set ${i}`,
        type: template.type,
        subType: template.subType,
        difficulty: i > 20 ? 'hard' : (i > 10 ? 'medium' : 'easy'),
        content: template.content,
        isActive: true
      });
    }
    await TestContent.insertMany(practiceToInsert);

    res.json({ message: 'Seeded 30 mock tests and 30 practice questions successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/available', auth, async (req, res) => {
  try {
    const tests = await TestContent.find({ type: 'mock_test', isActive: true });
    res.json(formatResponse(tests));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/practice/available', auth, async (req, res) => {
  try {
    const { subType } = req.query;
    const query = { type: 'practice_task', isActive: true };
    if (subType) query.subType = subType;
    const tasks = await TestContent.find(query);
    res.json(formatResponse(tasks));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/start', auth, async (req, res) => {
  try {
    const mockTest = new MockTest({ userId: req.user._id });
    await mockTest.save();
    res.json(formatResponse(mockTest));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/submit-module', auth, async (req, res) => {
  try {
    const { testId, module, score } = req.body;
    const test = await MockTest.findById(testId);
    if (!test) return res.status(404).json({ error: 'Test not found' });
    test.modules[module] = { score, completed: true, data: req.body.data };
    const completedModules = Object.values(test.modules).filter(m => m?.completed);
    if (completedModules.length === 4) {
      test.status = 'completed';
      test.completedAt = new Date();
      test.overallBand = Math.round(completedModules.reduce((sum, m) => sum + m.score, 0) / 4 * 2) / 2;
    }
    await test.save();
    res.json(formatResponse(test));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/result/:id', auth, async (req, res) => {
  try {
    const test = await MockTest.findById(req.params.id);
    res.json(formatResponse(test));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/history', auth, async (req, res) => {
  try {
    const tests = await MockTest.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(10);
    res.json(formatResponse(tests));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
