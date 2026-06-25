const mongoose = require('mongoose');
const TestContent = require('../models/TestContent');
const cambridgeListeningTests = require('../data/cambridgeListeningTests');
require('dotenv').config({ path: __dirname + '/../../.env' });

const seedAdditionalCambridgeTests = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ielts-ai';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    let addedCount = 0;

    for (let i = 1; i <= 30; i++) {
      const cambridgeTest = cambridgeListeningTests[i.toString()];
      if (!cambridgeTest) continue;

      // Check if it already exists to avoid duplicates
      const exists = await TestContent.findOne({ title: cambridgeTest.title, type: 'practice_task' });
      if (exists) {
        console.log(`Test ${cambridgeTest.title} already exists. Skipping.`);
        continue;
      }

      const listeningTask = new TestContent({
        title: cambridgeTest.title,
        type: 'practice_task',
        subType: 'listening',
        difficulty: cambridgeTest.difficulty || 'medium',
        duration: 30,
        content: {
          parts: cambridgeTest.parts
        },
        tags: ['cambridge', 'listening', 'academic'],
        metadata: { source: 'cambridge_ielts' }
      });

      await listeningTask.save();
      addedCount++;
      console.log(`Successfully added: ${cambridgeTest.title}`);
    }

    console.log(`Finished adding ${addedCount} Cambridge listening tests without deleting existing data.`);
    process.exit(0);
  } catch (err) {
    console.error('Error seeding additional cambridge tests:', err);
    process.exit(1);
  }
};

seedAdditionalCambridgeTests();
