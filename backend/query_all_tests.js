const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const TestContent = require('./src/models/TestContent');

const check = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ielts-ai';
    console.log('Connecting to MongoDB at:', mongoUri);
    await mongoose.connect(mongoUri);
    
    const count = await TestContent.countDocuments({ type: 'practice_task', subType: 'listening' });
    console.log(`Total listening practice tests in TestContent: ${count}`);

    const tests = await TestContent.find({ type: 'practice_task', subType: 'listening' }).sort({ title: 1 });
    tests.forEach((t, idx) => {
      console.log(`\nTest #${idx + 1}:`);
      console.log('  Title:', t.title);
      console.log('  Difficulty:', t.difficulty);
      console.log('  Parts count:', t.content.parts?.length || 0);
      if (t.content.parts && t.content.parts[0]) {
        console.log('  Part 1 Title:', t.content.parts[0].title);
        console.log('  Part 1 Audio:', t.content.parts[0].audioUrl);
        console.log('  Part 1 Questions count:', t.content.parts[0].questions?.length || 0);
        console.log('  Part 1 First question text:', t.content.parts[0].questions?.[0]?.text);
        console.log('  Part 1 First question answer:', t.content.parts[0].questions?.[0]?.correctAnswer);
      }
    });
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

check();
