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
      if (res.statusCode !== 200) {
          resolve('');
          return;
      }
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve(body));
    }).on('error', err => resolve(''));
  });
}

function fetchAnswers(postId) {
  return new Promise((resolve, reject) => {
    const postData = querystring.stringify({ action: 'ielts_reading_get_answer_key', post_id: postId });
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
    req.on('error', () => resolve([]));
    req.write(postData);
    req.end();
  });
}

async function scrapeTest(bookNum, testNum) {
  const url = `https://engnovate.com/ielts-reading-tests/cambridge-ielts-${bookNum}-academic-reading-test-${testNum}/`;
  console.log(`Scraping Book ${bookNum} Test ${testNum} ...`);
  try {
    const html = await fetchHtml(url);
    if (!html) return null;
    const $ = cheerio.load(html);
    
    // Find post id for answers
    let postId = null;
    $('script').each((i, el) => {
      const scriptText = $(el).html();
      if (scriptText && scriptText.includes('var ielts_reading_post_id')) {
        const match = scriptText.match(/ielts_reading_post_id\s*=\s*['"]?(\d+)['"]?/);
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
      if (!answerKey || answerKey.length === 0) {
        // Fallback action name
        const postData = querystring.stringify({ action: 'get_answer_key', post_id: postId });
        // Assume failure for fallback for now to keep simple
      }
    }
    
    // Extract drag and drop options (headings/summary lists)
    const dndGroups = {};
    $('.dnd-panel').each((i, panel) => {
        const groupId = $(panel).attr('data-dnd-group');
        const options = [];
        $(panel).find('.dnd-card').each((j, card) => {
            options.push($(card).attr('data-text') || $(card).text().trim());
        });
        if (groupId) dndGroups[groupId] = options;
    });

    const passages = [];
    for (let partNum = 1; partNum <= 3; partNum++) {
      let passageText = '';
      const panels = $('.ielts-reading-transcript');
      if (panels.length >= partNum) {
          passageText = $(panels[partNum-1]).text().trim();
      }
      
      if (!passageText.trim()) continue;

      const questions = [];
      const startQ = (partNum === 1) ? 1 : (partNum === 2 ? 14 : 27);
      const endQ = (partNum === 1) ? 13 : (partNum === 2 ? 26 : 40);

      for (let qNum = startQ; qNum <= endQ; qNum++) {
        const ansObj = answerKey[qNum - 1];
        const correctAnswer = ansObj ? ansObj.answer : '';
        const qNumElem = $(`#ielts-reading-question-number-${qNum}`);
        if (!qNumElem.length) {
          questions.push({ id: `c${bookNum}t${testNum}p${partNum}q${qNum}`, type: "fill", text: `Question ${qNum}`, correctAnswer });
          continue;
        }

        const parentItem = qNumElem.closest('.ielts-reading-question-item');
        if (parentItem.length) {
          const optionsDivs = parentItem.find('.ielts-reading-option');
          if (optionsDivs.length) {
             const questionText = cleanText(parentItem.find('> span > span').text()) || cleanText(qNumElem.parent().text().replace(qNum.toString(), ''));
             const options = [];
             optionsDivs.each((i, opt) => options.push(cleanText($(opt).text())));
             questions.push({ id: `c${bookNum}t${testNum}p${partNum}q${qNum}`, type: "mcq", text: questionText, options, correctAnswer });
             continue;
          }
        }
        
        let rawQuestionText = cleanText(qNumElem.closest('p, div, td, li').text().replace(qNum.toString(), ''));
        let questionText = rawQuestionText;
        let options = undefined;
        let qType = 'fill';

        // Check if this is a drag-and-drop question
        const dropZone = qNumElem.closest('.dnd-zone');
        if (dropZone.length) {
             const groupId = dropZone.attr('data-dnd-group');
             if (groupId && dndGroups[groupId]) {
                 options = dndGroups[groupId];
                 // Determine question text based on next sibling (which is usually the paragraph letter for headings)
                 let nextTextNode = dropZone.get(0)?.nextSibling;
                 if (nextTextNode && nextTextNode.nodeType === 3 && nextTextNode.nodeValue.trim()) {
                     questionText = `Heading for Paragraph ${nextTextNode.nodeValue.trim()}`;
                 } else {
                     questionText = `Choose correct option for Question ${qNum}`;
                 }
             }
        }

        if (rawQuestionText.includes("Drop heading here")) {
             let nextTextNode = dropZone.length ? dropZone.get(0)?.nextSibling : qNumElem.nextAll().last().get(0)?.nextSibling;
             if (nextTextNode && nextTextNode.nodeType === 3 && nextTextNode.nodeValue.trim()) {
                 questionText = `Heading for Paragraph ${nextTextNode.nodeValue.trim()}`;
             }
        } else if (rawQuestionText.includes("Drop answer here")) {
             questionText = `Summary completion ${qNum}`;
        }

        if (!questionText || questionText.length < 2) questionText = `Question ${qNum}`;
        
        // Infer type
        if (options && options.length > 0 && !questionText.includes("Heading for Paragraph")) {
            // Summary completion with options
            qType = 'fill'; 
            // We can keep it as fill but it actually requires options. We can save options.
        } else if (options && options.length > 0) {
            // Heading matching
            qType = 'fill'; // Or 'mcq' ? But IELTS heading match is usually just typing the roman numeral
        } else if (correctAnswer.toLowerCase() === 'true' || correctAnswer.toLowerCase() === 'false' || correctAnswer.toLowerCase() === 'not given' || correctAnswer.toLowerCase() === 'yes' || correctAnswer.toLowerCase() === 'no') {
            qType = 'tfng';
        }

        let qObj = { id: `c${bookNum}t${testNum}p${partNum}q${qNum}`, type: qType, text: questionText, correctAnswer };
        if (options) qObj.options = options;
        questions.push(qObj);
      }

      passages.push({
        title: `Cambridge IELTS ${bookNum} Academic Reading Test ${testNum} - Passage ${partNum}`,
        type: "practice_task",
        subType: "reading",
        difficulty: "hard",
        isActive: true,
        content: {
          timeLimit: 20,
          type: "academic",
          topic: `Passage ${partNum}`,
          passage: passageText.replace(/\d*Drop heading here([A-Z]?)/g, '$1\n\n').replace(/\d*Drop answer here/g, '___').trim(),
          questions
        }
      });
    }

    return passages;
  } catch (error) {
    console.error(`Failed Test ${bookNum} Test ${testNum}`, error);
    return [];
  }
}

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  for (let book = 10; book <= 17; book++) {
    for (let test = 1; test <= 4; test++) {
      const title = `Cambridge IELTS ${book} Academic Reading Test ${test} - Passage 1`;
      const exists = await TestContent.findOne({ title });
      if (exists) {
        console.log(`Skipping ${book} Test ${test}, already exists.`);
        continue;
      }
      
      const passages = await scrapeTest(book, test);
      for (const p of passages) {
         await TestContent.create(p);
         console.log(`Saved ${p.title} to database`);
      }
      await new Promise(r => setTimeout(r, 1000));
    }
  }

  console.log('Finished seeding all reading tests.');
  process.exit(0);
}

main();
