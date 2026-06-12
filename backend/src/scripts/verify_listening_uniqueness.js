const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const TestContent = require('../models/TestContent');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const verify = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ielts-ai';
    await mongoose.connect(mongoUri);
    
    const tasks = await TestContent.find({ type: 'practice_task', subType: 'listening' });
    console.log('Total seeded listening practice tasks:', tasks.length);
    
    // Sample a few sets
    const setsToCheck = [1, 2, 3, 4, 5, 10, 25, 45];
    for (let setNum of setsToCheck) {
      const task = tasks.find(t => t.title.includes(`(Set ${setNum})`));
      if (task) {
        console.log(`\n--- ${task.title} ---`);
        console.log('Difficulty:', task.difficulty);
        console.log('Section:', task.content.section);
        console.log('Type:', task.content.type);
        console.log('Transcript Snippet:', task.content.transcript ? task.content.transcript.slice(0, 150) + '...' : 'N/A');
        console.log('Questions count:', task.content.questions ? task.content.questions.length : 0);
        if (task.content.questions && task.content.questions.length > 0) {
          const firstQ = task.content.questions[0];
          console.log(`  Q1: "${firstQ.text}" (Type: ${firstQ.type})`);
          if (firstQ.mapImage) {
            console.log(`  Map Image: ${firstQ.mapImage}`);
          }
        }
      } else {
        console.log(`Could not find task for Set ${setNum}`);
      }
    }
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

verify();
