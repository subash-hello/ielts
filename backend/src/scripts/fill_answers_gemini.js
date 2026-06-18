const mongoose = require('mongoose');
require('dotenv').config({ path: '../../.env' });
const TestContent = require('../models/TestContent');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Use gemini-1.5-flash which has a higher rate limit / might be more stable
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fillAnswers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const listeningTests = await TestContent.find({ subType: 'listening' });
    let updatedCount = 0;

    for (const test of listeningTests) {
      if (!test.content || !test.content.parts) continue;
      
      let modified = false;
      for (const part of test.content.parts) {
        if (!part.questions) continue;
        
        const missingQs = part.questions.filter(q => q.correctAnswer === "Answer not provided in database" || q.correctAnswer === "");
        if (missingQs.length === 0) continue;

        console.log(`Processing test ${test._id}, part ${part.part} with ${missingQs.length} missing answers...`);
        
        const transcript = part.transcript || 'No transcript provided.';
        const prompt = `You are an expert English teacher. I will provide a transcript of an audio recording, and a list of questions (fill-in-the-blank, multiple choice, matching, or map labeling) based on that recording.
        
TRANSCRIPT:
${transcript}

QUESTIONS:
${JSON.stringify(missingQs.map(q => ({ id: q.id, type: q.type, text: q.text, options: q.options })), null, 2)}

Your task is to identify the CORRECT ANSWER for each question based on the transcript.
- For fill-in-the-blank, provide the EXACT words (1-3 words max).
- For multiple choice or matching, provide the correct option text or letter.
- If you genuinely cannot determine the answer from the text, write "Unknown".

Return a STRICT JSON object where keys are the question IDs, and values are the correct answer string. Do not include markdown formatting or backticks.
Example: {"c17t4q38": "steam", "c17t4q39": "cloudy"}
`;

        let success = false;
        for(let attempt = 1; attempt <= 3; attempt++) {
          try {
            console.log(`Hitting Gemini API... (Attempt ${attempt})`);
            const result = await model.generateContent(prompt);
            const responseText = result.response.text();
            let cleanJson = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
            // Sometimes it wraps in {} but sometimes misses. Let's try parsing.
            const answers = JSON.parse(cleanJson);

            for (const q of part.questions) {
              if (answers[q.id] && answers[q.id] !== "Unknown") {
                q.correctAnswer = answers[q.id];
                modified = true;
              }
            }
            success = true;
            break; // Break the retry loop
          } catch (apiErr) {
            console.error(`Failed on attempt ${attempt}:`, apiErr.message);
            await sleep(25000); // wait 25 seconds before retry
          }
        }
        
        if(success) {
           console.log(`Successfully mapped answers for test ${test._id} part ${part.part}`);
        }
        await sleep(6000); // 6 second delay between parts to avoid rate limits
      }

      if (modified) {
        test.markModified('content');
        await test.save();
        updatedCount++;
        console.log(`Saved test ${test._id} to DB.`);
      }
    }

    console.log(`Successfully completed! Updated ${updatedCount} tests.`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

fillAnswers();
