const fs = require('fs');
const path = require('path');

const processFile = (filePath) => {
  if (!fs.existsSync(filePath)) return;
  let fileContent = fs.readFileSync(filePath, 'utf8');
  const testsMatch = fileContent.match(/(=|module\.exports\s*=)\s*({.*});?/s);
  if (!testsMatch) return;
  const tests = JSON.parse(testsMatch[2]);

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
            const options = ["A", "B", "C", "D", "E", "F", "G", "H"];
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
    console.log(`Successfully made ${modifications} fallback modifications in ${path.basename(filePath)}.`);
  } else {
    console.log(`No modifications made in ${path.basename(filePath)}.`);
  }
};

const run = () => {
  const filePath1 = path.join(__dirname, '../data/cambridgeListeningTests.js');
  const filePath2 = path.join(__dirname, '../data/cambridgeTenTests.js');
  processFile(filePath1);
  processFile(filePath2);
};

run();

run();
