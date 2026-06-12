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
    
    const tests = await TestContent.find({ type: 'practice_task', subType: 'listening' }).sort({ title: 1 });
    tests.forEach((t) => {
      console.log(`\n========================================`);
      console.log(`Title: ${t.title}`);
      t.content.parts.forEach((p) => {
        console.log(`  Part ${p.part}:`);
        console.log(`    Questions count: ${p.questions?.length}`);
        p.questions.slice(0, 3).forEach((q, qidx) => {
          console.log(`      Q${(p.part-1)*10 + qidx + 1} (${q.type}): Text="${q.text}" Ans="${q.correctAnswer}"`);
        });
      });
    });
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

check();
