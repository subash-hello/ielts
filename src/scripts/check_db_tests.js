const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const TestContent = require('../models/TestContent');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const check = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ielts-ai';
    console.log('Connecting to:', mongoUri);
    await mongoose.connect(mongoUri);
    
    const count = await TestContent.countDocuments({});
    console.log('Total TestContent count in DB:', count);
    
    const mockTests = await TestContent.find({ type: 'mock_test' });
    console.log('Mock tests in DB:', mockTests.length);
    if (mockTests.length > 0) {
      console.log('First Mock Test title:', mockTests[0].title);
      console.log('First Mock Test content keys:', Object.keys(mockTests[0].content || {}));
      if (mockTests[0].content) {
        console.log('First Mock Test listeningParts length:', mockTests[0].content.listeningParts ? mockTests[0].content.listeningParts.length : 'undefined');
        console.log('First Mock Test parts length:', mockTests[0].content.parts ? mockTests[0].content.parts.length : 'undefined');
      }
    }
    
    const practiceTasks = await TestContent.find({ type: 'practice_task' });
    console.log('Practice tasks in DB:', practiceTasks.length);
    if (practiceTasks.length > 0) {
      console.log('First few practice tasks subTypes:', practiceTasks.slice(0, 5).map(t => `${t.title} (${t.subType})`));
    }
    
    process.exit(0);
  } catch (err) {
    console.error('Error checking DB:', err);
    process.exit(1);
  }
};

check();
