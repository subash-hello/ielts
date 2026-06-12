const fs = require('fs');
const path = require('path');

const filePath = 'C:\\Users\\subas\\.gemini\\antigravity\\brain\\a3a0dc82-762a-48f7-b9fa-659041ee7182\\.system_generated\\steps\\3567\\content.md';
const content = fs.readFileSync(filePath, 'utf8');

const cheerio = require('cheerio');
const $ = cheerio.load(content);

console.log('Post ID Input:', $('input#post_id').attr('value') || $('input[name="post_id"]').attr('value'));
console.log('Nonce Input:', $('input[name="ielts_listening_test_nonce"]').attr('value'));
console.log('Form inputs count:', $('form input').length);
$('form input').each((i, el) => {
  const name = $(el).attr('name');
  const val = $(el).attr('value');
  if (name || val) {
    console.log(`Input ${i}: name=${name}, val=${val}`);
  }
});
