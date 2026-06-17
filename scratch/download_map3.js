const https = require('https');
const fs = require('fs');

const url = 'https://engnovate.com/wp-content/uploads/2025/07/cambridge-ielts-20-academic-reading-test-3-17-20.png';
const dest = 'c:\\Users\\subas\\OneDrive\\Documents\\projects\\ielts\\frontend\\public\\images\\cambridge_20_test3_map.png';

const request = https.get(url, {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Referer': 'https://engnovate.com/'
  }
}, (response) => {
  console.log('Status code:', response.statusCode);
  console.log('Headers:', response.headers);

  if (response.statusCode === 200) {
    const file = fs.createWriteStream(dest);
    response.pipe(file);
    file.on('finish', () => {
      file.close();
      console.log('Download complete!');
    });
  } else {
    console.log('Failed to download, status code: ' + response.statusCode);
  }
});

request.on('error', (err) => {
  console.error('Error:', err);
});
