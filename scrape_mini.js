const https = require('https');
const cheerio = require('cheerio');

https.get('https://mini-ielts.com/listening/map-labeling', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const $ = cheerio.load(data);
    const tests = [];
    $('.test-list .list-item').each((i, el) => {
      const title = $(el).find('h3 a').text().trim();
      const href = $(el).find('h3 a').attr('href');
      tests.push({ title, href });
    });
    console.log(tests);
  });
});
