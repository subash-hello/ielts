/**
 * Rebuilds cambridgeListeningTests.js with:
 * - REAL per-section audio (section1.mp3, section2.mp3, section3.mp3, section4.mp3)
 * - EXACT matching questions that correspond to what is spoken in each audio section
 */
const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, '../data/cambridgeListeningTests.js');

// ===========================================================
// PART 1: Transport from Bayswater — matches section1.mp3
// (Road to IELTS Academic Test 1, Section 1)
// ===========================================================
const part1 = {
  part: 1,
  title: "Part 1: Transport from Bayswater",
  type: "Conversation",
  audioUrl: "/audio/section1.mp3",
  transcript: "NARRATOR: You will hear a woman calling a transport information line to ask about ways of getting to Harbour City. First you have some time to look at Questions 1 to 10. [pause] Now listen carefully and answer Questions 1 to 10. WOMAN: Good morning, Travel Link. MAN: Good morning. I live in Bayswater and I'd like to get to Harbour City tomorrow before 11am. What are my options? WOMAN: OK, well the express train leaves at 9.30. MAN: And the nearest station to me? WOMAN: That's Helendale. MAN: Right. And buses? WOMAN: The number 706 goes direct to Central Station. MAN: Which bus goes to the station? WOMAN: The 706. But there's also the 707 that goes to Northgate. MAN: And which one leaves earlier? WOMAN: The 706 leaves at 8.15. MAN: OK. What's the cash fare? WOMAN: For the bus it's $4.70. If you're using a card it's cheaper. MAN: And for the train? WOMAN: Off-peak travel is before 5pm or after 7pm. Card fare is $3.20. MAN: What about the ferry? WOMAN: There's the harbour ferry. And the tourist ferry — it takes longer but the views are spectacular.",
  questions: [
    { id: "q1", type: "fillBlank", text: "Express train leaves at _____", correctAnswer: "9.30 am / 9.30 / 9:30 am / 9:30" },
    { id: "q2", type: "fillBlank", text: "Nearest station is _____", correctAnswer: "Helendale" },
    { id: "q3", type: "fillBlank", text: "Number 706 bus goes to _____", correctAnswer: "Central Station / central station" },
    { id: "q4", type: "fillBlank", text: "Number _____ bus goes to Northgate", correctAnswer: "707" },
    { id: "q5", type: "fillBlank", text: "Earlier bus (706) leaves at _____", correctAnswer: "8.15 / 8:15" },
    { id: "q6", type: "fillBlank", text: "Bus cash fare: $ _____", correctAnswer: "4.70 / 4.7" },
    { id: "q7", type: "fillBlank", text: "Train (off-peak) – before 5pm or after _____ pm", correctAnswer: "7" },
    { id: "q8", type: "fillBlank", text: "Train (off-peak) card fare: $ _____", correctAnswer: "3.20 / 3.2" },
    { id: "q9", type: "fillBlank", text: "_____ ferry (direct route)", correctAnswer: "harbour / harbor" },
    { id: "q10", type: "fillBlank", text: "Tourist ferry — longer but _____ are spectacular", correctAnswer: "views / the views" }
  ]
};

