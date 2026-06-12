const fs = require('fs');
const cheerio = require('cheerio');

const html = fs.readFileSync('C:\\Users\\subas\\.gemini\\antigravity\\brain\\a3a0dc82-762a-48f7-b9fa-659041ee7182\\.system_generated\\steps\\3769\\content.md', 'utf8');
const $ = cheerio.load(html);

$('#ielts-listening-question-number-15').parent().parent().parent().each((i, el) => {
  console.log(`--- Q15 Level 3 HTML ---`);
  console.log('HTML:', $(el).html());
  console.log('TagName:', $(el).prop('tagName'));
});

console.log('\n--- Parent of Q15 Item ---');
console.log($('#ielts-listening-question-number-15').closest('.ielts-listening-question-item').parent().html()?.slice(0, 1000));
