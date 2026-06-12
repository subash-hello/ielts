const fs = require('fs');

let code = fs.readFileSync('backend/src/scripts/generate_all_unique_tests.js', 'utf8');

const test2Content = `
const test2Content = {
  id: '2',
  title: 'Cambridge IELTS 20 Academic Listening Test 4',
  duration: '30 min',
  difficulty: 'hard',
  parts: [
    {
      part: 1,
      title: 'Part 1: Questions 1-10',
      type: 'Conversation',
      audioUrl: 'https://engnovate.com/wp-content/uploads/2026/05/road-to-ielts-academic-listening-test-1-1.mp3',
      transcript: 'Placeholder transcript for Cambridge 20 Test 4...',
      questions: [
        { id: 'c20t4q1', type: 'fillBlank', text: 'Name: ____', correctAnswer: 'John' }
      ]
    },
    {
      part: 2,
      title: 'Part 2: Questions 11-20',
      type: 'Monologue',
      audioUrl: 'https://engnovate.com/wp-content/uploads/2026/05/road-to-ielts-academic-listening-test-1-2.mp3',
      transcript: 'Placeholder...',
      questions: [
        { id: 'c20t4q11', type: 'multipleChoice', text: 'Where is the museum?', options: ['North', 'South', 'East'], correctAnswer: 'North' }
      ]
    },
    {
      part: 3,
      title: 'Part 3: Questions 21-30',
      type: 'Academic Discussion',
      audioUrl: 'https://engnovate.com/wp-content/uploads/2026/05/road-to-ielts-academic-listening-test-1-3.mp3',
      transcript: 'Placeholder...',
      questions: [
        { id: 'c20t4q21', type: 'fillBlank', text: 'Subject: ____', correctAnswer: 'Biology' }
      ]
    },
    {
      part: 4,
      title: 'Part 4: Questions 31-40',
      type: 'Academic Lecture',
      audioUrl: 'https://engnovate.com/wp-content/uploads/2026/05/road-to-ielts-academic-listening-test-1-4.mp3',
      transcript: 'Placeholder...',
      questions: [
        { id: 'c20t4q31', type: 'fillBlank', text: 'Year: ____', correctAnswer: '1990' }
      ]
    }
  ]
};
`;

code = code.replace(/const cambridgeListeningTests = \{/, test2Content + '\nconst cambridgeListeningTests = {');
code = code.replace(/"1": test1Content/, '"1": test1Content,\n  "2": test2Content');

fs.writeFileSync('backend/src/scripts/generate_all_unique_tests.js', code);
console.log('Modified generate script');
