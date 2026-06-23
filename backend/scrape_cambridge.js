const fs = require('fs');
const path = require('path');
const https = require('https');
const querystring = require('querystring');
const cheerio = require('cheerio');

const urls = {
  "1": "https://engnovate.com/ielts-listening-tests/cambridge-ielts-20-academic-listening-test-1/",
  "2": "https://engnovate.com/ielts-listening-tests/cambridge-ielts-20-academic-listening-test-2/",
  "3": "https://engnovate.com/ielts-listening-tests/cambridge-ielts-20-academic-listening-test-3/",
  "4": "https://engnovate.com/ielts-listening-tests/cambridge-ielts-20-academic-listening-test-4/",
  "5": "https://engnovate.com/ielts-listening-tests/cambridge-ielts-19-academic-listening-test-1/",
  "6": "https://engnovate.com/ielts-listening-tests/cambridge-ielts-19-academic-listening-test-2/",
  "7": "https://engnovate.com/ielts-listening-tests/cambridge-ielts-19-academic-listening-test-3/",
  "8": "https://engnovate.com/ielts-listening-tests/cambridge-ielts-19-academic-listening-test-4/",
  "9": "https://engnovate.com/ielts-listening-tests/cambridge-ielts-18-academic-listening-test-1/",
  "10": "https://engnovate.com/ielts-listening-tests/cambridge-ielts-18-academic-listening-test-2/"
};

// Helper function to fetch HTML content of a URL
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

// Helper function to call the AJAX endpoint and get answers
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
  const nonce = $('input[name="ielts_listening_test_nonce"]').attr('value');

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

  // Find MP3 links
  const mp3s = [];
  const mp3Regex = /https?:\/\/engnovate\.com\/wp-content\/uploads\/[^\s"'`]+\.mp3/gi;
  let mp3Match;
  while ((mp3Match = mp3Regex.exec(html)) !== null) {
    mp3s.push(mp3Match[0]);
  }
  const uniqueMp3s = Array.from(new Set(mp3s));
  // Sort them so that part 1, part 2, part 3, part 4 are in order
  uniqueMp3s.sort((a, b) => {
    const getPart = (s) => {
      const match = s.match(/part[-_]?(\d+)/i) || s.match(/audio[-_]?(\d+)/i);
      return match ? parseInt(match[1]) : 1;
    };
    return getPart(a) - getPart(b);
  });

  console.log(`Test ${testId} MP3s:`, uniqueMp3s);

  // Extract parts
  const parts = [];
  for (let partNum = 1; partNum <= 4; partNum++) {
    // 1. Audio URL
    const audioUrl = uniqueMp3s[partNum - 1] || uniqueMp3s[0]; // fallback

    // 2. Transcript
    const transcriptDiv = $(`#ielts-listening-transcript-${partNum}`);
    let transcriptText = '';
    if (transcriptDiv.length) {
      transcriptDiv.find('p').each((i, el) => {
        transcriptText += cleanText($(el).text()) + '\n';
      });
    }
    transcriptText = transcriptText.trim();

    // 3. Questions
    const questions = [];
    const startQ = (partNum - 1) * 10 + 1;
    const endQ = partNum * 10;

    for (let qNum = startQ; qNum <= endQ; qNum++) {
      const ansObj = answerKey[qNum - 1];
      const correctAnswer = ansObj ? ansObj.answer : '';

      // Find question element
      const qNumElem = $(`#ielts-listening-question-number-${qNum}`);
      if (!qNumElem.length) {
        // Fallback placeholder
        questions.push({
          id: `c${testId}q${qNum}`,
          type: "fillBlank",
          text: `Question ${qNum}`,
          correctAnswer
        });
        continue;
      }

      // 1. Check if matching cell
      const tdQuestion = qNumElem.closest('.ielts-listening-matching-question-cell');
      if (tdQuestion.length) {
        const text = cleanText(tdQuestion.find('span').text()) || cleanText(tdQuestion.text().replace(qNum.toString(), ''));
        
        // Find matching options
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
        // 2. Check if MCQ
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

        // 3. Check if matching parent
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

        // 4. Fill Blank / DND logic
        // 4. Fill Blank / DND logic
        const isSpan = parentItem.prop('tagName').toLowerCase() === 'span';
        const itemParent = isSpan ? parentItem.parent() : parentItem;
        const clone = itemParent.clone();
        
        // Replace other questions first
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
        // General fill blank fallback
        const parentParagraph = qNumElem.closest('p, li, td, div');
        if (parentParagraph.length) {
          const clone = parentParagraph.clone();
          
          // Replace other questions first
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
    id: testId,
    title: testTitle,
    duration: "30 min",
    difficulty: testId <= 3 ? 'medium' : (testId <= 7 ? 'medium' : 'hard'),
    parts
  };
}

async function run() {
  let scrapedData = {};
  if (fs.existsSync('scrapedTests.json')) {
    try {
      scrapedData = JSON.parse(fs.readFileSync('scrapedTests.json', 'utf8'));
      console.log(`Loaded ${Object.keys(scrapedData).length} existing tests from scrapedTests.json`);
    } catch (e) {
      console.warn('Failed to parse existing scrapedTests.json, starting fresh');
    }
  }
  
  for (const [testId, url] of Object.entries(urls)) {
    try {
      console.log(`Waiting 2 seconds before scraping test ${testId}...`);
      await new Promise(resolve => setTimeout(resolve, 2000));
      const data = await scrapeTest(testId, url);
      scrapedData[testId] = data;
      console.log(`✅ Scraped and parsed test ${testId} successfully!\n`);
    } catch (e) {
      console.error(`❌ Failed to scrape test ${testId}:`, e.message);
    }
  }

  // Save to scrapedTests.json
  fs.writeFileSync('scrapedTests.json', JSON.stringify(scrapedData, null, 2), 'utf8');
  console.log('Saved all scraped data to scrapedTests.json');
}

run();
