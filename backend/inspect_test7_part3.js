const fs = require('fs');
const cheerio = require('cheerio');

// Load Test 7 HTML
const html = fs.readFileSync('C:\\Users\\subas\\.gemini\\antigravity\\brain\\a3a0dc82-762a-48f7-b9fa-659041ee7182\\.system_generated\\steps\\3689\\content.md', 'utf8');
const $ = cheerio.load(html);

$('#ielts-listening-question-number-27').parent().parent().each((i, el) => {
  console.log(`--- Q27 Level 2 HTML ---`);
  console.log('HTML:', $(el).html());
  console.log('Text:', $(el).text());
});
