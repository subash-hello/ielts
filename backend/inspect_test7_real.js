const fs = require('fs');
const https = require('https');
const cheerio = require('cheerio');

https.get('https://engnovate.com/ielts-listening-tests/cambridge-ielts-19-academic-listening-test-3/', (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    const $ = cheerio.load(body);
    for (let qNum = 26; qNum <= 30; qNum++) {
      const qNumElem = $(`#ielts-listening-question-number-${qNum}`);
      if (body) {
        const $ = cheerio.load(body);
        console.log('Searching for "Choose mice":');
        $('*').each((i, el) => {
          const text = $(el).text();
          if (text.includes('Choose mice') && $(el).children().length > 0 && $(el).find('strong').length > 0 && $(el).children().first().prop('tagName') !== 'HTML' && $(el).children().first().prop('tagName') !== 'BODY') {
            console.log(`Tag: ${el.name}, HTML:`, $(el).html()?.slice(0, 500));
          }
        });
      }
    }
  });
});
