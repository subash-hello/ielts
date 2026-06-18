const mongoose = require('mongoose');
const https = require('https');
const cheerio = require('cheerio');
const querystring = require('querystring');
require('dotenv').config();

const TestContent = require('./src/models/TestContent');

function cleanText(text) {
  if (!text) return '';
  return text.replace(/\s+/g, ' ').replace(/^\d+\.\s*/, '').trim();
}

function fetchHtml(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve(body));
    }).on('error', err => reject(err));
  });
}

function fetchAnswers(postId) {
  return new Promise((resolve, reject) => {
    const postData = querystring.stringify({ action: 'ielts_listening_get_answer_key', post_id: postId });
    const options = {
      hostname: 'engnovate.com',
      path: '/wp-admin/admin-ajax.php',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          if (parsed.success) resolve(parsed.data);
          else resolve([]);
        } catch (e) { resolve([]); }
      });
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function scrapeTest(bookNum, testNum) {
  const url = `https://engnovate.com/ielts-listening-tests/cambridge-ielts-${bookNum}-academic-listening-test-${testNum}/`;
  console.log(`Scraping Book ${bookNum} Test ${testNum} ...`);
  try {
    const html = await fetchHtml(url);
    const $ = cheerio.load(html);
    
    // Find post id for answers
    let postId = null;
    $('script').each((i, el) => {
      const scriptText = $(el).html();
      if (scriptText && scriptText.includes('var ielts_listening_post_id')) {
        const match = scriptText.match(/ielts_listening_post_id\s*=\s*['"]?(\d+)['"]?/);
        if (match) postId = match[1];
      }
    });

    if (!postId) {
        const match = html.match(/"post_id":(\d+)/);
        if (match) postId = match[1];
    }
    
    let answerKey = [];
    if (postId) {
      answerKey = await fetchAnswers(postId);
    }
    
    const uniqueMp3s = [];
    $('audio source').each((i, el) => {
      const src = $(el).attr('src');
      if (src && src.endsWith('.mp3') && !uniqueMp3s.includes(src)) {
        uniqueMp3s.push(src);
      }
    });

    const parts = [];
    for (let partNum = 1; partNum <= 4; partNum++) {
      const audioUrl = uniqueMp3s[partNum - 1] || uniqueMp3s[0] || "";
      let transcriptText = '';
      const transcriptDiv = $(`#ielts-listening-transcript-${partNum}`);
      if (transcriptDiv.length) {
        transcriptDiv.find('p').each((i, el) => transcriptText += cleanText($(el).text()) + '\n');
      }

      const questions = [];
      const startQ = (partNum - 1) * 10 + 1;
      const endQ = partNum * 10;

      for (let qNum = startQ; qNum <= endQ; qNum++) {
        const ansObj = answerKey[qNum - 1];
        const correctAnswer = ansObj ? ansObj.answer : '';
        const qNumElem = $(`#ielts-listening-question-number-${qNum}`);
        if (!qNumElem.length) {
          questions.push({ id: `c${bookNum}t${testNum}q${qNum}`, type: "fillBlank", text: `Question ${qNum}`, correctAnswer });
          continue;
        }

        const tdQuestion = qNumElem.closest('.ielts-listening-matching-question-cell');
        if (tdQuestion.length) {
          const text = cleanText(tdQuestion.find('span').text()) || cleanText(tdQuestion.text().replace(qNum.toString(), ''));
          questions.push({ id: `c${bookNum}t${testNum}q${qNum}`, type: "matching", text: text, options: ["A", "B", "C", "D", "E", "F", "G", "H"], correctAnswer });
          continue;
        }

        const parentItem = qNumElem.closest('.ielts-listening-question-item');
        if (parentItem.length) {
          const optionsDivs = parentItem.find('.ielts-listening-option');
          if (optionsDivs.length) {
             const questionText = cleanText(parentItem.find('> span > span').text()) || cleanText(qNumElem.parent().text().replace(qNum.toString(), ''));
             const options = [];
             optionsDivs.each((i, opt) => options.push(cleanText($(opt).text())));
             questions.push({ id: `c${bookNum}t${testNum}q${qNum}`, type: "multipleChoice", text: questionText, options, correctAnswer });
             continue;
          }
        }
        
        let questionText = cleanText(qNumElem.closest('p, div, td, li').text().replace(qNum.toString(), ''));
        if (!questionText || questionText.length < 2) questionText = `Question ${qNum}`;
        questions.push({ id: `c${bookNum}t${testNum}q${qNum}`, type: "fillBlank", text: questionText, correctAnswer });
      }

      parts.push({
        part: partNum,
        title: `Part ${partNum}: Questions ${startQ}-${endQ}`,
        type: "Conversation",
        audioUrl,
        transcript: transcriptText.trim(),
        questions
      });
    }

    return {
      title: `Cambridge IELTS ${bookNum} Academic Listening Test ${testNum}`,
      type: "practice_task",
      subType: "listening",
      difficulty: "medium",
      isActive: true,
      content: {
        duration: "30 min",
        audioUrl: uniqueMp3s[0] || "",
        parts
      }
    };
  } catch (error) {
    console.error(`Failed Test ${bookNum} Test ${testNum}`);
    return null;
  }
}

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  for (let book = 10; book <= 17; book++) {
    for (let test = 1; test <= 4; test++) {
      // Check if already exists to prevent duplicate seeding
      const title = `Cambridge IELTS ${book} Academic Listening Test ${test}`;
      const exists = await TestContent.findOne({ title });
      if (exists) {
        console.log(`Skipping ${title}, already exists.`);
        continue;
      }
      
      const data = await scrapeTest(book, test);
      if (data) {
        await TestContent.create(data);
        console.log(`Saved ${title} to database`);
      }
      // Small pause to be gentle
      await new Promise(r => setTimeout(r, 1000));
    }
  }

  console.log('Finished seeding all tests.');
  process.exit(0);
}

main();
