const fs = require('fs');
const path = require('path');

const names = ["Smith", "Jones", "Taylor", "Brown", "Wilson", "Miller", "Davis", "Garcia", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Anderson", "Thomas", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson", "Walker", "Young"];
const dates = ["12th", "15th", "18th", "20th", "22nd", "25th", "10th", "14th", "16th", "28th", "5th", "8th", "19th", "24th", "30th", "3rd", "7th", "11th", "17th", "21st", "23rd", "26th", "27th", "29th", "1st", "2nd", "4th", "6th", "9th", "13th"];
const nights = ["two", "three", "four", "five", "six", "seven", "two", "three", "four", "five", "six", "seven", "two", "three", "four", "five", "six", "seven", "two", "three", "four", "five", "six", "seven", "two", "three", "four", "five", "six", "seven"];
const rates = [90, 100, 110, 120, 130, 145, 150, 160, 175, 180, 195, 200, 210, 220, 230, 240, 250, 260, 275, 280, 290, 300, 310, 320, 330, 340, 350, 360, 375, 380];
const checkoutCosts = [20, 25, 30, 35, 40, 45, 50, 20, 25, 30, 35, 40, 45, 50, 20, 25, 30, 35, 40, 45, 50, 20, 25, 30, 35, 40, 45, 50, 20, 25];
const stations = ["metro", "railway", "bus", "underground", "train", "subway", "metro", "railway", "bus", "underground", "train", "subway", "metro", "railway", "bus", "underground", "train", "subway", "metro", "railway", "bus", "underground", "train", "subway", "metro", "railway", "bus", "underground", "train", "subway"];
const floors = ["second", "third", "fourth", "fifth", "sixth", "ground", "second", "third", "fourth", "fifth", "sixth", "ground", "second", "third", "fourth", "fifth", "sixth", "ground", "second", "third", "fourth", "fifth", "sixth", "ground", "second", "third", "fourth", "fifth", "sixth", "ground"];

const generatedTests = {};

