const cambridge = require('../data/cambridgeListeningTests');
console.log('Number of tests loaded:', Object.keys(cambridge).length);
for (let id of Object.keys(cambridge)) {
  const t = cambridge[id];
  console.log(`Test ${id}: ${t.title}`);
  if (t.parts && t.parts.length > 0) {
    t.parts.forEach((p, idx) => {
      console.log(`  Part ${idx + 1}: ${p.title} (${p.questions ? p.questions.length : 0} questions)`);
      if (p.questions && p.questions[0]) {
        console.log(`    First Q type: ${p.questions[0].type}, text: "${p.questions[0].text}"`);
      }
    });
  }
}
