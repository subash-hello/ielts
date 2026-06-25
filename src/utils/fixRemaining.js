const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../data/cambridgeListeningTests.js');
let fileContent = fs.readFileSync(filePath, 'utf8');

const tests = require('../data/cambridgeListeningTests');

const run = () => {
  let modifications = 0;

  for (const [testKey, test] of Object.entries(tests)) {
    test.parts.forEach(part => {
      part.questions.forEach(q => {
        if (q.type === 'fillBlank' && q.correctAnswer && q.correctAnswer.length === 1 && /[A-J]/.test(q.correctAnswer)) {
          const qIdStr = `"id": "${q.id}"`;
          const qIndex = fileContent.indexOf(qIdStr);
          if (qIndex !== -1) {
            const startIdx = fileContent.lastIndexOf('{', qIndex);
            const endIdx = fileContent.indexOf('}', qIndex) + 1;
            const block = fileContent.slice(startIdx, endIdx);
            
            let newBlock = block.replace(/"type":\s*"fillBlank"/, `"type": "matching"`);
            
            // Remove trailing underscores from the text
            newBlock = newBlock.replace(/"text":\s*"([^"]+?)_+"/, `"text": "$1"`);
            
            // Inject generic options before correctAnswer
            const options = [
              "A. Option A", "B. Option B", "C. Option C", "D. Option D",
              "E. Option E", "F. Option F", "G. Option G", "H. Option H"
            ];
            const optionsStr = `"options": [\n              ` + options.map(o => `"${o}"`).join(',\n              ') + `\n            ],\n            "correctAnswer"`;
            newBlock = newBlock.replace(/"correctAnswer"/, optionsStr);

            fileContent = fileContent.slice(0, startIdx) + newBlock + fileContent.slice(endIdx);
            modifications++;
          }
        }
      });
    });
  }

  if (modifications > 0) {
    fs.writeFileSync(filePath, fileContent, 'utf8');
    console.log(`Successfully made ${modifications} fallback modifications.`);
  } else {
    console.log('No modifications made.');
  }
};

run();
