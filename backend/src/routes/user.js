const express = require('express');
const { auth } = require('../middleware/auth');
const User = require('../models/User');
const Progress = require('../models/Progress');
const Session = require('../models/Session');
const { formatResponse, calculateStreak, calculateLevel } = require('../utils/helpers');

const router = express.Router();

router.get('/profile', auth, async (req, res) => {
  try {
    res.json(formatResponse(req.user));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/profile', auth, async (req, res) => {
  try {
    const updates = ['name', 'ieltsGoal', 'targetExamDate', 'currentLevel', 'avatar'];
    updates.forEach(field => {
      if (req.body[field] !== undefined) req.user[field] = req.body[field];
    });
    await req.user.save();
    res.json(formatResponse(req.user, 'Profile updated'));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/dashboard-stats', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const progress = await Progress.find({ userId });
    const recentSessions = await Session.find({ userId }).sort({ createdAt: -1 }).limit(10);
    const streak = calculateStreak(req.user.studyDays);
    const level = calculateLevel(req.user.xp);

    const stats = {
      user: req.user,
      streak,
      level,
      xp: req.user.xp,
      progress: progress.reduce((acc, p) => { acc[p.module] = p; return acc; }, {}),
      recentSessions,
      totalSessions: recentSessions.length,
      predictedBand: progress.length > 0
        ? (progress.reduce((sum, p) => sum + (p.averageBand || 0), 0) / progress.length).toFixed(1)
        : req.user.currentBand || 0
    };

    res.json(formatResponse(stats));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/record-study', auth, async (req, res) => {
  try {
    const user = req.user;
    const studyDate = req.body.date ? new Date(req.body.date) : new Date();
    const dateStr = studyDate.toDateString();
    
    // Ensure we don't push duplicates for the same calendar date
    const exists = user.studyDays.some(d => new Date(d).toDateString() === dateStr);
    
    if (!exists) {
      user.studyDays.push(studyDate);
    }
    
    user.lastActive = studyDate;
    
    // Recalculate streak
    const newStreak = calculateStreak(user.studyDays);
    user.streak = newStreak;
    if (newStreak > (user.bestStreak || 0)) {
      user.bestStreak = newStreak;
    }
    
    await user.save();
    
    res.json(formatResponse({
      streak: user.streak,
      bestStreak: user.bestStreak,
      studyDays: user.studyDays,
      lastActive: user.lastActive
    }, 'Study activity recorded'));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/progress', auth, async (req, res) => {
  try {
    const progress = await Progress.find({ userId: req.user._id });
    res.json(formatResponse(progress));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/complete-test', auth, async (req, res) => {
  try {
    const { testId } = req.body;
    if (!testId) {
      return res.status(400).json({ error: 'Test ID is required' });
    }
    if (!req.user.completedTests) {
      req.user.completedTests = [];
    }
    if (!req.user.completedTests.includes(testId)) {
      req.user.completedTests.push(testId);
      await req.user.save();
    }
    res.json(formatResponse({ success: true }));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
