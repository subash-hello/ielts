const cambridge = require('../data/cambridgeListeningTests');
const seen = new Set();
console.log('Total keys:', Object.keys(cambridge).length);
for (let id of Object.keys(cambridge)) {
  const t = cambridge[id];
  const firstPartTitle = t.parts && t.parts[0] ? t.parts[0].title : '';
  seen.add(firstPartTitle);
  console.log(`Test ${id}: ${t.title} -> First Part: "${firstPartTitle}"`);
}
console.log('Number of unique first parts:', seen.size);
