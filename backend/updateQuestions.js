const fs = require('fs');
const file = 'c:/Users/subas/OneDrive/Documents/projects/ielts/backend/src/data/cambridgeListeningTests.js';
let content = fs.readFileSync(file, 'utf8');

const replacement = `
          {
            "id": "q11",
            "type": "fillBlank",
            "text": "Please do not frighten or injure the _____ ",
            "correctAnswer": "animals / animal"
          },
          {
            "id": "q12",
            "type": "fillBlank",
            "text": "Stay at a safe distance from the _____ ",
            "correctAnswer": "tools / tool"
          },
          {
            "id": "q13",
            "type": "fillBlank",
            "text": "Visitors should ensure they are wearing _____ ",
            "correctAnswer": "shoes"
          },
          {
            "id": "q14",
            "type": "fillBlank",
            "text": "Do not bring _____, unless they are guide dogs",
            "correctAnswer": "dogs / dog"
          },
          {
            "id": "q15",
            "type": "mapLabeling",
            "text": "15. Scarecrow",
            "mapImage": "/images/map_question.png",
            "options": ["A","B","C","D","E","F","G","H","I"],
            "correctAnswer": "F"
          },
          {
            "id": "q16",
            "type": "mapLabeling",
            "text": "16. Maze",
            "mapImage": "/images/map_question.png",
            "options": ["A","B","C","D","E","F","G","H","I"],
            "correctAnswer": "G"
          },
          {
            "id": "q17",
            "type": "mapLabeling",
            "text": "17. Cafe",
            "mapImage": "/images/map_question.png",
            "options": ["A","B","C","D","E","F","G","H","I"],
            "correctAnswer": "D"
          },
          {
            "id": "q18",
            "type": "mapLabeling",
            "text": "18. Black Barn",
            "mapImage": "/images/map_question.png",
            "options": ["A","B","C","D","E","F","G","H","I"],
            "correctAnswer": "H"
          },
          {
            "id": "q19",
            "type": "mapLabeling",
            "text": "19. Covered picnic area",
            "mapImage": "/images/map_question.png",
            "options": ["A","B","C","D","E","F","G","H","I"],
            "correctAnswer": "C"
          },
          {
            "id": "q20",
            "type": "mapLabeling",
            "text": "20. Fiddy House",
            "mapImage": "/images/map_question.png",
            "options": ["A","B","C","D","E","F","G","H","I"],
            "correctAnswer": "A"
          }`;

// Replace q11 through q20 blocks
const regex = /\{\s*"id":\s*"q11"[\s\S]*?"correctAnswer":\s*"H"\s*\}/g;
content = content.replace(regex, replacement.trim());

// Also replace the transcript for Part 2 Student Counselling Services to the new Fiddy Working Heritage Farm text
const oldTranscript = "NARRATOR: You will hear a student advisor talking about the counselling services available at a university. First you have some time to look at Questions 11 to 20. [pause] Now listen carefully and answer Questions 11 to 20. ADVISOR: Hello everyone. I'm here to talk about the counselling services we offer. We have several counsellors available. Louise staffs our drop-in centre throughout the day. If you do not have an appointment, go to the drop-in centre. If it is your first time seeing a counsellor, you should book an appointment with Louise. Tony is our only male counsellor and specialises in stress management. If your concerns are related to anxiety, make an appointment with Tony. Naomi works evening shifts. If you are unable to see a counsellor during normal office hours, contact Naomi. Now I'd like to direct your attention to the map of the campus on your handout. The main entrance is marked F on your map. The cafe is at position B. The children's playground is at position A. The information center is marked C. The river bridge is at E, and the central statue is at H.";

const newTranscript = "Welcome to the Fiddy Working Heritage Farm. I must give you some advice and safety tips before we go any further. As it is a working farm, please do not frighten or injure the animals. We have a lot here. And do stay at a safe distance from the tools, some of them have sharp points. The ground is very uneven, so I am glad to see you are all wearing shoes. I do not think any of you have brought dogs with you, but in case you have, they will have to stay in the car park, unless they are guide dogs. Now, let me tell you about the farm layout. The scarecrow is located in the car park, in the corner, beside the main path. The maze is situated opposite the New Barn, beside a side path that branches off to the right. The cafe is located by turning right just before the bridge that crosses the fish pool. It is situated on the first bend. The Black Barn is accessed by taking the side path to the right by the New Barn, located where the path bends. The covered picnic area is found near the farmyard, just after crossing the bridge, on the right. Finally, Fiddy House can be accessed simply by crossing the bridge.";

content = content.replace(new RegExp(oldTranscript.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newTranscript);

// Also change the title "Student Counselling Services" to "Fiddy Working Heritage Farm"
content = content.replace(/Part 2: Student Counselling Services/g, "Part 2: Fiddy Working Heritage Farm");

fs.writeFileSync(file, content);
console.log('Successfully replaced');
