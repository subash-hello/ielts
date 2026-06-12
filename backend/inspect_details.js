const fs = require('fs');

const scraped = JSON.parse(fs.readFileSync('scrapedTests.json', 'utf8'));

Object.entries(scraped).forEach(([testId, test]) => {
  console.log(`\n========================================`);
  console.log(`Test ID: ${testId} - ${test.title}`);
  test.parts.forEach((p) => {
    console.log(`  Part ${p.part}:`);
    p.questions.forEach((q, qidx) => {
      const qNum = (p.part - 1) * 10 + qidx + 1;
      console.log(`    Q${qNum} (${q.type}): Text="${q.text}" Ans="${q.correctAnswer}"`);
    });
  });
});