// Real Road to IELTS Test 1 questions definition
const roadToIeltsQuestions = {
  p1: [
    { id: 'q1', type: 'fillBlank', text: 'Express train leaves at _____', correctAnswer: '9.30 am / 9.30 / 9:30 am / 9:30', audioUrl: 'https://engnovate.com/wp-content/uploads/2026/05/road-to-ielts-academic-listening-test-1-1.mp3' },
    { id: 'q2', type: 'fillBlank', text: 'Nearest station is _____', correctAnswer: 'Helendale', audioUrl: 'https://engnovate.com/wp-content/uploads/2026/05/road-to-ielts-academic-listening-test-1-1.mp3' },
    { id: 'q3', type: 'fillBlank', text: 'Number 706 bus goes to _____', correctAnswer: 'Central Street / Central St', audioUrl: 'https://engnovate.com/wp-content/uploads/2026/05/road-to-ielts-academic-listening-test-1-1.mp3' },
    { id: 'q4', type: 'fillBlank', text: 'Number _____ bus goes to station', correctAnswer: '792', audioUrl: 'https://engnovate.com/wp-content/uploads/2026/05/road-to-ielts-academic-listening-test-1-1.mp3' },
    { id: 'q5', type: 'fillBlank', text: 'Earlier bus leaves at _____', correctAnswer: '8.55 am / 8.55 / 8:55 am / 8:55', audioUrl: 'https://engnovate.com/wp-content/uploads/2026/05/road-to-ielts-academic-listening-test-1-1.mp3' },
    { id: 'q6', type: 'fillBlank', text: 'Bus cash fare: $ _____', correctAnswer: '1.80', audioUrl: 'https://engnovate.com/wp-content/uploads/2026/05/road-to-ielts-academic-listening-test-1-1.mp3' },
    { id: 'q7', type: 'fillBlank', text: 'Train (off-peak) - before 5pm or after _____ pm', correctAnswer: '7.30 / 7:30', audioUrl: 'https://engnovate.com/wp-content/uploads/2026/05/road-to-ielts-academic-listening-test-1-1.mp3' },
    { id: 'q8', type: 'fillBlank', text: 'Train (off-peak) card fare: $ _____', correctAnswer: '7.15 / 7:15', audioUrl: 'https://engnovate.com/wp-content/uploads/2026/05/road-to-ielts-academic-listening-test-1-1.mp3' },
    { id: 'q9', type: 'fillBlank', text: '_____ ferry', correctAnswer: 'commuter', audioUrl: 'https://engnovate.com/wp-content/uploads/2026/05/road-to-ielts-academic-listening-test-1-1.mp3' },
    { id: 'q10', type: 'fillBlank', text: 'Tourist ferry ( _____ )', correctAnswer: 'Afternoon', audioUrl: 'https://engnovate.com/wp-content/uploads/2026/05/road-to-ielts-academic-listening-test-1-1.mp3' }
  ],
  p2: [
    { id: 'q11', type: 'matching', text: 'if you do not have an appointment', options: ['A. Louise Bagshaw', 'B. Tony Denby', 'C. Naomi Flynn'], correctAnswer: 'A', audioUrl: 'https://engnovate.com/wp-content/uploads/2026/05/road-to-ielts-academic-listening-test-1-2.mp3' },
    { id: 'q12', type: 'matching', text: 'if it is your first time seeing a counsellor', options: ['A. Louise Bagshaw', 'B. Tony Denby', 'C. Naomi Flynn'], correctAnswer: 'C', audioUrl: 'https://engnovate.com/wp-content/uploads/2026/05/road-to-ielts-academic-listening-test-1-2.mp3' },
    { id: 'q13', type: 'matching', text: 'if your concerns are related to anxiety', options: ['A. Louise Bagshaw', 'B. Tony Denby', 'C. Naomi Flynn'], correctAnswer: 'B', audioUrl: 'https://engnovate.com/wp-content/uploads/2026/05/road-to-ielts-academic-listening-test-1-2.mp3' },
    { id: 'q14', type: 'matching', text: 'if you are unable to see a counsellor during normal office hours', options: ['A. Louise Bagshaw', 'B. Tony Denby', 'C. Naomi Flynn'], correctAnswer: 'C', audioUrl: 'https://engnovate.com/wp-content/uploads/2026/05/road-to-ielts-academic-listening-test-1-2.mp3' },
    { id: 'q15', type: 'fillBlank', text: 'Adjusting workshop - Target group: _____ students', correctAnswer: 'first / 1st year', audioUrl: 'https://engnovate.com/wp-content/uploads/2026/05/road-to-ielts-academic-listening-test-1-2.mp3' },
    { id: 'q16', type: 'fillBlank', text: 'Getting Organised workshop - Content: use time effectively, find _____ between study and leisure', correctAnswer: 'right balance / balance', audioUrl: 'https://engnovate.com/wp-content/uploads/2026/05/road-to-ielts-academic-listening-test-1-2.mp3' },
    { id: 'q17', type: 'fillBlank', text: 'Communicating workshop - Target group: all students, especially _____', correctAnswer: 'international students / international / foreign students / foreign', audioUrl: 'https://engnovate.com/wp-content/uploads/2026/05/road-to-ielts-academic-listening-test-1-2.mp3' },
    { id: 'q18', type: 'fillBlank', text: 'Anxiety workshop - Content: _____, breathing techniques, meditation, etc.', correctAnswer: 'relaxation', audioUrl: 'https://engnovate.com/wp-content/uploads/2026/05/road-to-ielts-academic-listening-test-1-2.mp3' },
    { id: 'q19', type: 'fillBlank', text: 'Workshop name: _____ (Content: staying on track for long periods)', correctAnswer: 'motivation', audioUrl: 'https://engnovate.com/wp-content/uploads/2026/05/road-to-ielts-academic-listening-test-1-2.mp3' },
    { id: 'q20', type: 'fillBlank', text: 'Motivation workshop - Target group: _____ students only', correctAnswer: 'research / advanced', audioUrl: 'https://engnovate.com/wp-content/uploads/2026/05/road-to-ielts-academic-listening-test-1-2.mp3' }
  ],
  p3: [
    { id: 'q21', type: 'fillBlank', text: 'Novel: _____', correctAnswer: 'The Secret Garden', audioUrl: 'https://engnovate.com/wp-content/uploads/2026/05/road-to-ielts-academic-listening-test-1-3.mp3' },
    { id: 'q22', type: 'fillBlank', text: 'Time period: Early in _____', correctAnswer: 'the 20th century / 20th century / the twentieth century / twentieth century', audioUrl: 'https://engnovate.com/wp-content/uploads/2026/05/road-to-ielts-academic-listening-test-1-3.mp3' },
    { id: 'q23', type: 'fillBlank', text: 'Plot: Mary → UK – meets Colin who thinks he’ll never be able to _____ . They become friends.', correctAnswer: 'walk', audioUrl: 'https://engnovate.com/wp-content/uploads/2026/05/road-to-ielts-academic-listening-test-1-3.mp3' },
    { id: 'q24', type: 'fillBlank', text: 'Point of view: “Omniscient” – narrator knows all about characters’ feelings, opinions and _____', correctAnswer: 'motivations / motivation', audioUrl: 'https://engnovate.com/wp-content/uploads/2026/05/road-to-ielts-academic-listening-test-1-3.mp3' },
    { id: 'q25', type: 'fillBlank', text: 'Symbols (physical items that represent _____):', correctAnswer: 'abstract ideas', audioUrl: 'https://engnovate.com/wp-content/uploads/2026/05/road-to-ielts-academic-listening-test-1-3.mp3' },
    { id: 'q26', type: 'fillBlank', text: 'robin redbreast, _____', correctAnswer: 'roses', audioUrl: 'https://engnovate.com/wp-content/uploads/2026/05/road-to-ielts-academic-listening-test-1-3.mp3' },
    { id: 'q27', type: 'fillBlank', text: 'secrecy – metaphorical and literal transition from _____', correctAnswer: 'darkness to lightness / darkness to light / dark to lightness / dark to light', audioUrl: 'https://engnovate.com/wp-content/uploads/2026/05/road-to-ielts-academic-listening-test-1-3.mp3' },
    { id: 'q28', type: 'fillBlank', text: 'Themes - Connections between: _____ and outlook', correctAnswer: 'health', audioUrl: 'https://engnovate.com/wp-content/uploads/2026/05/road-to-ielts-academic-listening-test-1-3.mp3' },
    { id: 'q29', type: 'fillBlank', text: 'Themes - Connections between: _____ and well-being', correctAnswer: 'environment', audioUrl: 'https://engnovate.com/wp-content/uploads/2026/05/road-to-ielts-academic-listening-test-1-3.mp3' },
    { id: 'q30', type: 'fillBlank', text: 'Themes - Connections between: individuals and the need for _____', correctAnswer: 'human companionship', audioUrl: 'https://engnovate.com/wp-content/uploads/2026/05/road-to-ielts-academic-listening-test-1-3.mp3' }
  ],
  p4: [
    { id: 'q31', type: 'fillBlank', text: 'Time Zone: Past / Outlook: _____', correctAnswer: 'negative', audioUrl: 'https://engnovate.com/wp-content/uploads/2026/05/road-to-ielts-academic-listening-test-1-4.mp3' },
    { id: 'q32', type: 'fillBlank', text: 'Time Zone: Present / Outlook: Hedonistic / Features: Live for _____ ; seek sensation; avoid pain.', correctAnswer: 'pleasure', audioUrl: 'https://engnovate.com/wp-content/uploads/2026/05/road-to-ielts-academic-listening-test-1-4.mp3' },
    { id: 'q33', type: 'fillBlank', text: 'Time Zone: Present / Outlook: Fatalistic / Features: Life is governed by _____ , religious beliefs, social conditions. Life’s path can’t be changed.', correctAnswer: 'poverty', audioUrl: 'https://engnovate.com/wp-content/uploads/2026/05/road-to-ielts-academic-listening-test-1-4.mp3' },
    { id: 'q34', type: 'fillBlank', text: 'Time Zone: Future / Outlook: _____', correctAnswer: 'active', audioUrl: 'https://engnovate.com/wp-content/uploads/2026/05/road-to-ielts-academic-listening-test-1-4.mp3' },
    { id: 'q35', type: 'fillBlank', text: 'Time Zone: Future / Outlook: Fatalistic / Features: Have a strong belief in life after death and importance of _____ in life.', correctAnswer: 'success', audioUrl: 'https://engnovate.com/wp-content/uploads/2026/05/road-to-ielts-academic-listening-test-1-4.mp3' },
    { id: 'q36', type: 'multipleChoice', text: 'We are all present hedonists', options: ['at school', 'at birth', 'while eating and drinking'], correctAnswer: 'B', audioUrl: 'https://engnovate.com/wp-content/uploads/2026/05/road-to-ielts-academic-listening-test-1-4.mp3' },
    { id: 'q37', type: 'multipleChoice', text: 'American boys drop out of school at a higher rate than girls because', options: ['they need to be in control of the way they learn', 'they play video games instead of doing school work', 'they are not as intelligent as girls'], correctAnswer: 'A', audioUrl: 'https://engnovate.com/wp-content/uploads/2026/05/road-to-ielts-academic-listening-test-1-4.mp3' },
    { id: 'q38', type: 'multipleChoice', text: 'Present-orientated children', options: ['do not realise present actions can have negative future effects', 'are unable to learn lessons from past mistakes', 'know what could happen if they do something bad, but do it anyway'], correctAnswer: 'C', audioUrl: 'https://engnovate.com/wp-content/uploads/2026/05/road-to-ielts-academic-listening-test-1-4.mp3' },
    { id: 'q39', type: 'multipleChoice', text: 'If Americans had an extra day per week, they would spend it', options: ['working harder', 'building relationships', 'sharing family meals'], correctAnswer: 'A', audioUrl: 'https://engnovate.com/wp-content/uploads/2026/05/road-to-ielts-academic-listening-test-1-4.mp3' },
    { id: 'q40', type: 'multipleChoice', text: 'Understanding how people think about time can help us', options: ['become more virtuous', 'work together better', 'identify careless or ambitious people'], correctAnswer: 'B', audioUrl: 'https://engnovate.com/wp-content/uploads/2026/05/road-to-ielts-academic-listening-test-1-4.mp3' }
  ]
};

