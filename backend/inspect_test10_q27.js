const fs = require('fs');
const cheerio = require('cheerio');

const html = fs.readFileSync('C:\\Users\\subas\\.gemini\\antigravity\\brain\\a3a0dc82-762a-48f7-b9fa-659041ee7182\\.system_generated\\steps\\3769\\content.md', 'utf8');
const $ = cheerio.load(html);

// Let's print out the HTML of Q27
$('#ielts-listening-question-number-27').parent().parent().parent().each((i, el) => {
  console.log(`--- Q27 HTML ---`);
  console.log('HTML:', $(el).html());
  console.log('Text:', $(el).text());
  console.log('Parent HTML:', $(el).parent().html()?.slice(0, 1000));
});

console.log('\n--- Looking for matching containers around Q27 ---');
console.log($('#ielts-listening-question-number-27').closest('.ielts-listening-matching-question-cell').length);
console.log($('#ielts-listening-question-number-27').closest('table').html()?.slice(0, 2000));
