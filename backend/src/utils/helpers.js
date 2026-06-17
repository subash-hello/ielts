const jwt = require('jsonwebtoken');

const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET || 'fallback-secret-for-demo', { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
};

const calculateBand = (scores) => {
  const values = Object.values(scores).filter(v => typeof v === 'number');
  if (values.length === 0) return 0;
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  return Math.round(avg * 2) / 2; // Round to nearest 0.5
};

const formatResponse = (data, message = 'Success') => {
  return { success: true, message, data };
};

const calculateStreak = (studyDays) => {
  if (!studyDays || studyDays.length === 0) return 0;
  
  // Format each date to simple day representation and sort descending
  const sorted = studyDays.map(d => new Date(d).toDateString()).sort((a, b) => new Date(b) - new Date(a));
  const unique = [...new Set(sorted)];
  
  if (unique.length === 0) return 0;
  
  const todayStr = new Date().toDateString();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toDateString();
  
  // If the most recent study day is neither today nor yesterday, the streak is broken (0 days)
  if (unique[0] !== todayStr && unique[0] !== yesterdayStr) {
    return 0;
  }
  
  // If last study was yesterday (and not yet today), offset the sequence check by 1 day
  const startOffset = (unique[0] === yesterdayStr) ? 1 : 0;
  
  let streak = 0;
  for (let i = 0; i < unique.length; i++) {
    const expected = new Date();
    expected.setDate(expected.getDate() - (i + startOffset));
    if (unique[i] === expected.toDateString()) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
};

const calculateXPForAction = (action) => {
  const xpMap = {
    'speaking_practice': 50,
    'writing_practice': 60,
    'reading_practice': 40,
    'listening_practice': 40,
    'mock_test': 200,
    'daily_login': 10,
    'streak_bonus': 25,
  };
  return xpMap[action] || 10;
};

const calculateLevel = (xp) => {
  return Math.floor(xp / 500) + 1;
};

const extractJSON = (text) => {
  if (typeof text !== 'string') return text;
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed);
  } catch (e) {
    // Try to remove markdown json wrapper if present
    const cleaned = trimmed.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
    try {
      return JSON.parse(cleaned);
    } catch (err) {
      // Find outer-most { ... }
      const firstBrace = cleaned.indexOf('{');
      const lastBrace = cleaned.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1) {
        const jsonStr = cleaned.substring(firstBrace, lastBrace + 1);
        try {
          return JSON.parse(jsonStr);
        } catch (innerError) {
          // Find outer-most [ ... ]
          const firstBracket = cleaned.indexOf('[');
          const lastBracket = cleaned.lastIndexOf(']');
          if (firstBracket !== -1 && lastBracket !== -1) {
            const jsonArrStr = cleaned.substring(firstBracket, lastBracket + 1);
            try {
              return JSON.parse(jsonArrStr);
            } catch (bracketError) {
              throw new Error(`Failed to extract JSON. Original: ${text}`);
            }
          }
          throw innerError;
        }
      }
      throw err;
    }
  }
};

module.exports = { 
  generateToken, 
  calculateBand, 
  formatResponse, 
  calculateStreak, 
  calculateXPForAction, 
  calculateLevel,
  extractJSON 
};
