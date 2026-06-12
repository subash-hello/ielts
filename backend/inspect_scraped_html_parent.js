const fs = require('fs');
const cheerio = require('cheerio');

const html = fs.readFileSync('C:\\Users\\subas\\.gemini\\antigravity\\brain\\a3a0dc82-762a-48f7-b9fa-659041ee7182\\.system_generated\\steps\\3689\\content.md', 'utf8');
const $ = cheerio.load(html);

// Let's print out the HTML structure around the first few question items
$('#ielts-listening-question-number-1').parent().parent().parent().each((i, el) => {
  console.log(`--- Parent level 3 of Q1 ---`);
  console.log('HTML:', $(el).html()?.slice(0, 1000));
});

console.log('\n--- Printing all text content of the form/div containing the questions ---');
console.log($('.ielts-listening-questions-container').first().text()?.slice(0, 2000));
