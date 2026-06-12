const fs = require('fs');
const file = 'c:/Users/subas/OneDrive/Documents/projects/ielts/backend/src/data/cambridgeListeningTests.js';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(/^module\.exports = \{ " 1\\: \{/, 'module.exports = { "1": {');
fs.writeFileSync(file, content);
