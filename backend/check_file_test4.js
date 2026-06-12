const tests = require('./src/data/cambridgeListeningTests');
console.log('Test 4 in cambridgeListeningTests.js is:', tests["4"] ? {
  title: tests["4"].title,
  partsCount: tests["4"].parts.length,
  parts: tests["4"].parts.map(p => ({
    part: p.part,
    title: p.title,
    audioUrl: p.audioUrl,
    firstQuestionText: p.questions[0]?.text
  }))
} : 'null');
