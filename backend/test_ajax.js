const https = require('https');
const querystring = require('querystring');

const postData = querystring.stringify({
  action: 'get_ielts_listening_test_answer_key',
  ielts_listening_test_nonce: 'c2fa57c791',
  post_id: '1703318',
  is_custom_test: '',
  p1_test: '',
  p1_part: '',
  p2_test: '',
  p2_part: '',
  p3_test: '',
  p3_part: '',
  p4_test: '',
  p4_part: ''
});

const options = {
  hostname: 'engnovate.com',
  port: 443,
  path: '/wp-admin/admin-ajax.php',
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Content-Length': Buffer.byteLength(postData),
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
  }
};

const req = https.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    try {
      const parsed = JSON.parse(body);
      console.log('Success status:', parsed.success);
      if (parsed.success && parsed.data && parsed.data.answer_key) {
        console.log('Answer key length:', parsed.data.answer_key.length);
        console.log('First 5 answers:', parsed.data.answer_key.slice(0, 5));
        console.log('Last 5 answers:', parsed.data.answer_key.slice(-5));
      } else {
        console.log('Failed, response body:', body);
      }
    } catch (e) {
      console.log('Error parsing JSON, body:', body);
    }
  });
});

req.on('error', (e) => {
  console.error('Request error:', e);
});

req.write(postData);
req.end();
