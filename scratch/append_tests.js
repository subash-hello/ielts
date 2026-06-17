const fs = require('fs');

let code = fs.readFileSync('backend/src/scripts/generate_all_unique_tests.js', 'utf8');

const appendCode = `
// POST-PROCESSING TESTS 3 to 12
for (let i = 3; i <= 12; i++) {
  if(cambridgeListeningTests[i.toString()]) {
    // Reusing test 1 audio for testing
    cambridgeListeningTests[i.toString()].parts[0].audioUrl = 'https://engnovate.com/wp-content/uploads/2026/05/road-to-ielts-academic-listening-test-1-1.mp3';
    cambridgeListeningTests[i.toString()].parts[1].audioUrl = 'https://engnovate.com/wp-content/uploads/2026/05/road-to-ielts-academic-listening-test-1-2.mp3';
    cambridgeListeningTests[i.toString()].parts[2].audioUrl = 'https://engnovate.com/wp-content/uploads/2026/05/road-to-ielts-academic-listening-test-1-3.mp3';
    cambridgeListeningTests[i.toString()].parts[3].audioUrl = 'https://engnovate.com/wp-content/uploads/2026/05/road-to-ielts-academic-listening-test-1-4.mp3';
  }
}

// Add MAP image and question to Test 3, Part 2
cambridgeListeningTests['3'].parts[1].imageUrl = '/library-map.png';
cambridgeListeningTests['3'].parts[1].questions = [
  { id: 't3p2q1', type: 'matching', text: 'Where is the Main Desk?', options: ['A. North', 'B. South', 'C. East', 'D. West'], correctAnswer: 'A' },
  { id: 't3p2q2', type: 'matching', text: 'Where is the Fiction Section?', options: ['A. North', 'B. South', 'C. East', 'D. West'], correctAnswer: 'B' }
];
`;

code = code.replace(/module\.exports = cambridgeListeningTests;/, appendCode + '\nmodule.exports = cambridgeListeningTests;');

fs.writeFileSync('backend/src/scripts/generate_all_unique_tests.js', code);
console.log('Appended post processing');
