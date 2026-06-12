/**
 * Patches all tests in cambridgeListeningTests.js to include audioUrl on every part.
 * Uses the locally downloaded Cambridge 11 audio for all tests.
 */
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../data/cambridgeListeningTests.js');

// Load the current data
const cambridgeTests = require('../data/cambridgeListeningTests');

const AUDIO_URL = '/audio/cambridge11.webm';

const patched = {};
Object.keys(cambridgeTests).forEach(key => {
  const test = cambridgeTests[key];
  patched[key] = {
    ...test,
    parts: test.parts.map(part => ({
      ...part,
      audioUrl: part.audioUrl || AUDIO_URL
    }))
  };
});

// Write back as a JS module
const content = `const cambridgeListeningTests = ${JSON.stringify(patched, null, 2)};\n\nmodule.exports = cambridgeListeningTests;\n`;
fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ Patched', Object.keys(patched).length, 'tests with audioUrl on all parts.');
