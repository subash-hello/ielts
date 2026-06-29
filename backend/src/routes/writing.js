const express = require('express');
const { auth } = require('../middleware/auth');
const geminiService = require('../services/gemini.service');
const Essay = require('../models/Essay');
const Progress = require('../models/Progress');
const TestContent = require('../models/TestContent');
const mongoose = require('mongoose');
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

    const { recordActivity } = require('../utils/progressHelper');
    await recordActivity({
      userId: req.user._id,
      module: 'writing',
      score: evaluation.scores.overall,
      feedback: evaluation.feedback,
      timeSpent: 40,
      data: {
        essayId: essay._id,
        taskType: taskType,
        prompt: prompt
      }
    });

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

router.get('/test/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    if (mongoose.Types.ObjectId.isValid(id)) {
      const dbTest = await TestContent.findById(id);
      if (dbTest && dbTest.content) {
        let parts = dbTest.content.parts || [];
        let modified = false;

        // Support legacy schema fallback
        if (parts.length === 0 && (dbTest.content.prompt || dbTest.content.imageUrl || dbTest.content.image)) {
           const hasImage = dbTest.content.image || dbTest.content.imageUrl;
           let legacyPart = {
             title: dbTest.content.taskType === 1 ? "Writing Task 1" : "Writing Task 2",
             instruction: dbTest.content.taskType === 1 ? "You should spend about 20 minutes on this task." : "You should spend about 40 minutes on this task.",
             imageUrl: hasImage,
             text: dbTest.content.prompt || dbTest.content.text,
           };
           
           if (hasImage && !dbTest.content.svg) {
             const geminiService = require('../services/gemini.service');
             console.log(`Generating legacy SVG for test "${dbTest.title}"...`);
             const generatedSvg = await geminiService.generateSVGForPrompt(legacyPart.text);
             if (generatedSvg) {
               dbTest.content.svg = generatedSvg;
               dbTest.markModified('content.svg');
               await dbTest.save();
             }
           }
           
           if (dbTest.content.svg) {
             legacyPart.svg = dbTest.content.svg;
           }
           parts = [legacyPart];
        } else if (parts.length > 0) {
          for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            if (part.imageUrl && !part.svg) {
              const geminiService = require('../services/gemini.service');
              console.log(`Generating SVG for test "${dbTest.title}" part ${i+1}...`);
              const generatedSvg = await geminiService.generateSVGForPrompt(part.text);
              if (generatedSvg) {
                part.svg = generatedSvg;
                modified = true;
              }
            }
          }
          if (modified) {
            dbTest.markModified('content.parts');
            await dbTest.save();
          }
        }
        
        return res.json(formatResponse({
          id: dbTest._id.toString(),
          title: dbTest.title,
          difficulty: dbTest.difficulty,
          parts: parts
        }));
      }
    }

    return res.status(404).json({ error: 'Test not found' });
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
