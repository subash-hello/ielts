const fs = require('fs');
const path = 'c:/Users/subas/OneDrive/Documents/projects/ielts/frontend/src/app/(dashboard)/mock-test/exam/page.tsx';
const content = fs.readFileSync(path, 'utf8');
const lines = content.split('\n');

console.log('Searching mock-test exam page for api calls/fallbacks...');
lines.forEach((line, idx) => {
  if (line.includes('api.get') || line.includes('api.post') || line.includes('fallback') || line.includes('mockTestsData') || line.includes('mockTests[')) {
    console.log(`L${idx+1}: ${line.trim()}`);
  }
});
