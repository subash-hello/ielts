const tests = require('./src/data/cambridgeListeningTests');

for (let i = 1; i <= 10; i++) {
  const t = tests[i];
  if (t) {
    t.parts.forEach(p => {
      if (p.imageUrl) {
        console.log(`Test ${i} Part ${p.part} has imageUrl: ${p.imageUrl}`);
      }
      p.questions.forEach((q, idx) => {
        if (q.mapImage) {
          console.log(`Test ${i} Part ${p.part} Q${(p.part-1)*10 + idx + 1} has mapImage: ${q.mapImage}`);
        }
      });
    });
  }
}
