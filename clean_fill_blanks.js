const mongoose = require('mongoose');
const dotenv = require('dotenv');
const TestContent = require('./src/models/TestContent');

dotenv.config();

async function cleanFillBlanks() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const tests = await TestContent.find({
    type: 'practice_task',
    subType: 'listening'
  });

  let updatedCount = 0;

  for (const test of tests) {
    let modified = false;
    const parts = test.content.parts;

    for (let pIdx = 0; pIdx < parts.length; pIdx++) {
      const questions = parts[pIdx].questions;

      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];

        if (q.type === 'fillBlank') {
          // Look ahead to the next question to see if its text is embedded in this one's text
          let truncated = false;

          // Try matching next question's text
          for (let j = i + 1; j < questions.length; j++) {
            const nextQ = questions[j];
            if (nextQ.type === 'fillBlank') {
              // Strip underscores and trim
              let nextTextClean = nextQ.text.replace(/_+/g, '').trim();
              
              // If the next question's text is very short, it might cause false positives.
              // Let's take the first 15 chars if it's long.
              if (nextTextClean.length > 15) {
                  nextTextClean = nextTextClean.substring(0, 15);
              }

              if (nextTextClean.length > 3 && q.text.includes(nextTextClean)) {
                q.text = q.text.substring(0, q.text.indexOf(nextTextClean)).trim();
                modified = true;
                truncated = true;
                break;
              }
            }
          }

          // If not truncated by next question's text, try to truncate by "(N)"
          if (!truncated) {
             // Find any (12) or ( 12 ) that is greater than current question index
             // We can't know exact question number easily without global index, 
             // but we can look for (\\d+) and if it exists and text is long...
             const match = q.text.match(/\(\s*(\d+)\s*\)/);
             if (match && q.text.length > 100) {
                 const numStr = match[0];
                 const idx = q.text.indexOf(numStr);
                 if (idx > 10) {
                     // check if there's a preceding word boundary or capital letter
                     // Just truncate it
                     q.text = q.text.substring(0, idx).trim();
                     modified = true;
                 }
             }
          }
        }
      }
    }

    if (modified) {
      await TestContent.updateOne(
        { _id: test._id },
        { $set: { "content.parts": parts } }
      );
      updatedCount++;
      console.log(`Cleaned test: ${test.title}`);
    }
  }

  console.log(`Finished cleaning. Updated ${updatedCount} tests.`);
  process.exit(0);
}

cleanFillBlanks();
