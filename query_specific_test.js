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
    
    const doc = await TestContent.findOne({ title: /Cambridge IELTS Listening Test 2/i, type: 'practice_task', subType: 'listening' });
    if (!doc) {
      console.log('Document not found in database!');
    } else {
      console.log('Document ID:', doc._id);
      console.log('Document Title:', doc.title);
      console.log('Document Type:', doc.type);
      console.log('Document SubType:', doc.subType);
      
      const part2 = doc.content?.parts?.find(p => p.part === 2);
      if (part2) {
        console.log('Part 2 Questions:');
        part2.questions.forEach((q, idx) => {
          console.log(`  Index ${idx}: ID="${q.id}" Type="${q.type}" Text="${q.text}" Ans="${q.correctAnswer}"`);
        });
      } else {
        console.log('Part 2 not found in document!');
      }
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

check();
