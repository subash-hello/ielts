const fs = require('fs');
const path = require('path');

const file1 = path.join(__dirname, 'src/data/cambridgeListeningTests.js');
const file2 = path.join(__dirname, 'src/data/cambridgeTenTests.js');

if (!fs.existsSync('scrapedTests.json')) {
  console.error('❌ scrapedTests.json not found!');
  process.exit(1);
}

const scrapedData = JSON.parse(fs.readFileSync('scrapedTests.json', 'utf8'));

// Update cambridgeListeningTests.js
if (fs.existsSync(file1)) {
  const file1Content = `const cambridgeListeningTests = ${JSON.stringify(scrapedData, null, 2)};\n\nmodule.exports = cambridgeListeningTests;\n`;
  fs.writeFileSync(file1, file1Content, 'utf8');
  console.log('✅ Successfully applied scraped tests to cambridgeListeningTests.js');
} else {
  console.error('❌ cambridgeListeningTests.js not found at:', file1);
}

// Update cambridgeTenTests.js
if (fs.existsSync(file2)) {
  const file2Content = `module.exports = ${JSON.stringify(scrapedData, null, 2)};\n`;
  fs.writeFileSync(file2, file2Content, 'utf8');
  console.log('✅ Successfully applied scraped tests to cambridgeTenTests.js');
} else {
  console.error('❌ cambridgeTenTests.js not found at:', file2);
}

console.log('🎉 Done applying data!');
