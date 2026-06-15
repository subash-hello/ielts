const mongoose = require('mongoose');
const TestContent = require('../models/TestContent');
const cambridgeListeningTests = require('../data/cambridgeListeningTests');
require('dotenv').config({ path: __dirname + '/../../.env' });

const updateTests = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ielts-ai';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    for (let i = 1; i <= 30; i++) {
      const cambridgeTest = cambridgeListeningTests[i.toString()];
      if (!cambridgeTest) continue;

      await TestContent.updateOne(
        { title: cambridgeTest.title, type: 'practice_task' },
        { $set: { "content.parts": cambridgeTest.parts } }
      );
      console.log(`Updated Test ${cambridgeTest.title}`);
    }

    console.log('Done!');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

updateTests();
