const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const TestContent = require('../models/TestContent');
const cambridgeListeningTests = require('../data/cambridgeListeningTests');


// Load env vars
dotenv.config({ path: path.join(__dirname, '../../.env') });

const mockTestsData = [
  {
    title: 'Full Mock Test',
    type: 'mock_test',
    subType: 'full',
    difficulty: 'medium',
    content: {
      readingPassage: `The Impact of Artificial Intelligence on Language Acquisition\n\nLanguage acquisition has traditionally been a human-centric endeavor, requiring physical interaction, social feedback, and continuous reinforcement within a community of speakers. However, the emergence of advanced Artificial Intelligence (AI) has significantly transformed this landscape. Modern AI tools, powered by Large Language Models (LLMs) and neural text-to-speech engines, have introduced highly personalized, low-stress learning environments that democratize language training.\n\nOne of the most notable advantages of AI-driven tutors is the reduction of communicative anxiety. Many language learners experience what researchers call 'Foreign Language Anxiety'—a paralyzing fear of making grammatical errors in front of native speakers or classmates. AI chat agents, however, offer a judgment-free sandbox. Learners can experiment with phrasing, test vocabulary boundaries, and receive immediate corrections without the social embarrassment typically associated with classrooms.`,
      readingQuestions: [
        { id: 'r1', text: 'According to the passage, what paralyzed many language learners in classrooms?', options: ['Lacking access to text-to-speech tools', 'Foreign Language Anxiety', 'Over-reliance on neural models', 'Inability to learn grammar'], correct: 'Foreign Language Anxiety' },
        { id: 'r2', text: 'AI tutors create a "judgment-free sandbox" because they do not cause:', options: ['Grammatical mistakes', 'Vocabulary expansion', 'Social embarrassment', 'Clinical phrasing'], correct: 'Social embarrassment' }
      ],
      speakingPrompts: [
        { id: 's1', question: "Could you tell me a little about your hometown?", examinerText: "Let's start. Could you tell me a little about your hometown?" },
        { id: 's2', question: "Do you prefer studying alone or in a group?", examinerText: "Do you prefer studying alone or in a group? Why?" }
      ],
      writingPrompt: "Some people argue that technology has made us less connected to others, while others believe it has brought us closer. Discuss both views and give your opinion.",
      listeningTranscript: "Welcome to the IELTS Listening Test. Section one. Receptionist: Good morning, Grand Hotel. How may I help you today? Guest: Good morning. Yes, I would like to book a double room for three nights, please.",
      listeningQuestions: [
        { id: 'l1', type: 'fillBlank', text: 'The guest wants to book a room for _____ nights.', correctAnswer: 'three' },
        { id: 'l2', type: 'multipleChoice', text: 'What type of room does the guest prefer?', options: ['Single', 'Double', 'Suite', 'Family'], correctAnswer: 'Double' }
      ]
    }
  }
];

const practiceTasksData = [
  {
    title: 'Speaking Practice',
    type: 'practice_task',
    subType: 'speaking',
    difficulty: 'easy',
    content: {
      part: 1,
      desc: 'Answer simple questions about your daily routine.',
      duration: '4 min',
      color: 'from-violet-500 to-accent-bright'
    }
  },
  {
    title: 'Writing Practice',
    type: 'practice_task',
    subType: 'writing',
    difficulty: 'hard',
    content: {
      taskType: 2,
      prompt: 'Discuss the impact of climate change on coastal cities and propose solutions.',
      duration: '40 min',
      color: 'from-accent-bright to-pink-400'
    }
  }
];

const seedDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ielts-ai';
    await mongoose.connect(mongoUri);
    console.log('MongoDB Connected for seeding');

    console.log('Clearing existing test contents...');
    await TestContent.deleteMany({});

    console.log('Seeding Mock Tests...');
    const mockTestsToInsert = [];
    for (let i = 1; i <= 30; i++) {
      const template = mockTestsData[0];
      const ltestId = ((i - 1) % 30 + 1).toString();
      const listeningParts = cambridgeListeningTests[ltestId]?.parts || [];
      mockTestsToInsert.push({
        title: `Mock Test ${i}: Standard Academic`,
        type: template.type,
        subType: template.subType,
        difficulty: i > 20 ? 'hard' : (i > 10 ? 'medium' : 'easy'),
        content: {
          ...template.content,
          listeningParts: listeningParts
        },
        isActive: true
      });
    }
    await TestContent.insertMany(mockTestsToInsert);
    console.log('30 Mock Tests inserted successfully!');

    console.log('Seeding Practice Tasks...');
    const practiceToInsert = [];
    for (let i = 1; i <= 30; i++) {
      const isSpeaking = i % 2 === 0;
      const template = isSpeaking ? practiceTasksData[0] : practiceTasksData[1];
      
      practiceToInsert.push({
        title: `${isSpeaking ? 'Speaking' : 'Writing'} Task - Set ${i}`,
        type: template.type,
        subType: template.subType,
        difficulty: i > 20 ? 'hard' : (i > 10 ? 'medium' : 'easy'),
        content: template.content,
        isActive: true
      });
    }
    await TestContent.insertMany(practiceToInsert);
    console.log('30 Practice Tasks inserted successfully!');

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Failed to seed DB', err);
    process.exit(1);
  }
};

seedDB();
