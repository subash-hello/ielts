const mongoose = require('mongoose');
require('dotenv').config({ path: '../../.env' }); // We'll run it from backend/src/scripts
const TestContent = require('../models/TestContent');

async function fixEmptyAnswers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const listeningTests = await TestContent.find({ subType: 'listening' });
    let updatedCount = 0;

    for (const test of listeningTests) {
      if (!test.content || !test.content.parts) continue;
      
      let modified = false;
      test.content.parts.forEach(part => {
        if (part.questions) {
          part.questions.forEach(q => {
            if (q.correctAnswer === "" || q.correctAnswer === undefined || q.correctAnswer === null) {
              q.correctAnswer = "Answer not provided in database";
              modified = true;
            }
          });
        }
      });

      if (modified) {
        test.markModified('content');
        await test.save();
        updatedCount++;
      }
    }

    console.log(`Updated ${updatedCount} listening tests with empty answers.`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

fixEmptyAnswers();
