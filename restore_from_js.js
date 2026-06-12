const fs = require('fs');
const path = require('path');

const cambridgeListeningTests = require('./src/data/cambridgeListeningTests');

fs.writeFileSync('scrapedTests.json', JSON.stringify(cambridgeListeningTests, null, 2), 'utf8');
console.log('Restored scrapedTests.json from cambridgeListeningTests.js!');
