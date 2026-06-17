const fs = require('fs');
const file = 'c:/Users/subas/OneDrive/Documents/projects/ielts/frontend/src/app/(dashboard)/writing/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const newTasks = `const practiceTasks = [
  { id: 1, type: 1, title: 'Task 1: Bar Chart', desc: 'Describe a bar chart comparing energy consumption.', duration: '20 min', words: '150+', color: 'from-accent to-blue-500' },
  { id: 2, type: 1, title: 'Task 1: Line Graph', desc: 'Analyze a line graph showing population trends.', duration: '20 min', words: '150+', color: 'from-blue-500 to-cyan-500' },
  { id: 3, type: 1, title: 'Task 1: Pie Chart', desc: 'Compare household expenditure using pie charts.', duration: '20 min', words: '150+', color: 'from-cyan-500 to-teal-500' },
  { id: 4, type: 1, title: 'Task 1: Map', desc: 'Describe changes in a town map over 10 years.', duration: '20 min', words: '150+', color: 'from-teal-500 to-emerald-500' },
  { id: 5, type: 1, title: 'Task 1: Process Diagram', desc: 'Explain the process of recycling plastic bottles.', duration: '20 min', words: '150+', color: 'from-emerald-500 to-green-500' },
  { id: 6, type: 2, title: 'Task 2: Education', desc: 'Discuss views on technology replacing teachers.', duration: '40 min', words: '250+', color: 'from-accent-bright to-pink-400' },
  { id: 7, type: 2, title: 'Task 2: Environment', desc: 'Essay about global warming and individual responsibility.', duration: '40 min', words: '250+', color: 'from-pink-400 to-rose-400' },
  { id: 8, type: 2, title: 'Task 2: Work & Life', desc: 'Discuss the concept of a four-day work week.', duration: '40 min', words: '250+', color: 'from-rose-400 to-red-500' },
  { id: 9, type: 2, title: 'Task 2: Health', desc: 'Essay on government tax on unhealthy foods.', duration: '40 min', words: '250+', color: 'from-red-500 to-orange-500' },
  { id: 10, type: 2, title: 'Task 2: Society', desc: 'Discuss the impact of social media on youth.', duration: '40 min', words: '250+', color: 'from-orange-500 to-amber-500' }
];`;

content = content.replace(/const taskTypes = \[[\s\S]*?\];/, newTasks);

content = content.replace(/taskTypes\.map\(\(t\) => \(/g, 'practiceTasks.map((t) => (');
content = content.replace(/key=\{t\.type\}/g, 'key={t.id}');
content = content.replace(/href=\{\`\/writing\/practice\?task=\$\{t\.type\}\`\}/g, 'href={`/writing/practice?task=${t.type}&topic=${encodeURIComponent(t.title)}`}');

fs.writeFileSync(file, content);
console.log('Writing UI updated');
