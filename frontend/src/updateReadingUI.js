const fs = require('fs');
const file = 'c:/Users/subas/OneDrive/Documents/projects/ielts/frontend/src/app/(dashboard)/reading/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const newPassages = `const passages = [
  { id: 1, title: 'The Impact of Climate Change on Marine Ecosystems', topic: 'Environment', difficulty: 'Hard', length: '950 words', duration: '20 min', color: 'from-accent to-blue-500' },
  { id: 2, title: 'The Evolution of Artificial Intelligence', topic: 'Technology', difficulty: 'Medium', length: '850 words', duration: '20 min', color: 'from-accent-bright to-violet-500' },
  { id: 3, title: 'Ancient Egyptian Architecture', topic: 'History', difficulty: 'Hard', length: '900 words', duration: '20 min', color: 'from-neon to-cyan-500' },
  { id: 4, title: 'The Psychology of Decision Making', topic: 'Science', difficulty: 'Medium', length: '800 words', duration: '20 min', color: 'from-pink-500 to-rose-400' },
  { id: 5, title: 'Urbanization and its Effects', topic: 'Society', difficulty: 'Medium', length: '850 words', duration: '20 min', color: 'from-emerald-500 to-teal-400' },
  { id: 6, title: 'The Future of Renewable Energy', topic: 'Environment', difficulty: 'Hard', length: '920 words', duration: '20 min', color: 'from-orange-500 to-amber-400' },
  { id: 7, title: 'Linguistic Diversity in the Modern World', topic: 'Culture', difficulty: 'Medium', length: '880 words', duration: '20 min', color: 'from-indigo-500 to-purple-400' },
  { id: 8, title: 'Space Exploration in the 21st Century', topic: 'Science', difficulty: 'Hard', length: '930 words', duration: '20 min', color: 'from-red-500 to-orange-500' },
  { id: 9, title: 'The Economics of Globalization', topic: 'Business', difficulty: 'Hard', length: '900 words', duration: '20 min', color: 'from-green-500 to-emerald-600' },
  { id: 10, title: 'History of the Printing Press', topic: 'History', difficulty: 'Medium', length: '820 words', duration: '20 min', color: 'from-cyan-500 to-blue-600' }
];`;

content = content.replace(/const passages = \[[\s\S]*?\];/, newPassages);

fs.writeFileSync(file, content);
console.log('Reading UI updated');
