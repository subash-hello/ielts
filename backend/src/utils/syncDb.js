const mongoose = require('mongoose');
const TestContent = require('../models/TestContent');
const cambridgeListeningTests = require('../data/cambridgeListeningTests');
require('dotenv').config({ path: 'C:/Users/subas/OneDrive/Documents/projects/ielts/backend/.env' });

const syncDb = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    let updatedCount = 0;
    
    // We iterate over tests in the DB and update them if they match our title mapping
    const allDbTests = await TestContent.find({ type: 'practice_task', subType: 'listening' });
    
    for (let dbTest of allDbTests) {
      // Find matching test in cambridgeListeningTests.js
      let match = null;
      for (const [key, testData] of Object.entries(cambridgeListeningTests)) {
        if (dbTest.title === testData.title || dbTest.title === `Cambridge IELTS Listening Test ${key}`) {
          match = testData;
          break;
        }
      }
      
      if (match) {
        await TestContent.updateOne(
          { _id: dbTest._id },
          { $set: { "content.parts": match.parts, title: match.title } }
        );
        console.log(`Updated DB Test ${dbTest._id} to match ${match.title}`);
        updatedCount++;
      }
    }

    console.log(`Successfully synced ${updatedCount} tests!`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

syncDb();
