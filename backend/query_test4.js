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
    
    const count = await TestContent.countDocuments();
    console.log(`Total documents in TestContent: ${count}`);

    const test4 = await TestContent.findOne({ title: /Cambridge IELTS Listening Test 4/i });
    if (!test4) {
      console.log('❌ Cambridge IELTS Listening Test 4 not found in database!');
    } else {
      console.log('✅ Found Test 4:');
      console.log('ID:', test4._id);
      console.log('Title:', test4.title);
      console.log('Type:', test4.type);
      console.log('SubType:', test4.subType);
      console.log('Difficulty:', test4.difficulty);
      
      console.log('Parts count:', test4.content.parts.length);
      test4.content.parts.forEach(p => {
        console.log(`- Part ${p.part}: ${p.title}`);
        console.log(`  AudioUrl: ${p.audioUrl}`);
        console.log(`  Questions count: ${p.questions.length}`);
        console.log(`  First question text: ${p.questions[0]?.text}`);
        console.log(`  First question type: ${p.questions[0]?.type}`);
        console.log(`  First question correctAnswer: ${p.questions[0]?.correctAnswer}`);
      });
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

check();
