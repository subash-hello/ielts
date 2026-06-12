const express = require('express');
const mongoose = require('mongoose');
const { auth } = require('../middleware/auth');
const geminiService = require('../services/gemini.service');
const User = require('../models/User');
const Progress = require('../models/Progress');
const { formatResponse } = require('../utils/helpers');

const router = express.Router();

router.post('/submit', auth, async (req, res) => {
  try {
    const {
      vocabularyAnswers,
      listeningAnswers,
      readingAnswers,
      writingAnswer,
      speakingAnswer,
      setIndex = 1
    } = req.body;

    const currentSet = parseInt(setIndex) || 1;

    // 1. Grade Vocabulary & Grammar (5 MCQs)
    const vocabKeys = {
      1: { q1: 'A', q2: 'B', q3: 'B', q4: 'C', q5: 'B' }, // Travel & Tourism
      2: { q1: 'A', q2: 'B', q3: 'B', q4: 'C', q5: 'B' }, // Health & Fitness
      3: { q1: 'B', q2: 'B', q3: 'B', q4: 'B', q5: 'A' }  // Education & Technology
    };
    const vocabCorrectAnswers = vocabKeys[currentSet] || vocabKeys[1];
    
    let vocabCorrect = 0;
    const vocabResults = Object.keys(vocabCorrectAnswers).map(key => {
      const userAns = (vocabularyAnswers?.[key] || '').trim().toUpperCase();
      const correctAns = vocabCorrectAnswers[key];
      const isCorrect = userAns === correctAns;
      if (isCorrect) vocabCorrect++;
      return { key, userAns, correctAns, isCorrect };
    });

    // Map vocabulary score out of 5 to a mock band score for diagnostic tracking
    const vocabBandMap = { 0: 2.0, 1: 3.5, 2: 4.5, 3: 5.5, 4: 6.5, 5: 7.5 };
    const vocabBand = vocabBandMap[vocabCorrect] || 2.0;

    // 2. Grade Listening (3 Fill-ins)
    const listeningKeys = {
      1: { q1: 'single', q2: '12', q3: '160' },       // Travel & Tourism
      2: { q1: '40', q2: 'sarah', q3: '15' },         // Health & Fitness
      3: { q1: '4', q2: 'peterson', q3: '7' }         // Education & Technology
    };
    const listeningCorrectAnswers = listeningKeys[currentSet] || listeningKeys[1];
    
    let listeningCorrect = 0;
    const listeningResults = Object.keys(listeningCorrectAnswers).map(key => {
      const userAns = (listeningAnswers?.[key] || '').trim().toLowerCase();
      const correctAns = listeningCorrectAnswers[key];
      let isCorrect = userAns === correctAns;
      
      // Flexible comparison checks
      if (currentSet === 1) {
        if (key === 'q2' && (userAns === '12th' || userAns === 'twelfth')) isCorrect = true;
        if (key === 'q3' && (userAns === '160$' || userAns === '160 dollars' || userAns === 'one hundred and sixty')) isCorrect = true;
      } else if (currentSet === 2) {
        if (key === 'q1' && userAns === 'forty') isCorrect = true;
        if (key === 'q2' && userAns.includes('sarah')) isCorrect = true;
        if (key === 'q3' && (userAns === '15th' || userAns === 'fifteenth')) isCorrect = true;
      } else if (currentSet === 3) {
        if (key === 'q1' && userAns === 'four') isCorrect = true;
        if (key === 'q2' && userAns.includes('peterson')) isCorrect = true;
        if (key === 'q3' && (userAns === '7th' || userAns === 'seventh')) isCorrect = true;
      }
      
      if (isCorrect) listeningCorrect++;
      return { key, userAns, correctAns, isCorrect };
    });

    const listeningBandMap = { 0: 2.5, 1: 4.0, 2: 5.5, 3: 7.0 };
    const listeningBand = listeningBandMap[listeningCorrect] || 2.5;

    // 3. Grade Reading (3 MCQs)
    const readingKeys = {
      1: { q1: 'A', q2: 'C', q3: 'B' }, // Travel & Tourism
      2: { q1: 'A', q2: 'B', q3: 'C' }, // Health & Fitness
      3: { q1: 'B', q2: 'C', q3: 'C' }  // Education & Technology
    };
    const readingCorrectAnswers = readingKeys[currentSet] || readingKeys[1];
    
    let readingCorrect = 0;
    const readingResults = Object.keys(readingCorrectAnswers).map(key => {
      const userAns = (readingAnswers?.[key] || '').trim().toUpperCase();
      const correctAns = readingCorrectAnswers[key];
      const isCorrect = userAns === correctAns;
      if (isCorrect) readingCorrect++;
      return { key, userAns, correctAns, isCorrect };
    });

    const readingBandMap = { 0: 2.5, 1: 4.0, 2: 5.5, 3: 7.0 };
    const readingBand = readingBandMap[readingCorrect] || 2.5;

    // Define task prompts dynamically to supply to Gemini evaluation context
    const writingPrompts = {
      1: `"Some people believe that technology has made our lives more complicated, while others think it has made them simpler. What is your opinion?"`,
      2: `"Many people believe that regular exercise is the most important factor in maintaining good health, while others think a balanced diet is more crucial. Discuss both views and give your opinion."`,
      3: `"Some people believe that computers and the internet will eventually replace traditional schools and teachers, while others think schools will always be necessary. What is your opinion?"`
    };

    const speakingPrompts = {
      1: `"Describe your favorite hobby. Speak for 30 to 60 seconds. You should say what the hobby is, how long you have been doing it, and why you enjoy it."`,
      2: `"Describe a healthy habit you have. Speak for 30 to 60 seconds. You should say what it is, how often you do it, and why it is good for your health."`,
      3: `"Describe a teacher who has influenced you in your life. Speak for 30 to 60 seconds. You should say who the teacher is, what subject they taught, and how they helped you."`
    };

    const activeWritingPrompt = writingPrompts[currentSet] || writingPrompts[1];
    const activeSpeakingPrompt = speakingPrompts[currentSet] || speakingPrompts[1];

    // 4. Grade Writing & Speaking using Gemini
    console.log(`🤖 Sending Writing & Speaking responses for Set ${currentSet} to Gemini for evaluation...`);
    const geminiEval = await geminiService.evaluateDiagnostic(
      writingAnswer,
      speakingAnswer,
      activeWritingPrompt,
      activeSpeakingPrompt
    );

    const writingBand = Number(geminiEval?.writing?.score) || 4.5;
    const speakingBand = Number(geminiEval?.speaking?.score) || 4.0;

    const writingFeedback = geminiEval?.writing?.feedback || 'Writing evaluated successfully.';
    const speakingFeedback = geminiEval?.speaking?.feedback || 'Speaking evaluated successfully.';

    // 5. Compute Overall Estimated Band Score (Average of Listening, Reading, Writing, Speaking)
    const overallBand = Math.round(((listeningBand + readingBand + writingBand + speakingBand) / 4) * 2) / 2;

    // Level Mapping
    let currentLevel = 'intermediate';
    if (overallBand < 5.0) currentLevel = 'beginner';
    else if (overallBand >= 7.0) currentLevel = 'advanced';

    console.log(`📊 Diagnostic complete for ${req.user.name}. Set: ${currentSet}, Overall: ${overallBand}, Level: ${currentLevel}`);

    // Update User Profile if MongoDB is active
    if (mongoose.connection.readyState === 1) {
      const user = await User.findById(req.user._id);
      if (user) {
        user.currentBand = overallBand;
        user.currentLevel = currentLevel;
        // Award XP and Badge
        user.xp += 150;
        
        // Push Badge if not already earned
        const badgeName = 'Diagnostic Complete';
        if (!user.badges.some(b => b.name === badgeName)) {
          user.badges.push({
            name: badgeName,
            icon: 'Sparkles',
            earnedAt: new Date()
          });
        }
        
        // Calculate new level from updated XP
        user.level = Math.floor(user.xp / 500) + 1;
        await user.save();
      }

      // Update module progresses
      const modulesToUpdate = [
        { name: 'listening', score: listeningBand, feedback: `Diagnostic Test (Set ${currentSet}): Got ${listeningCorrect}/3 fill-in questions correct.` },
        { name: 'reading', score: readingBand, feedback: `Diagnostic Test (Set ${currentSet}): Got ${readingCorrect}/3 MCQs correct.` },
        { name: 'writing', score: writingBand, feedback: `Diagnostic Test (Set ${currentSet}): ${writingFeedback}` },
        { name: 'speaking', score: speakingBand, feedback: `Diagnostic Test (Set ${currentSet}): ${speakingFeedback}` }
      ];

      for (const m of modulesToUpdate) {
        await Progress.findOneAndUpdate(
          { userId: req.user._id, module: m.name },
          {
            $push: { 
              scores: m.score, 
              history: { 
                score: m.score, 
                feedback: m.feedback,
                date: new Date() 
              } 
            },
            $set: { averageBand: m.score },
            $inc: { totalSessions: 1, totalTimeMinutes: 5 }
          },
          { upsert: true, new: true }
        );
      }
    }

    // Return diagnostic report
    res.json(formatResponse({
      scores: {
        vocabulary: vocabCorrect,
        listening: listeningCorrect,
        reading: readingCorrect,
        writing: writingBand,
        speaking: speakingBand,
        overall: overallBand
      },
      bands: {
        vocabulary: vocabBand,
        listening: listeningBand,
        reading: readingBand,
        writing: writingBand,
        speaking: speakingBand
      },
      feedbacks: {
        writing: writingFeedback,
        speaking: speakingFeedback
      },
      level: currentLevel,
      xpAwarded: 150
    }));

  } catch (error) {
    console.error('Error submitting diagnostic test:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