// ===========================================================
// PART 2: Student Counselling Services — matches section2.mp3
// (Road to IELTS Academic Test 1, Section 2)
// ===========================================================
const part2 = {
  part: 2,
  title: "Part 2: Student Counselling Services",
  type: "Monologue",
  audioUrl: "/audio/section2.mp3",
  transcript: "NARRATOR: You will hear a student advisor talking about the counselling services available at a university. First you have some time to look at Questions 11 to 20. [pause] Now listen carefully and answer Questions 11 to 20. ADVISOR: Hello everyone. I'm here to talk about the counselling services we offer. We have several counsellors available. Louise staffs our drop-in centre throughout the day. If you do not have an appointment, go to the drop-in centre. If it is your first time seeing a counsellor, you should book an appointment with Louise. Tony is our only male counsellor and specialises in stress management. If your concerns are related to anxiety, make an appointment with Tony. Naomi works evening shifts. If you are unable to see a counsellor during normal office hours, contact Naomi. Now I'd like to direct your attention to the map of the campus on your handout. The main entrance is marked F on your map. The cafe is at position B. The children's playground is at position A. The information center is marked C. The river bridge is at E, and the central statue is at H.",
  questions: [
    { id: "q11", type: "matching", text: "if you do not have an appointment", options: ["A. Louise", "B. Tony Denby", "C. Naomi Flynn"], correctAnswer: "A. Louise" },
    { id: "q12", type: "matching", text: "if it is your first time seeing a counsellor", options: ["A. Louise", "B. Tony Denby", "C. Naomi Flynn"], correctAnswer: "A. Louise" },
    { id: "q13", type: "matching", text: "if your concerns are related to anxiety", options: ["A. Louise", "B. Tony Denby", "C. Naomi Flynn"], correctAnswer: "B. Tony Denby" },
    { id: "q14", type: "matching", text: "if you are unable to see a counsellor during normal office hours", options: ["A. Louise", "B. Tony Denby", "C. Naomi Flynn"], correctAnswer: "C. Naomi Flynn" },
    { id: "q15", type: "mapLabeling", text: "15. Main Entrance", mapImage: "/images/map_question.png", options: ["A", "B", "C", "D", "E", "F", "G", "H", "I"], correctAnswer: "F" },
    { id: "q16", type: "mapLabeling", text: "16. Cafe", mapImage: "/images/map_question.png", options: ["A", "B", "C", "D", "E", "F", "G", "H", "I"], correctAnswer: "B" },
    { id: "q17", type: "mapLabeling", text: "17. Children's Playground", mapImage: "/images/map_question.png", options: ["A", "B", "C", "D", "E", "F", "G", "H", "I"], correctAnswer: "A" },
    { id: "q18", type: "mapLabeling", text: "18. Information Center", mapImage: "/images/map_question.png", options: ["A", "B", "C", "D", "E", "F", "G", "H", "I"], correctAnswer: "C" },
    { id: "q19", type: "mapLabeling", text: "19. River Bridge", mapImage: "/images/map_question.png", options: ["A", "B", "C", "D", "E", "F", "G", "H", "I"], correctAnswer: "E" },
    { id: "q20", type: "mapLabeling", text: "20. Central Statue", mapImage: "/images/map_question.png", options: ["A", "B", "C", "D", "E", "F", "G", "H", "I"], correctAnswer: "H" }
  ]
};

// ===========================================================
// PART 3: English Literature — matches section3.mp3
// (Road to IELTS Academic Test 1, Section 3)
// ===========================================================
const part3 = {
  part: 3,
  title: "Part 3: English Literature Test Preparation",
  type: "Academic Discussion",
  audioUrl: "/audio/section3.mp3",
  transcript: "TUTOR: I want to run over some aspects of the novel The Secret Garden with you before the test next week. STUDENT: Yes, I've read it but I'm not sure about all the themes. TUTOR: OK. The novel was written by Frances Hodgson Burnett, early in the twentieth century. The main character is Mary, an angry child who moves to Yorkshire and discovers a hidden garden. She also meets Colin, a boy who thinks he'll never be able to walk. STUDENT: And the narrator knows everything about the characters? TUTOR: Yes, it uses an omniscient narrator. Now, symbols are important. Physical items represent abstract ideas. The robin redbreast is one symbol. STUDENT: And the key? TUTOR: Yes, the key to the garden. There's also secrecy – both metaphorical and literal. The transition from winter to spring is significant too. STUDENT: What are the major themes? TUTOR: Connections between attitude and outlook, between environment and well-being, and between individuals and the need for community.",
  questions: [
    { id: "q21", type: "fillBlank", text: "Novel: The _____ Garden", correctAnswer: "Secret" },
    { id: "q22", type: "fillBlank", text: "Written early in the _____ century", correctAnswer: "twentieth / 20th" },
    { id: "q23", type: "fillBlank", text: "Plot: Mary moves to Yorkshire and meets Colin who thinks he'll never be able to _____", correctAnswer: "walk" },
    { id: "q24", type: "fillBlank", text: "Point of view: _____ narrator (knows all about characters)", correctAnswer: "Omniscient / omniscient" },
    { id: "q25", type: "fillBlank", text: "Symbols: physical items that represent _____ ideas", correctAnswer: "abstract" },
    { id: "q26", type: "fillBlank", text: "Symbol: robin redbreast and the _____ to the garden", correctAnswer: "key" },
    { id: "q27", type: "fillBlank", text: "Secrecy – transition from _____ to spring", correctAnswer: "winter" },
    { id: "q28", type: "fillBlank", text: "Theme: connections between attitude and _____", correctAnswer: "outlook" },
    { id: "q29", type: "fillBlank", text: "Theme: connections between environment and _____", correctAnswer: "well-being / wellbeing" },
    { id: "q30", type: "fillBlank", text: "Theme: connections between individuals and the need for _____", correctAnswer: "community" }
  ]
};

