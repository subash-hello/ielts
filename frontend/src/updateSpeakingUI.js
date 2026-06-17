const fs = require('fs');
const file = 'c:/Users/subas/OneDrive/Documents/projects/ielts/frontend/src/app/(dashboard)/speaking/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const newParts = `const practiceTopics = [
  { id: 1, part: 1, title: 'Hometown & Living Area', desc: 'Answer simple questions about where you live.', duration: '4 min', color: 'from-violet-500 to-accent-bright' },
  { id: 2, part: 1, title: 'Work & Studies', desc: 'Talk about your current occupation or education.', duration: '4 min', color: 'from-accent to-blue-500' },
  { id: 3, part: 1, title: 'Hobbies & Free Time', desc: 'Discuss what you enjoy doing in your spare time.', duration: '5 min', color: 'from-neon to-cyan-400' },
  { id: 4, part: 2, title: 'Describe a Person', desc: 'Speak for 2 minutes about someone you admire.', duration: '3 min', color: 'from-pink-500 to-rose-400' },
  { id: 5, part: 2, title: 'Describe a Place', desc: 'Describe a memorable place you have visited.', duration: '3 min', color: 'from-emerald-500 to-teal-400' },
  { id: 6, part: 2, title: 'Describe an Object', desc: 'Talk about an important possession you own.', duration: '4 min', color: 'from-orange-500 to-amber-400' },
  { id: 7, part: 2, title: 'Describe an Event', desc: 'Speak about a historical or personal event.', duration: '4 min', color: 'from-indigo-500 to-purple-400' },
  { id: 8, part: 3, title: 'Technology & Society', desc: 'Discuss the abstract impacts of modern tech.', duration: '5 min', color: 'from-red-500 to-orange-500' },
  { id: 9, part: 3, title: 'Environment', desc: 'Analytical discussion about climate and nature.', duration: '5 min', color: 'from-green-500 to-emerald-600' },
  { id: 10, part: 3, title: 'Education Trends', desc: 'Evaluate the future of schools and learning.', duration: '5 min', color: 'from-cyan-500 to-blue-600' }
];`;

content = content.replace(/const parts = \[[\s\S]*?\];/, newParts);

content = content.replace(/parts\.map\(\(p\) => \(/g, 'practiceTopics.map((p) => (');
content = content.replace(/key=\{p\.part\}/g, 'key={p.id}');
content = content.replace(/<p\.icon className="w-6 h-6 text-white" \/>/g, '<MessageSquare className="w-6 h-6 text-white" />');
content = content.replace(/Part \{p\.part\}/g, 'Part {p.part}: Practice {p.id}');
content = content.replace(/\{p\.sessions\} sessions/g, '{p.title}');
content = content.replace(/href=\{\`\/speaking\/practice\?part=\$\{p\.part\}\`\}/g, 'href={`/speaking/practice?part=${p.part}&topic=${encodeURIComponent(p.title)}`}');

fs.writeFileSync(file, content);
console.log('Speaking UI updated');
