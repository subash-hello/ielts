const fs = require('fs');
const cheerio = require('cheerio');

// Load Test 10 HTML
const html10 = fs.readFileSync('C:\\Users\\subas\\.gemini\\antigravity\\brain\\a3a0dc82-762a-48f7-b9fa-659041ee7182\\.system_generated\\steps\\3769\\content.md', 'utf8');
const $10 = cheerio.load(html10);

// Load Test 7 HTML
const html7 = fs.readFileSync('C:\\Users\\subas\\.gemini\\antigravity\\brain\\a3a0dc82-762a-48f7-b9fa-659041ee7182\\.system_generated\\steps\\3689\\content.md', 'utf8');
const $7 = cheerio.load(html7);

function cleanText(txt) {
  if (!txt) return '';
  return txt.replace(/\s+/g, ' ').replace(/&nbsp;/g, ' ').replace(/&rsquo;/g, "'").replace(/&ldquo;/g, '"').replace(/&rdquo;/g, '"').replace(/&pound;/g, '£').trim();
}

function parseQuestions($, start, end) {
  for (let qNum = start; qNum <= end; qNum++) {
    const qNumElem = $(`#ielts-listening-question-number-${qNum}`);
    if (!qNumElem.length) {
      console.log(`Q${qNum} -> not found`);
      continue;
    }
    
    // 1. Check if matching cell
    const tdQuestion = qNumElem.closest('.ielts-listening-matching-question-cell');
    if (tdQuestion.length) {
      const text = cleanText(tdQuestion.find('span').text()) || cleanText(tdQuestion.text().replace(qNum.toString(), ''));
      console.log(`Q${qNum} (Matching): "${text}"`);
      continue;
    }
    
    const parentItem = qNumElem.closest('.ielts-listening-question-item');
    if (parentItem.length) {
      // 2. Check if MCQ
      const optionsDivs = parentItem.find('.ielts-listening-option');
      if (optionsDivs.length) {
        const questionText = cleanText(parentItem.find('> span > span').text()) || cleanText(qNumElem.parent().text().replace(qNum.toString(), ''));
        console.log(`Q${qNum} (MCQ): "${questionText}"`);
        continue;
      }
      
      // 3. Check if matching in parent
      if (parentItem.find('.ielts-listening-matching-question-cell').length) {
        const cell = parentItem.find('.ielts-listening-matching-question-cell');
        const text = cleanText(cell.find('span').text()) || cleanText(cell.text().replace(qNum.toString(), ''));
        console.log(`Q${qNum} (Matching parent): "${text}"`);
        continue;
      }
      
      // 4. Fill Blank / DND logic
      const isDiv = parentItem.prop('tagName').toLowerCase() === 'div';
      const itemParent = isDiv ? parentItem : parentItem.parent();
      const clone = itemParent.clone();
      
      const targetSpan = clone.find(`#ielts-listening-question-number-${qNum}`).parent();
      if (targetSpan.length) {
        targetSpan.replaceWith('_____');
      } else {
        clone.find('input[type="text"], input[type="hidden"]').replaceWith('_____');
        clone.find('.ielts-listening-question-number').remove();
      }
      
      if (!isDiv) {
        clone.find('.ielts-listening-question-item').each((i, el) => {
          const num = $(el).find('.ielts-listening-question-number').text();
          $(el).replaceWith(`(${num})`);
        });
      }
      
      console.log(`Q${qNum} (FillBlank/DND): "${cleanText(clone.text())}"`);
    } else {
      console.log(`Q${qNum} (Fallback): Question ${qNum}`);
    }
  }
}

console.log('--- Test 10 Q11 to Q20 ---');
parseQuestions($10, 11, 20);

console.log('\n--- Test 10 Q27 to Q30 ---');
parseQuestions($10, 27, 30);
