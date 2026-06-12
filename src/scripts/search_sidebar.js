const fs = require('fs');
const path = require('path');
const file = 'c:/Users/subas/OneDrive/Documents/projects/ielts/frontend/src/app/(dashboard)/layout.tsx';

if (fs.existsSync(file)) {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    if (line.includes('href') || line.includes('label') || line.includes('icon')) {
      if (line.trim().length > 5 && line.trim().length < 150) {
        console.log(`L${idx+1}: ${line.trim()}`);
      }
    }
  });
} else {
  console.log('Layout file not found.');
}
