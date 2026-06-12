const cambridge = require('../data/cambridgeListeningTests');
const t2 = cambridge['2'];
const t7 = cambridge['7'];

console.log('Comparing Test 2 and Test 7 parts:');
t2.parts.forEach((p, idx) => {
  const p7 = t7.parts[idx];
  console.log(`Part ${idx + 1}:`);
  console.log(`  T2 Title: "${p.title}"`);
  console.log(`  T7 Title: "${p7.title}"`);
  console.log(`  T2 Q1: "${p.questions[0]?.text}"`);
  console.log(`  T7 Q1: "${p7.questions[0]?.text}"`);
  console.log(`  T2 Q1 Correct: "${p.questions[0]?.correctAnswer}"`);
  console.log(`  T7 Q1 Correct: "${p7.questions[0]?.correctAnswer}"`);
});
