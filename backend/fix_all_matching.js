const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const db = mongoose.connection.db;
  const tests = await db.collection('testcontents').find({'type': 'practice_task', 'subType': 'listening'}).toArray();
  
  let totalFixed = 0;

  const genericOptions = [
    "A", "B", "C", "D", "E", "F", "G", "H", "I", "J"
  ];

  for (const test of tests) {
    let modified = false;

    test.content.parts.forEach((part) => {
      // Find consecutive sequences of fillBlank questions that have single-letter correct answers
      const questions = part.questions;
      
      for (let i = 0; i < questions.length; i++) {
        if (questions[i].type === 'fillBlank' && /^[A-J]$/i.test(questions[i].correctAnswer)) {
          // Check if this is part of a sequence
          let seqLength = 0;
          let j = i;
          let maxLetterCode = 65; // 'A'

          while (j < questions.length && questions[j].type === 'fillBlank' && /^[A-J]$/i.test(questions[j].correctAnswer)) {
            const letter = questions[j].correctAnswer.toUpperCase();
            if (letter.charCodeAt(0) > maxLetterCode) {
               maxLetterCode = letter.charCodeAt(0);
            }
            seqLength++;
            j++;
          }

          // If it's a sequence of at least 3 matching questions, convert them
          if (seqLength >= 2) {
            // How many options to provide? Provide A through the maximum letter found + maybe 1 or 2 more just in case.
            // A safer bet is to just provide A-G or A-I depending on max letter.
            let numOptions = maxLetterCode - 65 + 1;
            // Often there are more options than questions, let's add 2 padding options up to 'J'
            numOptions = Math.min(10, Math.max(numOptions + 2, seqLength + 2));
            const options = genericOptions.slice(0, numOptions);

            for (let k = i; k < j; k++) {
              questions[k].type = 'matching';
              questions[k].options = options;
              // Clean the text from bullet points or underscores
              questions[k].text = questions[k].text.replace(/_+/g, '').replace(/^•\s*/, '').trim();
            }
            modified = true;
            totalFixed += seqLength;
          }
          
          i = j - 1; // skip the sequence
        }
      }
    });

    if (modified) {
      await db.collection('testcontents').updateOne({ _id: test._id }, { $set: { "content.parts": test.content.parts } });
      console.log(`Updated test: ${test.title}`);
    }
  }

  console.log(`Successfully fixed ${totalFixed} matching questions across all tests.`);
  process.exit(0);
});
