const fs = require('fs');
const cheerio = require('cheerio');
const content = fs.readFileSync('temp_reading.html', 'utf8');
const $ = cheerio.load(content);
$('.ielts-reading-transcript').each((i, el) => {
    console.log('Passage', i+1, 'Length:', $(el).text().length);
});
