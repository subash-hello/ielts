const fs = require('fs');

const generateQuestions = (startIdx, partType) => {
  const qs = [];
  for (let i = 0; i < 10; i++) {
    const qNum = startIdx + i;
    if (partType === 1) {
      qs.push({ id: `q${qNum}`, type: 'fillBlank', text: `${qNum}. Details about _____`, correctAnswer: 'answer' });
    } else if (partType === 2) {
      qs.push({ id: `q${qNum}`, type: 'mcq', text: `${qNum}. What is the main point?`, options: ['A', 'B', 'C'], correctAnswer: 'A' });
    } else if (partType === 3) {
      qs.push({ id: `q${qNum}`, type: 'matching', text: `${qNum}. Match the speaker:`, options: ['Alice', 'Bob', 'Charlie'], correctAnswer: 'Bob' });
    } else {
      qs.push({ id: `q${qNum}`, type: 'fillBlank', text: `${qNum}. The process requires _____`, correctAnswer: 'water' });
    }
  }
  return qs;
};

const generateTest = (testNum) => {
  return {
    id: testNum.toString(),
    title: `Cambridge IELTS Listening Test ${testNum}`,
    duration: '30 min',
    difficulty: testNum <= 3 ? 'easy' : testNum <= 7 ? 'medium' : 'hard',
    parts: [
      {
        part: 1,
        title: `Part 1: Conversation in Everyday Social Context`,
        type: 'Conversation',
        transcript: `Welcome to Test ${testNum}, Part 1. This is a conversation between two people in a social setting. They are discussing everyday matters. Please answer questions 1 to 10.`,
        questions: generateQuestions(1, 1)
      },
      {
        part: 2,
        title: `Part 2: Monologue on an Everyday Social Issue`,
        type: 'Monologue',
        transcript: `Welcome to Test ${testNum}, Part 2. You will hear a monologue about a social issue. Listen carefully and answer questions 11 to 20.`,
        questions: generateQuestions(11, 2)
      },
      {
        part: 3,
        title: `Part 3: Conversation in an Educational or Training Context`,
        type: 'Academic Discussion',
        transcript: `Welcome to Test ${testNum}, Part 3. You will hear a discussion between up to four people in an educational setting. Answer questions 21 to 30.`,
        questions: generateQuestions(21, 3)
      },
      {
        part: 4,
        title: `Part 4: Monologue on an Academic Subject`,
        type: 'Academic Lecture',
        transcript: `Welcome to Test ${testNum}, Part 4. You will hear a university lecture on an academic subject. Listen and answer questions 31 to 40.`,
        questions: generateQuestions(31, 4)
      }
    ]
  };
};

const cambridge10 = {};
for (let i = 1; i <= 10; i++) {
  cambridge10[i] = generateTest(i);
}

fs.writeFileSync('c:/Users/subas/OneDrive/Documents/projects/ielts/backend/src/data/cambridgeTenTests.js', `module.exports = ${JSON.stringify(cambridge10, null, 2)};`);
console.log('Created cambridgeTenTests.js');
