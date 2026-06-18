const fs = require('fs');
const cheerio = require('cheerio');

const html = fs.readFileSync('temp_reading_10_1.html', 'utf8');
const $ = cheerio.load(html);

console.log($('#ielts-reading-question-number-14').parent().attr('data-dnd-group'));
