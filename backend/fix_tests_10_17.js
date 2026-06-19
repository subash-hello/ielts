const mongoose = require('mongoose');
const dotenv = require('dotenv');
const https = require('https');
const querystring = require('querystring');
const cheerio = require('cheerio');
const TestContent = require('./src/models/TestContent');

dotenv.config();

function fetchHtml(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Failed to load page: ${res.statusCode}`));
        return;
      }
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

function cleanText(txt) {
  if (!txt) return '';
  return txt.replace(/\s+/g, ' ').replace(/&nbsp;/g, ' ').replace(/&rsquo;/g, "'").replace(/&ldquo;/g, '"').replace(/&rdquo;/g, '"').replace(/&pound;/g, '£').trim();
}

async function scrapeTest(testId, url, testTitle) {
  console.log(`Scraping test ${testId} from ${url}...`);
  const html = await fetchHtml(url);
  const $ = cheerio.load(html);

  const postId = $('input#post_id').attr('value') || $('input[name="post_id"]').attr('value') || $('input[name="comment_post_ID"]').attr('value');
  const nonce = $('input[name="ielts_listening_test_nonce"]').attr('value');

  if (!postId || !nonce) {
    throw new Error(`Could not find post_id (${postId}) or nonce (${nonce}) for test ${testId}`);
  }

  const answerKey = await fetchAnswerKey(postId, nonce);

  const mp3s = [];
  const mp3Regex = /https?:\/\/engnovate\.com\/wp-content\/uploads\/[^\s"'`]+\.mp3/gi;
  let mp3Match;
  while ((mp3Match = mp3Regex.exec(html)) !== null) {
    mp3s.push(mp3Match[0]);
  }
  const uniqueMp3s = Array.from(new Set(mp3s));
  uniqueMp3s.sort((a, b) => {
    const getPart = (s) => {
      const match = s.match(/part[-_]?(\d+)/i) || s.match(/audio[-_]?(\d+)/i);
      return match ? parseInt(match[1]) : 1;
    };
    return getPart(a) - getPart(b);
  });

  const parts = [];
  for (let partNum = 1; partNum <= 4; partNum++) {
    const audioUrl = uniqueMp3s[partNum - 1] || uniqueMp3s[0];
    const transcriptDiv = $(`#ielts-listening-transcript-${partNum}`);
    let transcriptText = '';
    if (transcriptDiv.length) {
      transcriptDiv.find('p').each((i, el) => {
        transcriptText += cleanText($(el).text()) + '\n';
      });
    }
    transcriptText = transcriptText.trim();

    const questions = [];
    const startQ = (partNum - 1) * 10 + 1;
    const endQ = partNum * 10;

    for (let qNum = startQ; qNum <= endQ; qNum++) {
      const ansObj = answerKey[qNum - 1];
      const correctAnswer = ansObj ? ansObj.answer : '';
      const qNumElem = $(`#ielts-listening-question-number-${qNum}`);
      if (!qNumElem.length) {
        questions.push({
          id: `c${testId}q${qNum}`,
          type: "fillBlank",
          text: `Question ${qNum}`,
          correctAnswer
        });
        continue;
      }

      const tdQuestion = qNumElem.closest('.ielts-listening-matching-question-cell');
      if (tdQuestion.length) {
        const text = cleanText(tdQuestion.find('span').text()) || cleanText(tdQuestion.text().replace(qNum.toString(), ''));
        const table = tdQuestion.closest('table');
        const options = [];
        let prevElem = table.prev();
        while (prevElem.length && !options.length) {
          const pText = cleanText(prevElem.text());
          if (pText.includes('A.') || pText.includes('A ')) {
            prevElem.find('p, li').each((i, li) => {
              const liText = cleanText($(li).text());
              if (liText) options.push(liText);
            });
            if (!options.length) {
              const matches = pText.split(/(?=[A-H]\.\s)/);
              matches.forEach(m => {
                if (m.trim()) options.push(cleanText(m));
              });
            }
          }
          prevElem = prevElem.prev();
        }
        if (!options.length) {
          table.find('thead th').each((i, th) => {
            const thText = cleanText($(th).text());
            if (thText && thText !== '#' && !thText.toLowerCase().includes('question')) {
              options.push(thText);
            }
          });
        }
        questions.push({
          id: `c${testId}q${qNum}`,
          type: "matching",
          text: text,
          options: options.length ? options : ["A", "B", "C", "D", "E", "F", "G", "H"],
          correctAnswer
        });
        continue;
      }

      const parentItem = qNumElem.closest('.ielts-listening-question-item');
      if (parentItem.length) {
        const optionsDivs = parentItem.find('.ielts-listening-option');
        if (optionsDivs.length) {
          const questionText = cleanText(parentItem.find('> span > span').text()) || cleanText(qNumElem.parent().text().replace(qNum.toString(), ''));
          const options = [];
          optionsDivs.each((i, opt) => {
            const letter = cleanText($(opt).find('.ielts-listening-option-letter').text());
            const text = cleanText($(opt).find('span').text());
            options.push(`${letter}. ${text}`);
          });
          questions.push({
            id: `c${testId}q${qNum}`,
            type: "multipleChoice",
            text: questionText,
            options,
            correctAnswer
          });
          continue;
        }

        if (parentItem.find('.ielts-listening-matching-question-cell').length) {
          const cell = parentItem.find('.ielts-listening-matching-question-cell');
          const text = cleanText(cell.find('span').text()) || cleanText(cell.text().replace(qNum.toString(), ''));
          const table = parentItem.closest('table');
          const options = [];
          if (table.length) {
            let prevElem = table.prev();
            while (prevElem.length && !options.length) {
              const pText = cleanText(prevElem.text());
              if (pText.includes('A.') || pText.includes('A ')) {
                prevElem.find('p, li').each((i, li) => {
                  const liText = cleanText($(li).text());
                  if (liText) options.push(liText);
                });
                if (!options.length) {
                  const matches = pText.split(/(?=[A-H]\.\s)/);
                  matches.forEach(m => {
                    if (m.trim()) options.push(cleanText(m));
                  });
                }
              }
              prevElem = prevElem.prev();
            }
            if (!options.length) {
              table.find('thead th').each((i, th) => {
                const thText = cleanText($(th).text());
                if (thText && thText !== '#' && !thText.toLowerCase().includes('question')) {
                  options.push(thText);
                }
              });
            }
          }
          questions.push({
            id: `c${testId}q${qNum}`,
            type: "matching",
            text: text,
            options: options.length ? options : ["A", "B", "C", "D", "E", "F", "G", "H"],
            correctAnswer
          });
          continue;
        }

        const isSpan = parentItem.prop('tagName').toLowerCase() === 'span';
        const itemParent = isSpan ? parentItem.parent() : parentItem;
        const clone = itemParent.clone();
        if (isSpan) {
          clone.find('.ielts-listening-question-item').each((i, el) => {
            const num = $(el).find('.ielts-listening-question-number').text();
            if (num && num !== qNum.toString()) {
              $(el).replaceWith(`(${num})`);
            }
          });
        }
        const targetSpan = clone.find(`#ielts-listening-question-number-${qNum}`).parent();
        if (targetSpan.length) {
          targetSpan.replaceWith('_____');
        } else {
          clone.find('input[type="text"], input[type="hidden"]').replaceWith('_____');
          clone.find('.ielts-listening-question-number').remove();
        }
        questions.push({
          id: `c${testId}q${qNum}`,
          type: "fillBlank",
          text: cleanText(clone.text()),
          correctAnswer
        });
      } else {
        const parentParagraph = qNumElem.closest('p, li, td, div');
        if (parentParagraph.length) {
          const clone = parentParagraph.clone();
          clone.find('.ielts-listening-question-item').each((i, el) => {
            const num = $(el).find('.ielts-listening-question-number').text();
            if (num && num !== qNum.toString()) {
              $(el).replaceWith(`(${num})`);
            }
          });
          const targetSpan = clone.find(`#ielts-listening-question-number-${qNum}`).parent();
          if (targetSpan.length) {
            targetSpan.replaceWith('_____');
          } else {
            clone.find('input[type="text"], input[type="hidden"]').replaceWith('_____');
            clone.find('.ielts-listening-question-number').remove();
          }
          questions.push({
            id: `c${testId}q${qNum}`,
            type: "fillBlank",
            text: cleanText(clone.text()),
            correctAnswer
          });
        } else {
          questions.push({
            id: `c${testId}q${qNum}`,
            type: "fillBlank",
            text: `Question ${qNum}`,
            correctAnswer
          });
        }
      }
    }

    parts.push({
      part: partNum,
      title: `Part ${partNum}: Questions ${startQ}-${endQ}`,
      type: partNum === 1 ? 'Conversation' : partNum === 2 ? 'Monologue' : partNum === 3 ? 'Academic Discussion' : 'Academic Lecture',
      audioUrl,
      transcript: transcriptText || `This is the transcript for Part ${partNum} of Cambridge IELTS ${testTitle}.`,
      questions
    });
  }

  return {
    parts
  };
}

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const tests = await TestContent.find({
      type: 'practice_task',
      subType: 'listening',
      title: /Cambridge IELTS (1[0-7])/
    }).sort({ title: 1 });

    console.log(`Found ${tests.length} tests to fix.`);

    for (const test of tests) {
      const match = test.title.match(/Cambridge IELTS (1[0-7]) Academic Listening Test ([1-4])/);
      if (match) {
        const setNum = match[1];
        const testNum = match[2];
        const url = `https://engnovate.com/ielts-listening-tests/cambridge-ielts-${setNum}-academic-listening-test-${testNum}/`;
        
        console.log(`\nProcessing: ${test.title}`);
        console.log(`URL: ${url}`);
        
        try {
          const scraped = await scrapeTest(`c${setNum}t${testNum}`, url, test.title);
          
          test.content.parts = scraped.parts;
          test.markModified('content');
          await test.save();
          console.log(`✅ Saved ${test.title} to DB`);
        } catch(err) {
          console.error(`❌ Failed on ${test.title}:`, err.message);
        }
        
        // Rate limiting
        await new Promise(r => setTimeout(r, 2000));
      }
    }

    console.log('Finished updating tests.');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
