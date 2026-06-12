const fs = require('fs');
const file = 'c:/Users/subas/OneDrive/Documents/projects/ielts/frontend/src/app/(dashboard)/listening/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const newSections = `const sections = [
  { id: 1, title: 'Section 1: Hotel Booking', desc: 'A conversation between two people set in an everyday social context.', duration: '5-7 min', color: 'from-violet-500 to-accent-bright', type: 'Conversation' },
  { id: 2, title: 'Section 2: Campus Library Tour', desc: 'A monologue set in an everyday social context.', duration: '5-7 min', color: 'from-accent to-blue-500', type: 'Monologue' },
  { id: 3, title: 'Section 3: Biology Project Discussion', desc: 'A conversation between up to four people set in an educational or training context.', duration: '5-7 min', color: 'from-neon to-cyan-400', type: 'Academic Discussion' },
  { id: 4, title: 'Section 4: Marine Biology Lecture', desc: 'A monologue on an academic subject.', duration: '5-7 min', color: 'from-pink-500 to-rose-400', type: 'Academic Lecture' },
  { id: 5, title: 'Section 1: Travel Agency', desc: 'A conversation between two people set in an everyday social context.', duration: '5-7 min', color: 'from-emerald-500 to-teal-400', type: 'Conversation' },
  { id: 6, title: 'Section 2: Local Museum Guide', desc: 'A monologue set in an everyday social context.', duration: '5-7 min', color: 'from-orange-500 to-amber-400', type: 'Monologue' },
  { id: 7, title: 'Section 3: Group Assignment', desc: 'A conversation between up to four people set in an educational or training context.', duration: '5-7 min', color: 'from-indigo-500 to-purple-400', type: 'Academic Discussion' },
  { id: 8, title: 'Section 4: History of Architecture', desc: 'A monologue on an academic subject.', duration: '5-7 min', color: 'from-red-500 to-orange-500', type: 'Academic Lecture' },
  { id: 9, title: 'Section 1: Renting an Apartment', desc: 'A conversation between two people set in an everyday social context.', duration: '5-7 min', color: 'from-green-500 to-emerald-600', type: 'Conversation' },
  { id: 10, title: 'Section 2: Radio Broadcast', desc: 'A monologue set in an everyday social context.', duration: '5-7 min', color: 'from-cyan-500 to-blue-600', type: 'Monologue' }
];`;

content = content.replace(/const sections = \[[\s\S]*?\];/, newSections);

fs.writeFileSync(file, content);
console.log('Listening UI updated');
