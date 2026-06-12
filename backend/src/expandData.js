const fs = require('fs');

const readPath = 'c:/Users/subas/OneDrive/Documents/projects/ielts/backend/src/data/readingTests.js';
let readContent = fs.readFileSync(readPath, 'utf8');
const listenPath = 'c:/Users/subas/OneDrive/Documents/projects/ielts/backend/src/data/listeningTests.js';
let listenContent = fs.readFileSync(listenPath, 'utf8');

for (let i = 4; i <= 10; i++) {
  if (i > 3 && readContent.indexOf("'" + i + "': {") === -1) {
    const newRead = "  '" + i + "': {\n" +
    "    id: '" + i + "',\n" +
    "    title: 'Reading Passage " + i + "',\n" +
    "    passage: 'This is a dynamically added reading passage for test " + i + ". In a real scenario, this would contain approximately 800-900 words on an academic topic, discussing various theories, historical facts, or scientific discoveries. For the purpose of providing 10 practice sections, this text serves as a placeholder to ensure the system is fully functional and scalable.',\n" +
    "    questions: [\n" +
    "      { id: 'q1', type: 'multipleChoice', text: 'What is the main purpose of this passage?', options: ['To entertain', 'To act as a placeholder for Test " + i + "', 'To confuse', 'To summarize'], correct: 'To act as a placeholder for Test " + i + "' },\n" +
    "      { id: 'q2', type: 'trueFalseNotGiven', text: 'This passage contains exactly 800 words.', correct: 'False' },\n" +
    "      { id: 'q3', type: 'fillBlank', text: 'This text serves as a _____ to ensure functionality.', correct: 'placeholder' },\n" +
    "      { id: 'q4', type: 'multipleChoice', text: 'Which test is this passage for?', options: ['Test 1', 'Test 2', 'Test " + i + "', 'Test 10'], correct: 'Test " + i + "' },\n" +
    "      { id: 'q5', type: 'trueFalseNotGiven', text: 'The passage discusses scientific discoveries.', correct: 'Not Given' }\n" +
    "    ]\n" +
    "  }";
    readContent = readContent.replace(/};\s*module\.exports/, ",\n" + newRead + "\n};\nmodule.exports");
  }
}
fs.writeFileSync(readPath, readContent);
console.log('Reading data expanded to 10 tests.');

for (let i = 5; i <= 10; i++) {
  if (listenContent.indexOf("'" + i + "': {") === -1) {
    const newListen = "  '" + i + "': {\n" +
    "    id: '" + i + "',\n" +
    "    title: 'Listening Section " + i + "',\n" +
    "    section: " + ((i % 4) || 4) + ",\n" +
    "    transcript: 'Welcome to IELTS Listening Section " + i + ". This is a dynamically added listening transcript. The examiner or speaker would normally present an audio monologue or dialogue here spanning several minutes. For this practice test, we are verifying that the text-to-speech engine successfully parses and plays the dynamically loaded transcript.',\n" +
    "    questions: [\n" +
    "      { id: 'q1', type: 'fillBlank', text: 'This is Listening Section number _____.', correctAnswer: '" + i + "' },\n" +
    "      { id: 'q2', type: 'multipleChoice', text: 'What does this transcript verify?', options: ['Audio levels', 'Text-to-speech engine', 'Student grammar', 'Volume'], correctAnswer: 'Text-to-speech engine' },\n" +
    "      { id: 'q3', type: 'trueFalseNotGiven', text: 'The speaker presents a real dialogue.', correctAnswer: 'False' },\n" +
    "      { id: 'q4', type: 'fillBlank', text: 'The speaker would normally present an audio _____ or dialogue.', correctAnswer: 'monologue' },\n" +
    "      { id: 'q5', type: 'multipleChoice', text: 'Is this a dynamically added transcript?', options: ['Yes', 'No', 'Maybe', 'Unknown'], correctAnswer: 'Yes' }\n" +
    "    ]\n" +
    "  }";
    listenContent = listenContent.replace(/};\s*module\.exports/, ",\n" + newListen + "\n};\nmodule.exports");
  }
}
fs.writeFileSync(listenPath, listenContent);
console.log('Listening data expanded to 10 tests.');
