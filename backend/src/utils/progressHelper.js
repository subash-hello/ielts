const Progress = require('../models/Progress');
const Session = require('../models/Session');

const recordActivity = async ({ userId, module, type = 'practice', score, feedback, timeSpent = 15, data = {} }) => {
  try {
    // 1. Create and save Session
    const session = new Session({
      userId,
      module,
      type,
      score,
      feedback,
      data
    });
    await session.save();

    // 2. Fetch and update Progress
    const progressDoc = await Progress.findOne({ userId, module });
    const currentScores = progressDoc ? [...progressDoc.scores, score] : [score];
    const averageBand = Number((currentScores.reduce((sum, s) => sum + s, 0) / currentScores.length).toFixed(1));

    await Progress.findOneAndUpdate(
      { userId, module },
      {
        $push: { 
          scores: score, 
          history: { 
            score, 
            feedback, 
            sessionId: session._id,
            date: new Date()
          } 
        },
        $set: { averageBand },
        $inc: { totalSessions: 1, totalTimeMinutes: timeSpent }
      },
      { upsert: true, new: true }
    );

    return session;
  } catch (error) {
    console.error(`Error recording activity for user ${userId} on module ${module}:`, error.message);
    return null;
  }
};

module.exports = { recordActivity };
