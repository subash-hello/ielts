const fs = require('fs');
const path = require('path');
const https = require('https');
const querystring = require('querystring');
const cheerio = require('cheerio');

// File to store intermediate results
const CACHE_FILE = path.join(__dirname, 'cambridge10to17Raw.json');

// Helper to fetch HTML content of a URL with retry logic for non-200 and rate limiting
function fetchHtml(url, retries = 5, delay = 20000) {
  return new Promise((resolve, reject) => {
    const attempt = (count) => {
      const parsedUrl = new URL(url);
      const options = {
        hostname: parsedUrl.hostname,
        path: parsedUrl.pathname + parsedUrl.search,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1'
        }
      };
      https.get(options, (res) => {
        if (res.statusCode === 429 || res.statusCode === 403) {
          if (count < retries) {
            console.log(`⚠️ Status ${res.statusCode} on GET: ${url}. Waiting ${delay / 1000}s to retry (Attempt ${count + 1}/${retries})...`);
            setTimeout(() => attempt(count + 1), delay);
          } else {
            reject(new Error(`Failed to load page: ${res.statusCode} after ${retries} retries`));
          }
          return;
        }
        if (res.statusCode !== 200) {
          if (count < retries) {
            console.log(`⚠️ Non-200 status ${res.statusCode} on GET: ${url}. Waiting ${delay / 1000}s to retry (Attempt ${count + 1}/${retries})...`);
            setTimeout(() => attempt(count + 1), delay);
          } else {
            reject(new Error(`Failed to load page: ${res.statusCode}`));
          }
          return;
        }
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => resolve(body));
      }).on('error', err => {
        if (count < retries) {
          console.log(`⚠️ Network error on ${url}: ${err.message}. Retrying in ${delay / 1000}s...`);
          setTimeout(() => attempt(count + 1), delay);
        } else {
          reject(err);
        }
      });
    };
    attempt(0);
  });
}


// Helper to call the AJAX endpoint and get answers with retry logic
function fetchAnswerKey(postId, nonce, retries = 5, delay = 20000) {
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
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/javascript, */*; q=0.01',
        'Accept-Language': 'en-US,en;q=0.9',
        'X-Requested-With': 'XMLHttpRequest'
      }
    };

    const attempt = (count) => {
      const req = https.request(options, (res) => {
        if (res.statusCode === 429 || res.statusCode === 403) {
          if (count < retries) {
            console.log(`⚠️ Status ${res.statusCode} on POST ajax. Waiting ${delay / 1000}s to retry (Attempt ${count + 1}/${retries})...`);
            setTimeout(() => attempt(count + 1), delay);
          } else {
            reject(new Error(`Failed to get answer key: ${res.statusCode} (Rate limited after ${retries} retries)`));
          }
          return;
        }
        
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            if (res.statusCode !== 200) {
              throw new Error(`Non-200 Status code ${res.statusCode}`);
            }
            const parsed = JSON.parse(body);
            if (parsed.success && parsed.data && parsed.data.answer_key) {
              resolve(parsed.data.answer_key);
            } else {
              throw new Error(`success=false or missing answer_key`);
            }
          } catch (e) {
            if (count < retries) {
              console.log(`⚠️ AJAX error (${e.message}). Retrying in ${delay / 1000}s (Attempt ${count + 1}/${retries})...`);
              setTimeout(() => attempt(count + 1), delay);
            } else {
              reject(e);
            }
          }
        });
      });

      req.on('error', err => {
        if (count < retries) {
          console.log(`⚠️ POST error: ${err.message}. Retrying in ${delay / 1000}s...`);
          setTimeout(() => attempt(count + 1), delay);
        } else {
          reject(err);
        }
      });

      req.write(postData);
      req.end();
    };

    attempt(0);
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

    let layoutHtml = '';
    const sectionElem = $('.ielts-listening-question-section').eq(partNum - 1);
    if (sectionElem.length) {
      const clone = sectionElem.clone();
      clone.find('.ielts-listening-section-start-time-button').remove();
      clone.find('audio').remove();
      clone.find('.ielts-listening-part-audio').remove();
      clone.find('input[type="text"]').val('').attr('value', '');
      layoutHtml = cleanText(clone.html());
    }

    parts.push({
      part: partNum,
      title: `Part ${partNum}: Questions ${startQ}-${endQ}`,
      type: partNum === 1 ? 'Conversation' : partNum === 2 ? 'Monologue' : partNum === 3 ? 'Academic Discussion' : 'Academic Lecture',
      audioUrl,
      transcript: transcriptText || `This is the transcript for Part ${partNum} of Cambridge IELTS ${testTitle}.`,
      questions,
      layoutHtml
    });
  }

  return {
    id: testId.toString(),
    title: testTitle,
    duration: "30 min",
    difficulty: testId <= 40 ? 'easy' : (testId <= 50 ? 'medium' : 'hard'),
    parts
  };
}

async function run() {
  let scrapedData = {};
  if (fs.existsSync(CACHE_FILE)) {
    try {
      scrapedData = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
      console.log(`Loaded ${Object.keys(scrapedData).length} tests from cache.`);
    } catch (e) {
      console.warn('Failed to parse cache, starting fresh');
    }
  }

  const books = [10, 11, 12, 13, 14, 15, 16, 17];
  const tests = [1, 2, 3, 4];

  for (const book of books) {
    for (const test of tests) {
      // Calculate continuous key starting from 31
      const key = (31 + (book - 10) * 4 + (test - 1)).toString();
      
      if (scrapedData[key]) {
        console.log(`Skipping key ${key} (Cambridge ${book} Test ${test}) - already in cache`);
        continue;
      }

      const url = `https://engnovate.com/ielts-listening-tests/cambridge-ielts-${book}-academic-listening-test-${test}/`;
      const title = `Cambridge IELTS ${book} Academic Listening Test ${test}`;

      try {
        console.log(`Waiting 5 seconds before scraping key ${key}...`);
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        const data = await scrapeTest(key, url, title);
        scrapedData[key] = data;
        
        // Save to cache file immediately
        fs.writeFileSync(CACHE_FILE, JSON.stringify(scrapedData, null, 2), 'utf8');
        console.log(`✅ Successfully scraped key ${key} (Cambridge ${book} Test ${test})!`);
      } catch (err) {
        console.error(`❌ Failed to scrape key ${key} (Cambridge ${book} Test ${test}):`, err.message);
        // Wait longer on failure before next attempt
        await new Promise(resolve => setTimeout(resolve, 15000));
      }
    }
  }

  console.log('Scraping run completed.');
}

run();
