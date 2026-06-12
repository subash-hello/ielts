const tests = require('./src/data/cambridgeListeningTests');
for (let i = 1; i <= 10; i++) {
  const t = tests[i];
  if (t) {
    console.log(`Test ID: ${i}`);
    console.log(`  Title: ${t.title}`);
    console.log(`  First audioUrl: ${t.parts && t.parts[0] ? t.parts[0].audioUrl : 'none'}`);
    console.log(`  First question text: ${t.parts && t.parts[0] && t.parts[0].questions && t.parts[0].questions[0] ? t.parts[0].questions[0].text : 'none'}`);
  } else {
    console.log(`Test ID: ${i} -> null`);
  }
}
