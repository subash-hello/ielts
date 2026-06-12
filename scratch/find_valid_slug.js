const https = require('https');

const baseFilename = 'cambridge-ielts-20-academic-reading-test-3-17-20';
const extensions = ['.png', '.jpg', '.jpeg', '.webp'];

async function testUrl(year, month, ext) {
  const pathStr = `${year}/${month.toString().padStart(2, '0')}`;
  const url = `https://engnovate.com/wp-content/uploads/${pathStr}/${baseFilename}${ext}`;
  
  return new Promise((resolve) => {
    const request = https.request(url, { method: 'HEAD', headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode === 200) {
        console.log(`FOUND IT! URL: ${url}`);
        resolve(url);
      } else {
        resolve(null);
      }
    });
    request.on('error', () => resolve(null));
    request.end();
  });
}

async function run() {
  for (let year = 2023; year <= 2026; year++) {
    for (let month = 1; month <= 12; month++) {
      for (const ext of extensions) {
        const found = await testUrl(year, month, ext);
        if (found) return;
      }
    }
  }
  console.log('Not found in any year/month/extension combo.');
}

run();
