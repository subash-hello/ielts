const fs = require('fs');
const filePath = 'C:\\Users\\subas\\.gemini\\antigravity\\brain\\a3a0dc82-762a-48f7-b9fa-659041ee7182\\.system_generated\\steps\\3567\\content.md';
const content = fs.readFileSync(filePath, 'utf8');

const cheerio = require('cheerio');
const $ = cheerio.load(content);

// Let's print out the HTML of questions 15 to 20
for (let i = 15; i <= 20; i++) {
  const qItem = $(`#ielts-listening-question-number-${i}`).closest('.ielts-listening-question-item');
  if (qItem.length) {
    console.log(`--- QUESTION ${i} ---`);
    console.log(qItem.html().trim());
  } else {
    // maybe it's inside a table or has another container
    console.log(`Question ${i} element not found directly, let's search for parents`);
    const qNum = $(`#ielts-listening-question-number-${i}`);
    if (qNum.length) {
      console.log(`Parent HTML:`, qNum.parent().html().trim());
    }
  }
}
