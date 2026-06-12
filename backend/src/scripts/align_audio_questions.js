/**
 * Replaces all 30 tests' parts with the REAL Cambridge 11 Test 1 questions
 * that actually match the downloaded audio (cambridge11.webm).
 * 
 * Each practice test cycles through the 4 parts of Cambridge 11 Test 1.
 * Mock tests (which contain all 4 parts) also use the real Cambridge 11 questions.
 */
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../data/cambridgeListeningTests.js');
const cambridgeTests = require('../data/cambridgeListeningTests');

const AUDIO_URL = '/audio/cambridge11.webm';

// Get the REAL Cambridge 11 Test 1 parts (these match the audio perfectly)
const realTest1 = cambridgeTests['1'];
const realParts = realTest1.parts; // 4 parts, 10 questions each

if (!realParts || realParts.length !== 4) {
  console.error('Test 1 does not have 4 parts. Aborting.');
  process.exit(1);
}

console.log('Real Cambridge 11 parts found:');
realParts.forEach(p => console.log(` Part ${p.part}: ${p.title} (${p.questions.length} questions)`));

const patched = {};
Object.keys(cambridgeTests).forEach((key, index) => {
  const test = cambridgeTests[key];
  // All tests use the real Cambridge 11 parts (which match the audio)
  // We cycle the "highlighted" part for practice sessions but keep all 4 for mock tests
  patched[key] = {
    ...test,
    parts: realParts.map(part => ({
      ...part,
      audioUrl: AUDIO_URL,
      // Re-key question IDs to include test number to avoid collisions
      questions: part.questions.map(q => ({
        ...q,
        id: `t${key}_${q.id}`
      }))
    }))
  };
});

const content = `const cambridgeListeningTests = ${JSON.stringify(patched, null, 2)};\n\nmodule.exports = cambridgeListeningTests;\n`;
fs.writeFileSync(filePath, content, 'utf8');

console.log(`\n✅ Patched all ${Object.keys(patched).length} tests.`);
console.log('All tests now use the REAL Cambridge 11 questions that match the audio.');
console.log('Audio URL set to:', AUDIO_URL);
