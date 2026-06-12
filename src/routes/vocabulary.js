const express = require('express');
const { auth } = require('../middleware/auth');
const geminiService = require('../services/gemini.service');
const { formatResponse } = require('../utils/helpers');

const router = express.Router();

router.post('/generate', auth, async (req, res) => {
  try {
    const { topic } = req.body;
    const words = await geminiService.generateVocabulary(topic);
    res.json(formatResponse(words));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router.post('/evaluate-audio', auth, async (req, res) => {
  try {
    const { audioBase64, mimeType, targetSentence } = req.body;
    if (!audioBase64 || !mimeType || !targetSentence) {
      return res.status(400).json({ error: 'Missing audio or target sentence data' });
    }
    const result = await geminiService.evaluateAudioPronunciation(audioBase64, mimeType, targetSentence);
    res.json(formatResponse(result));
  } catch (error) {
    console.error('Audio evaluation error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
