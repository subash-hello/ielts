const fs = require('fs');
const file = 'c:/Users/subas/OneDrive/Documents/projects/ielts/backend/src/utils/seeder.js';
let content = fs.readFileSync(file, 'utf8');

const replacement = `const listeningTemplates = [
  {
    parts: [
      {
        part: 1,
        title: 'Library Registration',
        type: 'Conversation',
        transcript: 'LIBRARIAN: Good morning! How can I help you today? STUDENT: Hi, I would like to register for a library card. LIBRARIAN: Sure, I just need to take down some details. Your name please? STUDENT: It is John Smith. LIBRARIAN: And your address? STUDENT: 42 Pine Street, London. LIBRARIAN: What is your phone number? STUDENT: 07700 900456. LIBRARIAN: Great. And finally, what type of membership do you want? Standard or Premium? STUDENT: Standard, please.',
        questions: [
          { id: 'l1', type: 'fillBlank', text: 'Name: John _____', correctAnswer: 'Smith' },
          { id: 'l2', type: 'fillBlank', text: 'Address: 42 Pine _____, London', correctAnswer: 'Street' },
          { id: 'l3', type: 'fillBlank', text: 'Phone: 07700 _____', correctAnswer: '900456' },
          { id: 'l4', type: 'fillBlank', text: 'Membership type: _____', correctAnswer: 'Standard' }
        ]
      },
      {
        part: 2,
        title: 'Museum Tour',
        type: 'Monologue',
        transcript: 'GUIDE: Welcome to the City Museum. Today we will look at the Roman exhibit. Please do not touch the artifacts. No flash photography is allowed. We will start in the main hall. Then we move to the weaponry room.',
        questions: [
          { id: 'l5', type: 'mcq', text: 'What is not allowed?', options: ['Running', 'Flash photography', 'Eating'], correctAnswer: 'Flash photography' },
          { id: 'l6', type: 'mcq', text: 'Where will they start?', options: ['Main hall', 'Weaponry room', 'Gift shop'], correctAnswer: 'Main hall' }
        ]
      },
      {
        part: 3,
        title: 'University Project',
        type: 'Academic Discussion',
        transcript: 'TUTOR: Let us discuss your project on renewable energy. STUDENT 1: I focused on solar power. It is very efficient but expensive. STUDENT 2: I looked at wind energy. It requires a lot of space. TUTOR: Both are good. You need to combine your findings by next Friday.',
        questions: [
          { id: 'l7', type: 'mcq', text: 'What did Student 1 focus on?', options: ['Wind energy', 'Solar power', 'Geothermal'], correctAnswer: 'Solar power' },
          { id: 'l8', type: 'fillBlank', text: 'Wind energy requires a lot of _____', correctAnswer: 'space' }
        ]
      },
      {
        part: 4,
        title: 'Lecture on Marine Biology',
        type: 'Academic Lecture',
        transcript: 'LECTURER: Today we discuss coral reefs. They are vital to ocean ecosystems. Sadly, climate change is causing coral bleaching. Rising sea temperatures stress the coral, leading them to expel the algae living in their tissues. We must reduce carbon emissions to save them.',
        questions: [
          { id: 'l9', type: 'fillBlank', text: 'Coral reefs are vital to _____ ecosystems', correctAnswer: 'ocean' },
          { id: 'l10', type: 'fillBlank', text: 'Climate change is causing coral _____', correctAnswer: 'bleaching' }
        ]
      }
    ]
  },
  {
    parts: [
      {
        part: 1,
        title: 'Booking a Hotel',
        type: 'Conversation',
        transcript: 'RECEPTIONIST: Good afternoon, Grand Hotel. CUSTOMER: Hi, I want to book a room for next weekend. RECEPTIONIST: For how many nights? CUSTOMER: Two nights, Saturday and Sunday. RECEPTIONIST: A double or single room? CUSTOMER: Double room, please. RECEPTIONIST: That will be 150 dollars per night. Can I have your name? CUSTOMER: Mary Johnson.',
        questions: [
          { id: 'l1', type: 'fillBlank', text: 'Number of nights: _____', correctAnswer: 'Two / 2' },
          { id: 'l2', type: 'mcq', text: 'Room type:', options: ['Single', 'Double', 'Suite'], correctAnswer: 'Double' },
          { id: 'l3', type: 'fillBlank', text: 'Cost per night: $_____', correctAnswer: '150' }
        ]
      },
      {
        part: 2,
        title: 'Fitness Center Orientation',
        type: 'Monologue',
        transcript: 'INSTRUCTOR: Welcome to the community fitness center. We are open from 6 AM to 10 PM daily. Please remember to bring a towel. The swimming pool is currently closed for maintenance until next Monday. Classes are held in Studio A.',
        questions: [
          { id: 'l4', type: 'fillBlank', text: 'Opening hours: 6 AM to _____ PM', correctAnswer: '10' },
          { id: 'l5', type: 'mcq', text: 'What is closed?', options: ['Gym', 'Swimming pool', 'Studio A'], correctAnswer: 'Swimming pool' }
        ]
      },
      {
        part: 3,
        title: 'Group Assignment Planning',
        type: 'Academic Discussion',
        transcript: 'ALICE: We need to divide the work for our marketing assignment. BOB: I can do the market research part. ALICE: OK, I will handle the financial analysis. Let us meet on Wednesday to review our progress. BOB: Sounds good. We should use the library study room.',
        questions: [
          { id: 'l6', type: 'fillBlank', text: 'Bob will do the _____ research', correctAnswer: 'market' },
          { id: 'l7', type: 'mcq', text: 'When will they meet?', options: ['Monday', 'Wednesday', 'Friday'], correctAnswer: 'Wednesday' }
        ]
      },
      {
        part: 4,
        title: 'History of the Bicycle',
        type: 'Academic Lecture',
        transcript: 'LECTURER: The first bicycle was invented in 1817 in Germany. It had no pedals; riders pushed it with their feet. Later, pedals were added to the front wheel, creating the penny-farthing. Finally, the safety bicycle with a chain drive was developed in the 1880s, becoming very popular.',
        questions: [
          { id: 'l8', type: 'fillBlank', text: 'Invented in _____ in Germany', correctAnswer: '1817' },
          { id: 'l9', type: 'mcq', text: 'What did riders push with?', options: ['Hands', 'Feet', 'Pedals'], correctAnswer: 'Feet' },
          { id: 'l10', type: 'fillBlank', text: 'Safety bicycle was developed in the 1880s and had a _____ drive', correctAnswer: 'chain' }
        ]
      }
    ]
  }
];

`;

if (!content.includes('listeningTemplates')) {
  content = content.replace(/const testTemplates = \[/, replacement + 'const testTemplates = [');
  content = content.replace(/parts: Object.values\(cambridgeListeningTests\['1'\]\.parts\)/, 'parts: i % 3 === 0 ? Object.values(cambridgeListeningTests[\'1\'].parts) : listeningTemplates[i % 2].parts');
  fs.writeFileSync(file, content);
  console.log('Successfully replaced');
} else {
  console.log('Already updated');
}
