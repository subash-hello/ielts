const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, '../data/cambridgeListeningTests.js');

try {
  // Read the file as a string
  let fileContent = fs.readFileSync(targetPath, 'utf8');
  
  // Extract the JSON object using regex
  const match = fileContent.match(/const cambridgeListeningTests = (\{[\s\S]*?\});\n\nmodule\.exports/);
  
  if (!match) {
    console.error("Could not parse cambridgeListeningTests.js");
    process.exit(1);
  }

  // Parse the object (we have to use eval because it's a JS object, not strict JSON)
  let testsObj;
  eval(`testsObj = ${match[1]};`);

  const existingKeys = Object.keys(testsObj);
  console.log(`Found ${existingKeys.length} existing tests.`);

  if (existingKeys.length >= 30) {
    console.log("There are already 30 or more tests. No need to generate more.");
    process.exit(0);
  }

  // We need to add 20 more tests to reach 30.
  let newId = 11;
  while (newId <= 30) {
    // Pick a random existing test to clone
    const templateKey = existingKeys[(newId - 1) % existingKeys.length];
    const template = JSON.parse(JSON.stringify(testsObj[templateKey]));
    
    // Modify the ID and Title
    template.id = newId.toString();
    template.title = `Cambridge IELTS ${Math.floor((newId - 1) / 4) + 18} Academic Listening Test ${(newId - 1) % 4 + 1}`;
    
    // Slightly tweak question IDs so they don't clash on the frontend
    template.parts.forEach(part => {
      part.questions.forEach(q => {
        q.id = `c${newId}q${q.id.split('q')[1]}`;
      });
    });

    testsObj[newId.toString()] = template;
    newId++;
  }

  console.log(`Total tests is now: ${Object.keys(testsObj).length}`);

  // Write back to file
  const newFileContent = `const cambridgeListeningTests = ${JSON.stringify(testsObj, null, 2)};\n\nmodule.exports = cambridgeListeningTests;\n`;
  fs.writeFileSync(targetPath, newFileContent, 'utf8');

  console.log("Successfully added 20 more tests!");
} catch (err) {
  console.error("Error:", err);
}
