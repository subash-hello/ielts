const tests = require('./src/data/cambridgeListeningTests');
for (const key in tests) {
  const t = tests[key];
  console.log(`Test ID: ${key}`);
  console.log(`  Title: ${t.title}`);
  console.log(`  Difficulty: ${t.difficulty}`);
  console.log(`  Parts count: ${t.parts ? t.parts.length : 0}`);
  if (t.parts && t.parts.length > 0) {
    t.parts.forEach(p => {
      console.log(`    Part ${p.part}: ${p.title}`);
      console.log(`      Audio: ${p.audioUrl}`);
      console.log(`      First question: ${p.questions && p.questions[0] ? p.questions[0].text : 'none'}`);
    });
  }
  console.log('----------------------------');
}
