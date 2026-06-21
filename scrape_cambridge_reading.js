const fs = require('fs');
const path = require('path');
const https = require('https');
const querystring = require('querystring');
const cheerio = require('cheerio');

const urls = {
  "1": "https://engnovate.com/ielts-reading-tests/cambridge-ielts-20-academic-reading-test-1/",
  "2": "https://engnovate.com/ielts-reading-tests/cambridge-ielts-20-academic-reading-test-2/",
  "3": "https://engnovate.com/ielts-reading-tests/cambridge-ielts-20-academic-reading-test-3/",
  "4": "https://engnovate.com/ielts-reading-tests/cambridge-ielts-20-academic-reading-test-4/",
  "5": "https://engnovate.com/ielts-reading-tests/cambridge-ielts-19-academic-reading-test-1/",
  "6": "https://engnovate.com/ielts-reading-tests/cambridge-ielts-19-academic-reading-test-2/",
  "7": "https://engnovate.com/ielts-reading-tests/cambridge-ielts-19-academic-reading-test-3/",
  "8": "https://engnovate.com/ielts-reading-tests/cambridge-ielts-19-academic-reading-test-4/",
  "9": "https://engnovate.com/ielts-reading-tests/cambridge-ielts-18-academic-reading-test-1/",
  "10": "https://engnovate.com/ielts-reading-tests/cambridge-ielts-18-academic-reading-test-2/",
  "11": "https://engnovate.com/ielts-reading-tests/cambridge-ielts-18-academic-reading-test-3/",
  "12": "https://engnovate.com/ielts-reading-tests/cambridge-ielts-18-academic-reading-test-4/",
  "13": "https://engnovate.com/ielts-reading-tests/cambridge-ielts-17-academic-reading-test-1/",
  "14": "https://engnovate.com/ielts-reading-tests/cambridge-ielts-17-academic-reading-test-2/",
  "15": "https://engnovate.com/ielts-reading-tests/cambridge-ielts-17-academic-reading-test-3/",
  "16": "https://engnovate.com/ielts-reading-tests/cambridge-ielts-17-academic-reading-test-4/"
};

// Helper function to fetch HTML content of a URL
function fetchHtml(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        if (res.statusCode === 301 || res.statusCode === 302) {
          fetchHtml(res.headers.location).then(resolve).catch(reject);
          return;
        }
        reject(new Error(`Failed to load page: ${res.statusCode}`));
        return;
      }
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve(body));
    }).on('error', err => reject(err));
  });
}

// Helper function to call the AJAX endpoint and get answers
function fetchAnswerKey(postId, nonce) {
  return new Promise((resolve, reject) => {
    const postData = querystring.stringify({
      action: 'get_ielts_reading_test_answer_key',
      ielts_reading_test_nonce: nonce,
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
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          if (parsed.success && parsed.data && parsed.data.answer_key) {
            resolve(parsed.data.answer_key);
          } else {
            reject(new Error(`Failed to get answer key: ${body}`));
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', err => reject(err));
    req.write(postData);
    req.end();
  });
}

// Clean text function
function cleanText(txt) {
  if (!txt) return '';
  return txt.replace(/\s+/g, ' ').replace(/&nbsp;/g, ' ').replace(/&rsquo;/g, "'").replace(/&ldquo;/g, '"').replace(/&rdquo;/g, '"').replace(/&pound;/g, '£').trim();
}

async function scrapeTest(testId, url) {
  console.log(`Scraping test ${testId} from ${url}...`);
  const html = await fetchHtml(url);
  const $ = cheerio.load(html);

  // Extract post_id and nonce
  const postId = $('input#post_id').attr('value') || $('input[name="post_id"]').attr('value') || $('input[name="comment_post_ID"]').attr('value');
  const nonce = $('input[name="ielts_reading_test_nonce"]').attr('value') || $('input[name="ielts_test_nonce"]').attr('value');

  if (!postId || !nonce) {
    throw new Error(`Could not find post_id (${postId}) or nonce (${nonce}) for test ${testId}`);
  }

  console.log(`Test ${testId}: postId = ${postId}, nonce = ${nonce}`);
  const answerKey = await fetchAnswerKey(postId, nonce);
  console.log(`Test ${testId}: Fetched ${answerKey.length} answers successfully`);

  // Extract title
  let testTitle = cleanText($('.custom-breadcrumb span:last-child').text()) || cleanText($('title').text()).split('(')[0];
  if (!testTitle.includes('Cambridge')) {
    testTitle = `Cambridge IELTS Practice Test ${testId}`;
  }

  // Extract parts
  const parts = [];
  const partElements = $('.ielts-reading-test-container'); // Assuming one container per part?
  let partContents = [];
  $('.ielts-reading-passage-content').each((i, el) => {
     let text = '';
     $(el).find('p, h2, h3, h4').each((j, pel) => {
        text += cleanText($(pel).text()) + '\n\n';
     });
     partContents.push(text.trim());
  });

  for (let partNum = 1; partNum <= 3; partNum++) {
    // 2. Transcript/Reading Passage
    let readingPassageText = partContents[partNum - 1] || `This is the reading passage for Part ${partNum} of ${testTitle}.`;

    // 3. Questions
    const questions = [];
    const startQ = partNum === 1 ? 1 : partNum === 2 ? 14 : 27;
    const endQ = partNum === 1 ? 13 : partNum === 2 ? 26 : 40;

    for (let qNum = startQ; qNum <= endQ; qNum++) {
      const ansObj = answerKey[qNum - 1];
      const correctAnswer = ansObj ? ansObj.answer : '';

      questions.push({
        id: `r${qNum}`,
        type: 'fillBlank',
        text: `Question ${qNum} _____ `,
        correctAnswer: correctAnswer
      });
    }

    parts.push({
      part: partNum,
      title: `Reading Passage ${partNum}`,
      type: 'Reading Passage',
      transcript: readingPassageText,
      questions
    });
  }

  return {
    title: testTitle,
    difficulty: 'medium',
    parts
  };
}

async function scrapeAll() {
  const allTests = {};
  for (const [id, url] of Object.entries(urls)) {
    try {
      const testData = await scrapeTest(id, url);
      allTests[id] = testData;
      // Sleep a bit to be polite
      await new Promise(r => setTimeout(r, 2000));
    } catch (e) {
      console.error(`Error scraping test ${id}:`, e);
    }
  }

  const outputJs = `const cambridgeReadingTests = ${JSON.stringify(allTests, null, 4)};\n\nmodule.exports = cambridgeReadingTests;`;
  const outputPath = path.join(__dirname, 'src', 'data', 'cambridgeReadingTests.js');
  fs.writeFileSync(outputPath, outputJs);
  console.log('Successfully saved all tests to ' + outputPath);
}

scrapeAll();
