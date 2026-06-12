const fs = require('fs');

const content = fs.readFileSync('c:\\Users\\subas\\OneDrive\\Documents\\projects\\ielts\\frontend\\src\\app\\(dashboard)\\mock-test\\exam\\page.tsx', 'utf8');

const lines = content.split('\n');
lines.forEach((line, idx) => {
  if (line.includes('<input') || line.includes('<textarea')) {
    console.log(`Line ${idx + 1}: ${line.trim()}`);
  }
});
