const fs = require('fs');
const file = 'c:/Users/subas/OneDrive/Documents/projects/ielts/frontend/src/app/(dashboard)/listening/practice/page.tsx';

if (fs.existsSync(file)) {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  console.log('Searching map rendering in listening practice UI...');
  lines.forEach((line, idx) => {
    if (line.includes('mapLabeling') || line.includes('mapImage') || line.includes('Map')) {
      if (line.trim().length > 5 && line.trim().length < 200) {
        console.log(`L${idx+1}: ${line.trim()}`);
      }
    }
  });
} else {
  console.log('File not found.');
}
