const fs = require('fs');
const path = 'c:/Users/subas/OneDrive/Documents/projects/ielts/frontend/src/app/(dashboard)/listening/practice/page.tsx';
const content = fs.readFileSync(path, 'utf8');
const lines = content.split('\n');

console.log('Searching listening practice page for api/fallback/mock-test/mockTestsData...');
lines.forEach((line, idx) => {
  if (line.includes('api.get') || line.includes('api.post') || line.includes('fallback') || line.includes('mockTestsData') || line.includes('mockTests[')) {
    console.log(`L${idx+1}: ${line.trim()}`);
  }
});
