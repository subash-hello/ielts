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
    
    const tests = await TestContent.find({ type: 'practice_task', subType: 'listening' });
    let badCount = 0;
    
    tests.forEach((t) => {
      t.content.parts.forEach((p) => {
        p.questions.forEach((q, qidx) => {
          if (q.text && (q.text.includes('()') || q.text.includes('(11)') || q.text.includes('Question ' + (qidx+1)))) {
            console.log(`❌ Bad Question: Test="${t.title}", Part=${p.part}, Q=${(p.part-1)*10 + qidx + 1}, Text="${q.text}"`);
            badCount++;
          }
        });
      });
    });
    
    if (badCount === 0) {
      console.log('✅ All tests checked. No bad questions found in the database!');
    } else {
      console.log(`⚠️ Found ${badCount} bad questions.`);
    }
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

check();