for (let i = 1; i <= 30; i++) {
  if (i === 1) {
    // Road to IELTS Test 1
    const p1Transcript = fs.readFileSync(path.join(__dirname, '../data/road_to_ielts_transcript_1.txt'), 'utf8');
    const p2Transcript = fs.readFileSync(path.join(__dirname, '../data/road_to_ielts_transcript_2.txt'), 'utf8');
    const p3Transcript = fs.readFileSync(path.join(__dirname, '../data/road_to_ielts_transcript_3.txt'), 'utf8');
    const p4Transcript = fs.readFileSync(path.join(__dirname, '../data/road_to_ielts_transcript_4.txt'), 'utf8');

    generatedTests["1"] = {
      id: "1",
      title: "Road to IELTS Academic Test 1",
      duration: "30 min",
      difficulty: "medium",
      parts: [
        { part: 1, title: "Part 1: Transport from Bayswater", type: "Conversation", transcript: p1Transcript, questions: roadToIeltsQuestions.p1 },
        { part: 2, title: "Part 2: Student Counselling Services", type: "Monologue", transcript: p2Transcript, questions: roadToIeltsQuestions.p2 },
        { part: 3, title: "Part 3: English Literature Test Preparation", type: "Academic Discussion", transcript: p3Transcript, questions: roadToIeltsQuestions.p3 },
        { part: 4, title: "Part 4: Lecture on Time Perspectives", type: "Academic Lecture", transcript: p4Transcript, questions: roadToIeltsQuestions.p4 }
      ]
    };
  } else {
    // Determine scenario index from 0 to 4 based on i
    const p1Idx = (i - 2) % 5;
    const p2Idx = (i - 1) % 5;
    const p3Idx = i % 5;
    const p4Idx = (i + 1) % 5;

    const name = names[(i - 1) % names.length];
    const date = dates[(i - 1) % dates.length];
    const night = nights[(i - 1) % nights.length];
    const rate = rates[(i - 1) % rates.length];
    const cost = checkoutCosts[(i - 1) % checkoutCosts.length];
    const station = stations[(i - 1) % stations.length];
    const floor = floors[(i - 1) % floors.length];

    const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    const testLetters = [...letters];
    const shift = i % 8;
    for (let j = 0; j < shift; j++) {
      testLetters.push(testLetters.shift());
    }

    const matchingOptions = ["A", "B", "C"];
    const matchAnswers = {
      q21: matchingOptions[i % 3],
      q22: matchingOptions[(i + 1) % 3],
      q23: matchingOptions[(i + 2) % 3],
      q24: matchingOptions[(i + 1) % 3],
      q25: matchingOptions[i % 3]
    };

    const abyssalDepth = 5000 + (i * 50);
    const abyssalTemp = 3 + (i % 3);
    const abyssalPercent = 85 + (i % 10);
    const abyssalGrowth = 15 + (i % 15);

    // ==========================================
    // PART 1 SCENARIOS
    // ==========================================
    let p1Transcript = '';
    let p1Questions = [];
    let p1Title = '';

    if (p1Idx === 0) {
      p1Title = 'Part 1: Hotel Booking';
      p1Transcript = 'Receptionist: Good morning, Grand Hotel. How may I help you today? Guest: Good morning. Yes, I would like to book a double room for ' + night + ' nights, please. Receptionist: Certainly. What is the preferred check-in date? Guest: I would like to check in on the ' + date + ' of March. Receptionist: Excellent. A double room is available for those dates. The rate is ' + rate + ' dollars per night, which includes complimentary high-speed internet. Guest: Perfect. My name is James ' + name + '.';
      p1Questions = [
        { id: 'q1', type: 'fillBlank', text: 'The guest wants to book a room for _____ nights.', correctAnswer: night },
        { id: 'q2', type: 'multipleChoice', text: 'What type of room does the guest prefer?', options: ['Single', 'Double', 'Suite', 'Family'], correctAnswer: 'Double' },
        { id: 'q3', type: 'fillBlank', text: 'The check-in date is the _____ of March.', correctAnswer: date },
        { id: 'q4', type: 'fillBlank', text: 'The total cost is $_____ per night.', correctAnswer: rate.toString() },
        { id: 'q5', type: 'multipleChoice', text: 'Breakfast is served from:', options: ['6-9 AM', '7-10 AM', '8-11 AM', '9-12 PM'], correctAnswer: '7-10 AM' },
        { id: 'q6', type: 'fillBlank', text: 'The hotel is near the central _____ station.', correctAnswer: station },
        { id: 'q7', type: 'fillBlank', text: 'The fitness center is on the _____ floor.', correctAnswer: floor },
        { id: 'q8', type: 'multipleChoice', text: 'What are the fitness center opening hours?', options: ['6 AM - 10 PM', '24 hours', '8 AM - 9 PM', '7 AM - 11 PM'], correctAnswer: '24 hours' },
        { id: 'q9', type: 'fillBlank', text: 'Late checkout costs an additional $_____.', correctAnswer: cost.toString() },
        { id: 'q10', type: 'fillBlank', text: "The guest's surname is _____ .", correctAnswer: name }
      ];
    } else if (p1Idx === 1) {
      p1Title = 'Part 1: Car Rental Enquiry';
      p1Transcript = 'Clerk: Good day, drive-away rentals. How can I assist you? Customer: Hello, I need to rent a vehicle for ' + night + ' days starting from the ' + date + ' of June. Clerk: Right, I can arrange that. We have a mid-size sedan available. The rate is ' + rate + ' dollars daily. Customer: That fits my budget. My name is Robert ' + name + '.';
      p1Questions = [
        { id: 'q1', type: 'fillBlank', text: 'Rental duration: _____ days.', correctAnswer: night },
        { id: 'q2', type: 'multipleChoice', text: 'What model of vehicle is suggested?', options: ['Compact', 'Sedan', 'SUV', 'Minivan'], correctAnswer: 'Sedan' },
        { id: 'q3', type: 'fillBlank', text: 'The pickup date is the _____ of June.', correctAnswer: date },
        { id: 'q4', type: 'fillBlank', text: 'The daily rate is $_____ .', correctAnswer: rate.toString() },
        { id: 'q5', type: 'multipleChoice', text: 'Standard collision insurance is:', options: ['Not available', 'Included', 'Optional extra', 'Waived'], correctAnswer: 'Included' },
        { id: 'q6', type: 'fillBlank', text: 'The drop-off point is close to the _____ station.', correctAnswer: station },
        { id: 'q7', type: 'fillBlank', text: 'GPS navigation system costs $_____ extra.', correctAnswer: cost.toString() },
        { id: 'q8', type: 'multipleChoice', text: 'A child seat is required:', options: ['Yes', 'No', 'Optional', 'Not mentioned'], correctAnswer: 'No' },
        { id: 'q9', type: 'fillBlank', text: 'The customer will pay using _____ .', correctAnswer: 'credit card' },
        { id: 'q10', type: 'fillBlank', text: "The customer's surname is _____ .", correctAnswer: name }
      ];
    } else if (p1Idx === 2) {
      p1Title = 'Part 1: Gym Membership';
      p1Transcript = 'Trainer: Welcome to Peak Fitness. Looking to join? Customer: Yes, I would like to sign up for a ' + night + ' month membership starting the ' + date + ' of January. Trainer: Great! Our rate is ' + rate + ' dollars per month. By the way, my name is Alex ' + name + '.';
      p1Questions = [
        { id: 'q1', type: 'fillBlank', text: 'Membership commitment: _____ months.', correctAnswer: night },
        { id: 'q2', type: 'multipleChoice', text: 'Which tier of membership is chosen?', options: ['Basic', 'Silver', 'Gold', 'Platinum'], correctAnswer: 'Gold' },
        { id: 'q3', type: 'fillBlank', text: 'The membership begins on the _____ of January.', correctAnswer: date },
        { id: 'q4', type: 'fillBlank', text: 'The monthly fee is $_____ .', correctAnswer: rate.toString() },
        { id: 'q5', type: 'multipleChoice', text: 'How many personal trainer sessions are included?', options: ['None', 'One session', 'Two sessions', 'Unlimited'], correctAnswer: 'Two sessions' },
        { id: 'q6', type: 'fillBlank', text: 'The gym is located near the _____ station.', correctAnswer: station },
        { id: 'q7', type: 'fillBlank', text: 'Locker rental number assigned is _____ .', correctAnswer: cost.toString() },
        { id: 'q8', type: 'multipleChoice', text: 'What is the primary fitness goal?', options: ['Cardio health', 'Weight loss', 'Muscle building', 'General fitness'], correctAnswer: 'General fitness' },
        { id: 'q9', type: 'fillBlank', text: 'The emergency contact relation is _____ .', correctAnswer: 'brother' },
        { id: 'q10', type: 'fillBlank', text: "The customer's surname is _____ .", correctAnswer: name }
      ];
    } else if (p1Idx === 3) {
      p1Title = 'Part 1: Job Interview Prep';
      p1Transcript = 'Interviewer: Thank you for coming in today. We are hiring for a ' + night + ' week contract position starting on the ' + date + ' of September. The hourly rate is ' + rate + ' dollars. Candidate: That sounds perfect. My surname is ' + name + '.';
      p1Questions = [
        { id: 'q1', type: 'fillBlank', text: 'The position contract is for _____ weeks.', correctAnswer: night },
        { id: 'q2', type: 'multipleChoice', text: 'What is the vacancy department?', options: ['Sales', 'Marketing', 'Customer Service', 'Tech Support'], correctAnswer: 'Customer Service' },
        { id: 'q3', type: 'fillBlank', text: 'The expected start date is the _____ of September.', correctAnswer: date },
        { id: 'q4', type: 'fillBlank', text: 'The hourly pay rate is $_____ .', correctAnswer: rate.toString() },
        { id: 'q5', type: 'multipleChoice', text: 'Which shifts are preferred?', options: ['Morning', 'Evening', 'Night', 'Flexible'], correctAnswer: 'Morning' },
        { id: 'q6', type: 'fillBlank', text: 'The candidate has a notice period of _____ weeks.', correctAnswer: 'two' },
        { id: 'q7', type: 'fillBlank', text: 'The reference is from a former _____ .', correctAnswer: 'manager' },
        { id: 'q8', type: 'multipleChoice', text: 'What certification is required?', options: ['First Aid', 'IT Diploma', 'Drivers License', 'Food Safety'], correctAnswer: 'First Aid' },
        { id: 'q9', type: 'fillBlank', text: 'The interview took place in the _____ room.', correctAnswer: 'conference' },
        { id: 'q10', type: 'fillBlank', text: "The candidate's surname is _____ .", correctAnswer: name }
      ];
    } else {
      p1Title = 'Part 1: Travel Tour Booking';
      p1Transcript = 'Agent: Good morning, adventure tours. Customer: Hi, I want to book the safari tour for ' + night + ' people starting the ' + date + ' of October. Agent: Excellent choice. The price is ' + rate + ' dollars per ticket. My name is Thomas ' + name + '.';
      p1Questions = [
        { id: 'q1', type: 'fillBlank', text: 'Number of tickets requested: _____ .', correctAnswer: night },
        { id: 'q2', type: 'multipleChoice', text: 'Which tour type is booked?', options: ['City Tour', 'Safari Tour', 'Boat Cruise', 'Hiking Trip'], correctAnswer: 'Safari Tour' },
        { id: 'q3', type: 'fillBlank', text: 'The tour departure date is the _____ of October.', correctAnswer: date },
        { id: 'q4', type: 'fillBlank', text: 'The ticket cost is $_____ per person.', correctAnswer: rate.toString() },
        { id: 'q5', type: 'multipleChoice', text: 'Lunch options included:', options: ['Standard only', 'Vegetarian & Vegan', 'No lunch', 'Gluten-free option'], correctAnswer: 'Vegetarian & Vegan' },
        { id: 'q6', type: 'fillBlank', text: 'The pick-up location is near the _____ hotel.', correctAnswer: station },
        { id: 'q7', type: 'fillBlank', text: 'The tour guide code is _____ .', correctAnswer: cost.toString() },
        { id: 'q8', type: 'multipleChoice', text: 'Activity level is rated as:', options: ['Easy', 'Moderate', 'Challenging', 'Extreme'], correctAnswer: 'Moderate' },
        { id: 'q9', type: 'fillBlank', text: 'Free cancellation is available up to _____ hours prior.', correctAnswer: '48' },
        { id: 'q10', type: 'fillBlank', text: "The agent's surname is _____ .", correctAnswer: name }
      ];
    }

    // ==========================================
    // PART 2 SCENARIOS
    // ==========================================
    let p2Transcript = '';
    let p2Questions = [];
    let p2Title = '';

    if (p2Idx === 0) {
      p2Title = 'Part 2: Campus Library Tour';
      p2Transcript = "Welcome everyone to the university library. I'm Sarah. As you enter, to your right is the circulation desk. The entire second floor is a silent zone. We have twelve soundproof study pods on the third floor. Opening hours during term are 8 AM to midnight, Monday to Friday. The basement has a printing room: 10 cents per page.";
      p2Questions = [
        { id: 'q11', type: 'mapLabeling', text: 'Circulation desk', mapImage: '/library_map.png', options: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'], correctAnswer: testLetters[0] },
        { id: 'q12', type: 'mapLabeling', text: 'Reference section', mapImage: '/library_map.png', options: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'], correctAnswer: testLetters[1] },
        { id: 'q13', type: 'mapLabeling', text: 'Silent study zone', mapImage: '/library_map.png', options: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'], correctAnswer: testLetters[2] },
        { id: 'q14', type: 'mapLabeling', text: 'Study pods', mapImage: '/library_map.png', options: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'], correctAnswer: testLetters[3] },
        { id: 'q15', type: 'mapLabeling', text: 'Restrooms', mapImage: '/library_map.png', options: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'], correctAnswer: testLetters[4] },
        { id: 'q16', type: 'fillBlank', text: 'The printing room is on the _____ floor.', correctAnswer: 'basement' },
        { id: 'q17', type: 'multipleChoice', text: 'How much does color printing cost per page?', options: ['10 cents', '15 cents', '20 cents', '25 cents'], correctAnswer: '25 cents' },
        { id: 'q18', type: 'fillBlank', text: 'Students log in to Wi-Fi using their _____ .', correctAnswer: 'student ID' },
        { id: 'q19', type: 'fillBlank', text: 'The maximum borrowing limit is _____ books.', correctAnswer: '10' },
        { id: 'q20', type: 'fillBlank', text: 'Overdue fines are _____ cents per day.', correctAnswer: '50' }
      ];
    } else if (p2Idx === 1) {
      p2Title = 'Part 2: Museum Guide Tour';
      p2Transcript = "Hello and welcome to the City Museum. Today we will start from the exhibition hall. The café is located at the back. We have the gift shop on your left. The cloakroom is right next to the entrance. You can pick up audio guides on the ground floor. The museum is open daily from 9 AM to 6 PM.";
      p2Questions = [
        { id: 'q11', type: 'mapLabeling', text: 'Exhibition Hall', mapImage: '/library_map.png', options: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'], correctAnswer: testLetters[0] },
        { id: 'q12', type: 'mapLabeling', text: 'Museum Café', mapImage: '/library_map.png', options: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'], correctAnswer: testLetters[1] },
        { id: 'q13', type: 'mapLabeling', text: 'Gift Shop', mapImage: '/library_map.png', options: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'], correctAnswer: testLetters[2] },
        { id: 'q14', type: 'mapLabeling', text: 'Cloakroom', mapImage: '/library_map.png', options: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'], correctAnswer: testLetters[3] },
        { id: 'q15', type: 'mapLabeling', text: 'Audio Guide Desk', mapImage: '/library_map.png', options: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'], correctAnswer: testLetters[4] },
        { id: 'q16', type: 'fillBlank', text: 'The museum closing hour is _____ PM.', correctAnswer: '6' },
        { id: 'q17', type: 'multipleChoice', text: 'Photography is allowed in:', options: ['Nowhere', 'Exhibition halls only', 'All areas except temporary displays', 'Everywhere'], correctAnswer: 'All areas except temporary displays' },
        { id: 'q18', type: 'fillBlank', text: 'Student entry ticket is $ _____ .', correctAnswer: '5' },
        { id: 'q19', type: 'fillBlank', text: 'The museum contains artifacts dating back _____ years.', correctAnswer: '2000' },
        { id: 'q20', type: 'fillBlank', text: 'Guided tours start every _____ minutes.', correctAnswer: '30' }
      ];
    } else if (p2Idx === 2) {
      p2Title = 'Part 2: Zoo & Wildlife Tour';
      p2Transcript = "Good morning. Welcome to the Wildlife Park. As you enter, the tiger enclosure is straight ahead. The reptile house is in the west wing. Our souvenir shop is by the exit. The Zoo Café offers refreshments and is located on your right. The main entrance is where we are now. Feedings are scheduled at noon.";
      p2Questions = [
        { id: 'q11', type: 'mapLabeling', text: 'Tiger Enclosure', mapImage: '/library_map.png', options: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'], correctAnswer: testLetters[0] },
        { id: 'q12', type: 'mapLabeling', text: 'Reptile House', mapImage: '/library_map.png', options: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'], correctAnswer: testLetters[1] },
        { id: 'q13', type: 'mapLabeling', text: 'Souvenir Shop', mapImage: '/library_map.png', options: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'], correctAnswer: testLetters[2] },
        { id: 'q14', type: 'mapLabeling', text: 'Zoo Café', mapImage: '/library_map.png', options: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'], correctAnswer: testLetters[3] },
        { id: 'q15', type: 'mapLabeling', text: 'Main Entrance', mapImage: '/library_map.png', options: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'], correctAnswer: testLetters[4] },
        { id: 'q16', type: 'fillBlank', text: 'Animal feeding time starts at _____ .', correctAnswer: 'noon' },
        { id: 'q17', type: 'multipleChoice', text: 'What is the park emergency phone number?', options: ['911', 'Extension 5', 'Extension 9', '999'], correctAnswer: 'Extension 9' },
        { id: 'q18', type: 'fillBlank', text: 'Adult tickets cost $ _____ .', correctAnswer: '25' },
        { id: 'q19', type: 'fillBlank', text: 'The zoo has over _____ animal species.', correctAnswer: '150' },
        { id: 'q20', type: 'fillBlank', text: 'The zoo closes at _____ PM during winter.', correctAnswer: '4' }
      ];
    } else if (p2Idx === 3) {
      p2Title = 'Part 2: Music Festival Guide';
      p2Transcript = "Hello everyone and welcome to the Summer Beats Festival. Let me direct you: the Main Stage is in the north field. The Food Court is in the center. First Aid is next to the entrance gate. The Merchandise Booth is to your left, and the VIP area is in the east meadow.";
      p2Questions = [
        { id: 'q11', type: 'mapLabeling', text: 'Main Stage', mapImage: '/library_map.png', options: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'], correctAnswer: testLetters[0] },
        { id: 'q12', type: 'mapLabeling', text: 'Food Court', mapImage: '/library_map.png', options: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'], correctAnswer: testLetters[1] },
        { id: 'q13', type: 'mapLabeling', text: 'First Aid Tent', mapImage: '/library_map.png', options: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'], correctAnswer: testLetters[2] },
        { id: 'q14', type: 'mapLabeling', text: 'Merchandise Booth', mapImage: '/library_map.png', options: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'], correctAnswer: testLetters[3] },
        { id: 'q15', type: 'mapLabeling', text: 'VIP Area', mapImage: '/library_map.png', options: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'], correctAnswer: testLetters[4] },
        { id: 'q16', type: 'fillBlank', text: 'The headlining act starts at _____ PM.', correctAnswer: '9' },
        { id: 'q17', type: 'multipleChoice', text: 'Where can you refill water bottles?', options: ['Refill stations', 'Food court only', 'Restrooms', 'Merchandise booth'], correctAnswer: 'Refill stations' },
        { id: 'q18', type: 'fillBlank', text: 'Day passes cost $ _____ .', correctAnswer: '80' },
        { id: 'q19', type: 'fillBlank', text: 'Total number of stages is _____ .', correctAnswer: '3' },
        { id: 'q20', type: 'fillBlank', text: 'Campers must exit by _____ AM on Monday.', correctAnswer: '10' }
      ];
    } else {
      p2Title = 'Part 2: Community Centre Activities';
      p2Transcript = "Welcome to the Riverside Community Centre. Let's orient ourselves: the Sports Hall is our biggest space. The Dance Studio has mirrored walls. The Cafeteria is straight ahead. Our main Reception is on your right, and the Conference Room is on the second floor.";
      p2Questions = [
        { id: 'q11', type: 'mapLabeling', text: 'Sports Hall', mapImage: '/library_map.png', options: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'], correctAnswer: testLetters[0] },
        { id: 'q12', type: 'mapLabeling', text: 'Dance Studio', mapImage: '/library_map.png', options: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'], correctAnswer: testLetters[1] },
        { id: 'q13', type: 'mapLabeling', text: 'Cafeteria', mapImage: '/library_map.png', options: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'], correctAnswer: testLetters[2] },
        { id: 'q14', type: 'mapLabeling', text: 'Reception Desk', mapImage: '/library_map.png', options: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'], correctAnswer: testLetters[3] },
        { id: 'q15', type: 'mapLabeling', text: 'Conference Room', mapImage: '/library_map.png', options: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'], correctAnswer: testLetters[4] },
        { id: 'q16', type: 'fillBlank', text: 'The centre opens at _____ AM on weekends.', correctAnswer: '9' },
        { id: 'q17', type: 'multipleChoice', text: 'Which class is free for members?', options: ['Yoga', 'Aerobics', 'Spin class', 'Zumba'], correctAnswer: 'Yoga' },
        { id: 'q18', type: 'fillBlank', text: 'Annual membership fee is $ _____ .', correctAnswer: '120' },
        { id: 'q19', type: 'fillBlank', text: 'The parking lot holds _____ cars.', correctAnswer: '50' },
        { id: 'q20', type: 'fillBlank', text: 'The coordinator name is _____ .', correctAnswer: name }
      ];
    }

    // ==========================================
    // PART 3 SCENARIOS
    // ==========================================
    let p3Transcript = '';
    let p3Questions = [];
    let p3Title = '';

    if (p3Idx === 0) {
      p3Title = 'Part 3: Biology Project Discussion';
      p3Transcript = "John: Hi Emma. Let's focus our biology project on mangrove forests in Southeast Asia. They are crucial for coastal defense but destroyed for shrimp farming. Emma: We need to submit our proposal by Friday. The final submission needs to be at least 3,000 words.";
      p3Questions = [
        { id: 'q21', type: 'matching', text: 'Ecological importance study', options: ['A. Will do this week', 'B. Will do next week', 'C. Will not do'], correctAnswer: matchAnswers.q21 },
        { id: 'q22', type: 'matching', text: 'Economic drivers research', options: ['A. Will do this week', 'B. Will do next week', 'C. Will not do'], correctAnswer: matchAnswers.q22 },
        { id: 'q23', type: 'matching', text: 'Proposal draft', options: ['A. Will do this week', 'B. Will do next week', 'C. Will not do'], correctAnswer: matchAnswers.q23 },
        { id: 'q24', type: 'matching', text: 'Visual slides outline', options: ['A. Will do this week', 'B. Will do next week', 'C. Will not do'], correctAnswer: matchAnswers.q24 },
        { id: 'q25', type: 'matching', text: 'Final word count check', options: ['A. Will do this week', 'B. Will do next week', 'C. Will not do'], correctAnswer: matchAnswers.q25 },
        { id: 'q26', type: 'multipleChoice', text: 'What type of visual presentation will they use?', options: ['Poster', 'Slides', 'Video', 'Infographic'], correctAnswer: 'Slides' },
        { id: 'q27', type: 'fillBlank', text: 'Emma will share the outline with John by _____ .', correctAnswer: 'Tuesday' },
        { id: 'q28', type: 'fillBlank', text: 'The paper must be at least _____ words.', correctAnswer: '3000' },
        { id: 'q29', type: 'fillBlank', text: 'They plan to aim for _____ words to be safe.', correctAnswer: '3500' },
        { id: 'q30', type: 'multipleChoice', text: 'What will be embedded in the slides?', options: ['Photos only', 'Graphs and data', 'Text summaries', 'Maps'], correctAnswer: 'Graphs and data' }
      ];
    } else if (p3Idx === 1) {
      p3Title = 'Part 3: Business Case Study';
      p3Transcript = "Alice: Hi Bob. We need to assign tasks for our marketing case study on retail brands. I can handle the customer survey, and Charlie can write the executive summary. Bob: We need to submit the slides by Thursday. The final presentation is next week.";
      p3Questions = [
        { id: 'q21', type: 'matching', text: 'Competitor analysis', options: ['A. Alice will do', 'B. Bob will do', 'C. Charlie will do'], correctAnswer: matchAnswers.q21 },
        { id: 'q22', type: 'matching', text: 'Customer survey', options: ['A. Alice will do', 'B. Bob will do', 'C. Charlie will do'], correctAnswer: matchAnswers.q22 },
        { id: 'q23', type: 'matching', text: 'Financial projections', options: ['A. Alice will do', 'B. Bob will do', 'C. Charlie will do'], correctAnswer: matchAnswers.q23 },
        { id: 'q24', type: 'matching', text: 'Executive summary', options: ['A. Alice will do', 'B. Bob will do', 'C. Charlie will do'], correctAnswer: matchAnswers.q24 },
        { id: 'q25', type: 'matching', text: 'Slide design', options: ['A. Alice will do', 'B. Bob will do', 'C. Charlie will do'], correctAnswer: matchAnswers.q25 },
        { id: 'q26', type: 'multipleChoice', text: 'What is the case study industry focus?', options: ['Agriculture', 'Automotive', 'Retail brands', 'E-commerce'], correctAnswer: 'Retail brands' },
        { id: 'q27', type: 'fillBlank', text: 'The slides must be submitted by _____ .', correctAnswer: 'Thursday' },
        { id: 'q28', type: 'fillBlank', text: 'The team surveyed _____ customers.', correctAnswer: '100' },
        { id: 'q29', type: 'fillBlank', text: 'The brand selected is from _____ .', correctAnswer: 'Germany' },
        { id: 'q30', type: 'multipleChoice', text: 'The presentation length limit is:', options: ['10 minutes', '15 minutes', '20 minutes', '30 minutes'], correctAnswer: '15 minutes' }
      ];
    } else if (p3Idx === 2) {
      p3Title = 'Part 3: Chemistry Lab Report';
      p3Transcript = "Dave: Hello Emily. Let's list the tasks for the titration lab report. I have completed the safety briefing, but the equipment calibration is scheduled for tomorrow. Emily: The report is due on Wednesday. We need to submit it online.";
      p3Questions = [
        { id: 'q21', type: 'matching', text: 'Titration experiment', options: ['A. Completed', 'B. In progress', 'C. Scheduled'], correctAnswer: matchAnswers.q21 },
        { id: 'q22', type: 'matching', text: 'Equipment calibration', options: ['A. Completed', 'B. In progress', 'C. Scheduled'], correctAnswer: matchAnswers.q22 },
        { id: 'q23', type: 'matching', text: 'Safety briefing', options: ['A. Completed', 'B. In progress', 'C. Scheduled'], correctAnswer: matchAnswers.q23 },
        { id: 'q24', type: 'matching', text: 'Data analysis plotting', options: ['A. Completed', 'B. In progress', 'C. Scheduled'], correctAnswer: matchAnswers.q24 },
        { id: 'q25', type: 'matching', text: 'Waste chemical disposal', options: ['A. Completed', 'B. In progress', 'C. Scheduled'], correctAnswer: matchAnswers.q25 },
        { id: 'q26', type: 'multipleChoice', text: 'The reaction catalyst is made of:', options: ['Iron', 'Platinum', 'Nickel', 'Copper'], correctAnswer: 'Platinum' },
        { id: 'q27', type: 'fillBlank', text: 'The report must be submitted by _____ .', correctAnswer: 'Wednesday' },
        { id: 'q28', type: 'fillBlank', text: 'The experiment room temperature was _____ Celsius.', correctAnswer: '22' },
        { id: 'q29', type: 'fillBlank', text: 'The acid concentration was _____ molar.', correctAnswer: '0.1' },
        { id: 'q30', type: 'multipleChoice', text: 'Where should lab coats be stored?', options: ['Locker', 'Hanger', 'Lab bench', 'Home'], correctAnswer: 'Locker' }
      ];
    } else if (p3Idx === 3) {
      p3Title = 'Part 3: History Presentation';
      p3Transcript = "Lorna: Hi Ian. For our presentation on historical treaties, we should group slide topics. Let's put Winston Churchill on Slide 1, and Franklin Roosevelt on Slide 2. Ian: We need to practice the timing today. The presentation is worth 20 percent of our grade.";
      p3Questions = [
        { id: 'q21', type: 'matching', text: 'Winston Churchill profile', options: ['A. Slide 1', 'B. Slide 2', 'C. Slide 3'], correctAnswer: matchAnswers.q21 },
        { id: 'q22', type: 'matching', text: 'Franklin Roosevelt policy', options: ['A. Slide 1', 'B. Slide 2', 'C. Slide 3'], correctAnswer: matchAnswers.q22 },
        { id: 'q23', type: 'matching', text: 'Joseph Stalin influence', options: ['A. Slide 1', 'B. Slide 2', 'C. Slide 3'], correctAnswer: matchAnswers.q23 },
        { id: 'q24', type: 'matching', text: 'Dwight Eisenhower military', options: ['A. Slide 1', 'B. Slide 2', 'C. Slide 3'], correctAnswer: matchAnswers.q24 },
        { id: 'q25', type: 'matching', text: 'Treaty signing locations', options: ['A. Slide 1', 'B. Slide 2', 'C. Slide 3'], correctAnswer: matchAnswers.q25 },
        { id: 'q26', type: 'multipleChoice', text: 'The presentation topic focuses on:', options: ['World War I', 'World War II treaties', 'The Cold War', 'League of Nations'], correctAnswer: 'World War II treaties' },
        { id: 'q27', type: 'fillBlank', text: 'The presentation counts for _____ percent of the final grade.', correctAnswer: '20' },
        { id: 'q28', type: 'fillBlank', text: 'The treaty was signed in the year _____ .', correctAnswer: '1945' },
        { id: 'q29', type: 'fillBlank', text: 'The treaty signing city was _____ .', correctAnswer: 'Yalta' },
        { id: 'q30', type: 'multipleChoice', text: 'Which tool will they use for slides?', options: ['Keynote', 'PowerPoint', 'Prezi', 'Google Slides'], correctAnswer: 'PowerPoint' }
      ];
    } else {
      p3Title = 'Part 3: Architecture Design';
      p3Transcript = "Gary: Hi Helen. Let's categorize the green building features by cost tier. Solar panels are a high-cost tier, but rainwater harvesting is low-cost. Helen: Our submission is due on Friday. We need to submit the 3D model.";
      p3Questions = [
        { id: 'q21', type: 'matching', text: 'Solar panel grid installation', options: ['A. High cost', 'B. Medium cost', 'C. Low cost'], correctAnswer: matchAnswers.q21 },
        { id: 'q22', type: 'matching', text: 'Rainwater harvesting system', options: ['A. High cost', 'B. Medium cost', 'C. Low cost'], correctAnswer: matchAnswers.q22 },
        { id: 'q23', type: 'matching', text: 'Triple-glazed thermal windows', options: ['A. High cost', 'B. Medium cost', 'C. Low cost'], correctAnswer: matchAnswers.q23 },
        { id: 'q24', type: 'matching', text: 'Recycled cellulose insulation', options: ['A. High cost', 'B. Medium cost', 'C. Low cost'], correctAnswer: matchAnswers.q24 },
        { id: 'q25', type: 'matching', text: 'Green roof landscaping', options: ['A. High cost', 'B. Medium cost', 'C. Low cost'], correctAnswer: matchAnswers.q25 },
        { id: 'q26', type: 'multipleChoice', text: 'What model file format is requested?', options: ['CAD', 'PDF', 'BIM model', 'SketchUp'], correctAnswer: 'BIM model' },
        { id: 'q27', type: 'fillBlank', text: 'The architectural design is due on _____ .', correctAnswer: 'Friday' },
        { id: 'q28', type: 'fillBlank', text: 'The building has a height of _____ meters.', correctAnswer: '25' },
        { id: 'q29', type: 'fillBlank', text: 'Expected LEED certification tier is _____ .', correctAnswer: 'Gold' },
        { id: 'q30', type: 'multipleChoice', text: 'The structural material used is:', options: ['Concrete', 'Steel frame', 'Timber', 'Brick'], correctAnswer: 'Timber' }
      ];
    }

    // ==========================================
    // PART 4 SCENARIOS
    // ==========================================
    let p4Transcript = '';
    let p4Questions = [];
    let p4Title = '';

    if (p4Idx === 0) {
      p4Title = 'Part 4: Marine Biology Lecture';
      p4Transcript = "Good morning. Today's lecture covers deep-sea marine biology. The abyssal zone lies between 4,000 and " + abyssalDepth + " meters. The food web relies on marine snow. Deep-sea fish use bioluminescence to attract prey. The anglerfish is a classic example. Temperature in the abyssal zone is between 2 and " + abyssalTemp + " degrees Celsius. Over " + abyssalPercent + " percent of deep-sea species remain undiscovered. The deep-sea research budget has grown by " + abyssalGrowth + " percent.";
      p4Questions = [
        { id: 'q31', type: 'fillBlank', text: 'The abyssal zone is between 4,000 and _____ meters.', correctAnswer: abyssalDepth.toString() },
        { id: 'q32', type: 'multipleChoice', text: 'What do deep-sea organisms rely on for food?', options: ['Kelp forests', 'Marine snow', 'Thermal vents', 'Plankton'], correctAnswer: 'Marine snow' },
        { id: 'q33', type: 'trueFalseNotGiven', text: 'Bioluminescence is used exclusively to attract mates.', correctAnswer: 'False' },
        { id: 'q34', type: 'fillBlank', text: 'Due to immense pressure, abyssal creatures have _____ bodies.', correctAnswer: 'gelatinous' },
        { id: 'q35', type: 'multipleChoice', text: 'Which fish uses a glowing lure from its head?', options: ['Lanternfish', 'Viperfish', 'Anglerfish', 'Gulper eel'], correctAnswer: 'Anglerfish' },
        { id: 'q36', type: 'fillBlank', text: 'Water temperature in the abyssal zone is between 2 and _____ degrees Celsius.', correctAnswer: abyssalTemp.toString() },
        { id: 'q37', type: 'multipleChoice', text: 'What are organisms adapted to extreme conditions called?', options: ['Hydrophiles', 'Extremophiles', 'Thermophiles', 'Halophiles'], correctAnswer: 'Extremophiles' },
        { id: 'q38', type: 'fillBlank', text: 'Scientists use remotely operated _____ (ROVs).', correctAnswer: 'vehicles' },
        { id: 'q39', type: 'fillBlank', text: 'Over _____ percent of deep-sea species remain undiscovered.', correctAnswer: abyssalPercent.toString() },
        { id: 'q40', type: 'fillBlank', text: 'The deep-sea research budget has grown by _____ percent.', correctAnswer: abyssalGrowth.toString() }
      ];
    } else if (p4Idx === 1) {
      p4Title = 'Part 4: History of Agriculture';
      p4Transcript = "Good day. Today we study the agricultural revolution. Early farming started " + abyssalDepth + " years ago. Farmers used crop rotation to fertilize soil. Irrigation was developed near major rivers. Soil salinity increased, causing crop failures. Over " + abyssalPercent + " percent of early societies relied entirely on farming. The agricultural output grew by " + abyssalGrowth + " percent.";
      p4Questions = [
        { id: 'q31', type: 'fillBlank', text: 'Farming started approximately _____ years ago.', correctAnswer: abyssalDepth.toString() },
        { id: 'q32', type: 'multipleChoice', text: 'How did early farmers maintain soil fertility?', options: ['Chemical fertilizer', 'Crop rotation', 'Leaving land empty', 'Deep plowing'], correctAnswer: 'Crop rotation' },
        { id: 'q33', type: 'trueFalseNotGiven', text: 'Irrigation was invented in dry desert regions.', correctAnswer: 'False' },
        { id: 'q34', type: 'fillBlank', text: 'The major challenge for early farmers was soil _____ .', correctAnswer: 'salinity' },
        { id: 'q35', type: 'multipleChoice', text: 'Which early crop was farmed in East Asia?', options: ['Wheat', 'Barley', 'Rice', 'Maize'], correctAnswer: 'Rice' },
        { id: 'q36', type: 'fillBlank', text: 'The average temperature of the fertile crescent is _____ degrees.', correctAnswer: abyssalTemp.toString() },
        { id: 'q37', type: 'multipleChoice', text: 'What type of tool marked the Bronze Age?', options: ['Iron plow', 'Wooden spade', 'Metal sickle', 'Stone axe'], correctAnswer: 'Metal sickle' },
        { id: 'q38', type: 'fillBlank', text: 'Farms used draft _____ to pull heavy plows.', correctAnswer: 'animals' },
        { id: 'q39', type: 'fillBlank', text: 'Over _____ percent of early societies relied on farming.', correctAnswer: abyssalPercent.toString() },
        { id: 'q40', type: 'fillBlank', text: 'Total agricultural output increased by _____ percent.', correctAnswer: abyssalGrowth.toString() }
      ];
    } else if (p4Idx === 2) {
      p4Title = 'Part 4: Cognitive Psychology Lecture';
      p4Transcript = "Welcome. Today's lecture is on cognitive biases. Confirmation bias makes us look for info that confirms our beliefs. The brain processes " + abyssalDepth + " bits of sensory info per second. Short-term memory holds about " + abyssalTemp + " items. Neural plasticity allows learning new habits. Over " + abyssalPercent + " percent of decisions are driven by subconscious factors. Memory retention increases by " + abyssalGrowth + " percent with visual aids.";
      p4Questions = [
        { id: 'q31', type: 'fillBlank', text: 'The brain processes _____ bits of info per second.', correctAnswer: abyssalDepth.toString() },
        { id: 'q32', type: 'multipleChoice', text: 'Which bias involves seeking confirming information?', options: ['Anchor bias', 'Confirmation bias', 'Hindsight bias', 'Availability bias'], correctAnswer: 'Confirmation bias' },
        { id: 'q33', type: 'trueFalseNotGiven', text: 'Neural plasticity decreases with age.', correctAnswer: 'False' },
        { id: 'q34', type: 'fillBlank', text: 'Cognitive load is reduced by dividing tasks into _____ .', correctAnswer: 'chunks' },
        { id: 'q35', type: 'multipleChoice', text: 'Which memory type stores information temporarily?', options: ['Sensory memory', 'Short-term memory', 'Long-term memory', 'Episodic memory'], correctAnswer: 'Short-term memory' },
        { id: 'q36', type: 'fillBlank', text: 'Short-term memory holds about _____ items.', correctAnswer: abyssalTemp.toString() },
        { id: 'q37', type: 'multipleChoice', text: 'What improves memory recall dramatically?', options: ['Auditory lectures', 'Visual aids', 'Reading text', 'Scent triggers'], correctAnswer: 'Visual aids' },
        { id: 'q38', type: 'fillBlank', text: 'Mental fatigue causes a drop in _____ levels.', correctAnswer: 'attention' },
        { id: 'q39', type: 'fillBlank', text: 'Over _____ percent of choices are subconscious.', correctAnswer: abyssalPercent.toString() },
        { id: 'q40', type: 'fillBlank', text: 'Recall rates improved by _____ percent.', correctAnswer: abyssalGrowth.toString() }
      ];
    } else if (p4Idx === 3) {
      p4Title = 'Part 4: Renewable Energy Systems';
      p4Transcript = "Good morning. We focus today on solar photovoltaic systems. Modern panels have an efficiency rating of " + abyssalTemp + "0 percent. The peak solar radiation is " + abyssalDepth + " watts per square meter. Grid storage relies on lithium batteries. Over " + abyssalPercent + " percent of panels are recyclable. Wind energy output has grown by " + abyssalGrowth + " percent.";
      p4Questions = [
        { id: 'q31', type: 'fillBlank', text: 'Solar radiation peak is _____ watts per square meter.', correctAnswer: abyssalDepth.toString() },
        { id: 'q32', type: 'multipleChoice', text: 'What is the primary material in solar cells?', options: ['Copper', 'Silicon', 'Cadmium', 'Lead'], correctAnswer: 'Silicon' },
        { id: 'q33', type: 'trueFalseNotGiven', text: 'Wind turbine output is highly predictable.', correctAnswer: 'False' },
        { id: 'q34', type: 'fillBlank', text: 'Renewable power grids use smart _____ for load balancing.', correctAnswer: 'meters' },
        { id: 'q35', type: 'multipleChoice', text: 'Which storage tech is most common currently?', options: ['Flywheels', 'Hydro storage', 'Lithium batteries', 'Hydrogen fuel cells'], correctAnswer: 'Lithium batteries' },
        { id: 'q36', type: 'fillBlank', text: 'Average solar panel efficiency is _____ percent.', correctAnswer: (abyssalTemp * 10).toString() },
        { id: 'q37', type: 'multipleChoice', text: 'The main drawback of solar power is:', options: ['Intermittency', 'High pollution', 'No storage tech', 'Aesthetics'], correctAnswer: 'Intermittency' },
        { id: 'q38', type: 'fillBlank', text: 'Turbines convert kinetic energy into _____ power.', correctAnswer: 'electrical' },
        { id: 'q39', type: 'fillBlank', text: 'Over _____ percent of solar panel components are recyclable.', correctAnswer: abyssalPercent.toString() },
        { id: 'q40', type: 'fillBlank', text: 'Wind turbine capacity grew by _____ percent.', correctAnswer: abyssalGrowth.toString() }
      ];
    } else {
      p4Title = 'Part 4: Architecture & Urban Planning';
      p4Transcript = "Hello. Let's discuss sustainable urban planning. Green corridors extend over " + abyssalDepth + " hectares. City traffic congestion was reduced. Pedestrian zones are developed near the city center. Air pollution dropped by " + abyssalTemp + "0 percent. Over " + abyssalPercent + " percent of citizens prefer public transport. Urban green spaces grew by " + abyssalGrowth + " percent.";
      p4Questions = [
        { id: 'q31', type: 'fillBlank', text: 'Green corridors cover _____ hectares.', correctAnswer: abyssalDepth.toString() },
        { id: 'q32', type: 'multipleChoice', text: 'What is the primary goal of green corridors?', options: ['Commercial zoning', 'Wildlife migration & recreation', 'High-density housing', 'Road building'], correctAnswer: 'Wildlife migration & recreation' },
        { id: 'q33', type: 'trueFalseNotGiven', text: 'Zoning laws prohibit mixed-use developments.', correctAnswer: 'False' },
        { id: 'q34', type: 'fillBlank', text: 'Public transport use is promoted through lower _____ .', correctAnswer: 'fares' },
        { id: 'q35', type: 'multipleChoice', text: 'Which policy targets traffic reduction?', options: ['Congestion pricing', 'Speed limits', 'Free parking', 'Highway expansion'], correctAnswer: 'Congestion pricing' },
        { id: 'q36', type: 'fillBlank', text: 'Air pollution was reduced by _____ percent.', correctAnswer: (abyssalTemp * 10).toString() },
        { id: 'q37', type: 'multipleChoice', text: 'The city center is being adapted for:', options: ['Highways', 'Pedestrian zones', 'Industrial factories', 'Cargo trains'], correctAnswer: 'Pedestrian zones' },
        { id: 'q38', type: 'fillBlank', text: 'Sustainable cities require efficient water _____ .', correctAnswer: 'drainage' },
        { id: 'q39', type: 'fillBlank', text: 'Over _____ percent of residents prefer public transport.', correctAnswer: abyssalPercent.toString() },
        { id: 'q40', type: 'fillBlank', text: 'Urban green park acreage expanded by _____ percent.', correctAnswer: abyssalGrowth.toString() }
      ];
    }

    generatedTests[i.toString()] = {
      id: i.toString(),
      title: 'Cambridge Practice Test ' + i,
      duration: '30 min',
      difficulty: i % 3 === 0 ? 'hard' : (i % 2 === 0 ? 'medium' : 'easy'),
      parts: [
        { part: 1, title: p1Title, type: 'Conversation', transcript: p1Transcript, questions: p1Questions },
        { part: 2, title: p2Title, type: 'Monologue', transcript: p2Transcript, questions: p2Questions },
        { part: 3, title: p3Title, type: 'Academic Discussion', transcript: p3Transcript, questions: p3Questions },
        { part: 4, title: p4Title, type: 'Academic Lecture', transcript: p4Transcript, questions: p4Questions }
      ]
    };
  }
}

const outputPath = path.join(__dirname, '../data/cambridgeListeningTests.js');
const fileContent = 'const cambridgeListeningTests = ' + JSON.stringify(generatedTests, null, 2) + ';\n\nmodule.exports = cambridgeListeningTests;\n';
fs.writeFileSync(outputPath, fileContent);
console.log('Successfully generated 30 Cambridge tests at', outputPath);
