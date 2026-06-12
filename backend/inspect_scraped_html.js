const fs = require('fs');
const cheerio = require('cheerio');

const html = fs.readFileSync('C:\\Users\\subas\\.gemini\\antigravity\\brain\\a3a0dc82-762a-48f7-b9fa-659041ee7182\\.system_generated\\steps\\3689\\content.md', 'utf8');
const $ = cheerio.load(html);

// Let's print out the first 5 question items
$('.ielts-listening-question-item').slice(0, 5).each((i, el) => {
  console.log(`--- Question Item ${i+1} ---`);
  console.log('HTML:', $(el).html());
  console.log('Text:', $(el).text());
  console.log('Parent Text:', $(el).parent().text());
  console.log('Grandparent Text:', $(el).parent().parent().text());
});

console.log('\n--- Looking at the first part element ---');
console.log($('#ielts-listening-transcript-1').parent().html()?.slice(0, 1000));
