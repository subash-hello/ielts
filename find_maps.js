const mongoose = require('mongoose');
const dotenv = require('dotenv');
const TestContent = require('./src/models/TestContent');

dotenv.config();

async function findMaps() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const tests = await TestContent.find({
    type: 'practice_task',
    subType: 'listening',
    title: /Cambridge IELTS (1[0-7])/
  }).sort({ title: 1 });

  let missingMaps = [];

  for (const test of tests) {
    let hasMap = false;
    for (let i = 0; i < test.content.parts.length; i++) {
      const part = test.content.parts[i];
      const hasMatching = part.questions.some(q => q.type === 'matching');
      if (hasMatching && !part.imageUrl) {
        // Collect question texts to help identify the map
        const questions = part.questions.filter(q => q.type === 'matching').map(q => q.text).join(', ');
        missingMaps.push({
          testId: test._id,
          title: test.title,
          part: i + 1,
          questions
        });
      }
    }
  }

  console.log(JSON.stringify(missingMaps, null, 2));
  process.exit(0);
}

findMaps();