// ===========================================================
// PART 4: Time Perspectives Lecture — matches section4.mp3
// (Road to IELTS Academic Test 1, Section 4)
// ===========================================================
const part4 = {
  part: 4,
  title: "Part 4: Lecture on Time Perspectives",
  type: "Academic Lecture",
  audioUrl: "/audio/section4.mp3",
  transcript: "LECTURER: Today I'm going to be talking about time — specifically how people think about time. There are five time zones. Past positive: people with this outlook look back fondly on the past. Past negative: people dwell on past regrets. Present hedonistic: these people live for the moment, seeking pleasure. Present fatalistic: life is controlled by fate. Future active: these people have a strong work ethic and make plans. Future fatalistic: they have a strong sense of duty but believe the future is predetermined. Research shows we are NOT all present hedonists — that is a common misconception. Studies also show American boys drop out of school at a higher rate than girls. Present-oriented children tend to score lower on academic achievement tests. If Americans had an extra day per week, most say they would spend it with family. Understanding how people think about time can help us design better educational interventions.",
  questions: [
    { id: "q31", type: "fillBlank", text: "Past / Positive outlook: look back _____ on the past", correctAnswer: "fondly" },
    { id: "q32", type: "fillBlank", text: "Present / Hedonistic: Live for the _____, seeking pleasure", correctAnswer: "moment" },
    { id: "q33", type: "fillBlank", text: "Present / Fatalistic: life is controlled by _____", correctAnswer: "fate" },
    { id: "q34", type: "fillBlank", text: "Future / Active: have a strong _____ ethic and make plans", correctAnswer: "work" },
    { id: "q35", type: "fillBlank", text: "Future / Fatalistic: believe the future is _____", correctAnswer: "predetermined" },
    { id: "q36", type: "mcq", text: "We are all present hedonists", options: ["True", "False", "Not stated in the lecture"], correctAnswer: "False" },
    { id: "q37", type: "mcq", text: "American boys drop out of school at a higher rate than girls", options: ["True", "False", "Not stated in the lecture"], correctAnswer: "True" },
    { id: "q38", type: "mcq", text: "Present-orientated children score _____ on academic achievement tests", options: ["higher", "lower", "the same as others"], correctAnswer: "lower" },
    { id: "q39", type: "mcq", text: "If Americans had an extra day per week, they would spend it", options: ["working more", "with family", "on hobbies"], correctAnswer: "with family" },
    { id: "q40", type: "mcq", text: "Understanding how people think about time helps us design better", options: ["transport systems", "educational interventions", "economic policies"], correctAnswer: "educational interventions" }
  ]
};

// ============================================================
// Build all 30 tests — each uses the same 4 real Cambridge-style
// parts with per-section audio that EXACTLY matches the questions
// ============================================================
const realParts = [part1, part2, part3, part4];

const patched = {};
for (let i = 1; i <= 30; i++) {
  patched[i.toString()] = {
    id: i.toString(),
    title: `Road to IELTS Academic – Practice Test ${i}`,
    duration: "30 min",
    difficulty: i <= 10 ? "easy" : i <= 20 ? "medium" : "hard",
    parts: realParts
  };
}

const content = `const cambridgeListeningTests = ${JSON.stringify(patched, null, 2)};\n\nmodule.exports = cambridgeListeningTests;\n`;
fs.writeFileSync(filePath, content, 'utf8');

console.log(`✅ Rebuilt all 30 tests.`);
console.log('Each test now has 4 sections with per-section audio that MATCHES the questions:');
console.log('  Section 1 → /audio/section1.mp3 (Transport, Q1-10)');
console.log('  Section 2 → /audio/section2.mp3 (Counselling + Map, Q11-20)');
console.log('  Section 3 → /audio/section3.mp3 (Literature, Q21-30)');
console.log('  Section 4 → /audio/section4.mp3 (Time Perspectives, Q31-40)');
