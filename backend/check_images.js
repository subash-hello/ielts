const https = require('https');
const cheerio = require('cheerio');

https.get('https://engnovate.com/ielts-listening-tests/cambridge-ielts-17-academic-listening-test-1/', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const $ = cheerio.load(data);
    $('img').each((i, el) => {
      console.log($(el).attr('src'));
    });
  });
});
