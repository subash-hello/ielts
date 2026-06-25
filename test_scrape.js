const https = require('https');
const querystring = require('querystring');
const cheerio = require('cheerio');

function fetchHtml(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve(body));
    }).on('error', err => reject(err));
  });
}

function fetchAnswerKey(postId, nonce) {
  return new Promise((resolve, reject) => {
    const postData = querystring.stringify({
      action: 'get_ielts_listening_test_answer_key',
      ielts_listening_test_nonce: nonce,
      post_id: postId
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
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve(JSON.parse(body)));
    });
    req.on('error', err => reject(err));
    req.write(postData);
    req.end();
  });
}

async function run() {
  const url = 'https://engnovate.com/ielts-listening-tests/cambridge-ielts-17-academic-listening-test-1/';
  const html = await fetchHtml(url);
  const $ = cheerio.load(html);
  const postId = $('input#post_id').attr('value') || $('input[name="post_id"]').attr('value') || $('input[name="comment_post_ID"]').attr('value');
  const nonce = $('input[name="ielts_listening_test_nonce"]').attr('value');
  console.log('Post ID:', postId, 'Nonce:', nonce);
  
  if (postId && nonce) {
    const answerKey = await fetchAnswerKey(postId, nonce);
    console.log('Answers fetched:', answerKey.data ? answerKey.data.answer_key.slice(0, 3) : answerKey);
  } else {
    console.log('Could not find postID or nonce');
  }

  const q1 = $('#ielts-listening-question-number-1');
  if (q1.length) {
    console.log('Q1 parent HTML:', q1.parent().html());
  } else {
    console.log('Q1 not found');
  }
}
run();
