const express = require('express');
const { auth } = require('../middleware/auth');
const geminiService = require('../services/gemini.service');
const Essay = require('../models/Essay');
const Progress = require('../models/Progress');
const { formatResponse } = require('../utils/helpers');

const router = express.Router();

router.post('/evaluate', auth, async (req, res) => {
  try {
    const { content, taskType, prompt } = req.body;
    const evaluation = await geminiService.evaluateEssay(content, taskType, prompt);
    
    const essay = new Essay({
      userId: req.user._id,
      taskType,
      prompt,
      content,
      wordCount: content.split(/\s+/).length,
      scores: evaluation.scores,
      feedback: evaluation.feedback,
      strengths: evaluation.strengths,
      improvements: evaluation.improvements,
      corrections: evaluation.corrections,
      vocabularySuggestions: evaluation.vocabularySuggestions,
      modelAnswer: evaluation.modelAnswer
    });
    await essay.save();

    await Progress.findOneAndUpdate(
      { userId: req.user._id, module: 'writing' },
      {
        $push: { scores: evaluation.scores.overall, history: { score: evaluation.scores.overall, feedback: evaluation.feedback } },
        $inc: { totalSessions: 1 }
      },
      { upsert: true, new: true }
    );

    res.json(formatResponse({ ...evaluation, essayId: essay._id }));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/prompts', auth, async (req, res) => {
  try {
    const taskType = parseInt(req.query.taskType) || 2;
    const prompt = await geminiService.generateWritingPrompt(taskType, req.query.topic);
    res.json(formatResponse(prompt));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/history', auth, async (req, res) => {
  try {
    const essays = await Essay.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(20).select('-content -modelAnswer');
    res.json(formatResponse(essays));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/save-draft', auth, async (req, res) => {
  try {
    const { content, taskType, prompt, essayId } = req.body;
    if (essayId) {
      await Essay.findByIdAndUpdate(essayId, { content, wordCount: content.split(/\s+/).length });
    } else {
      await Essay.create({ userId: req.user._id, taskType, prompt, content, wordCount: content.split(/\s+/).length, isDraft: true });
    }
    res.json(formatResponse(null, 'Draft saved'));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/samples', auth, async (req, res) => {
  try {
    const samples = [
      { taskType: 2, topic: 'Technology & Education', band: 8.5, prompt: 'Some people believe technology has made education easier...', snippet: 'In the contemporary era, the integration of technology...' },
      { taskType: 2, topic: 'Environment', band: 9.0, prompt: 'Climate change is the greatest threat facing humanity...', snippet: 'The escalating crisis of climate change represents...' },
      { taskType: 1, topic: 'Bar Chart', band: 8.0, prompt: 'The chart below shows the percentage of households...', snippet: 'The bar chart illustrates the proportion of...' }
    ];
    res.json(formatResponse(samples));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
