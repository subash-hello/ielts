const mongoose = require('mongoose');
const TestContent = require('../models/TestContent');
const cambridgeListeningTests = require('../data/cambridgeListeningTests');
require('dotenv').config({ path: 'C:/Users/subas/OneDrive/Documents/projects/ielts/backend/.env' });

const fixDb = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');
    const test5 = cambridgeListeningTests['5'];
    
    await TestContent.updateOne(
      { _id: '6a2bed70f8e850f120b9312e' },
      { $set: { "content.parts": test5.parts } }
    );
    console.log('Successfully updated DB with Test 5 parts.');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

fixDb();
