const fs = require('fs');
const cheerio = require('cheerio');

// Let's test on Test 10
const html10 = fs.readFileSync('C:\\Users\\subas\\.gemini\\antigravity\\brain\\a3a0dc82-762a-48f7-b9fa-659041ee7182\\.system_generated\\steps\\3769\\content.md', 'utf8');
const $10 = cheerio.load(html10);

function cleanText(txt) {
  if (!txt) return '';
  return txt.replace(/\s+/g, ' ').replace(/&nbsp;/g, ' ').replace(/&rsquo;/g, "'").replace(/&ldquo;/g, '"').replace(/&rdquo;/g, '"').replace(/&pound;/g, '£').trim();
}

function parseQuestions($, start, end) {
  for (let qNum = start; qNum <= end; qNum++) {
    const qNumElem = $(`#ielts-listening-question-number-${qNum}`);
    if (!qNumElem.length) continue;
    
    const parentItem = qNumElem.closest('.ielts-listening-question-item');
    if (parentItem.length) {
      const isSpan = parentItem.prop('tagName').toLowerCase() === 'span';
      const itemParent = isSpan ? parentItem.parent() : parentItem;
      const clone = itemParent.clone();
      
      const targetSpan = clone.find(`#ielts-listening-question-number-${qNum}`).parent();
      if (targetSpan.length) {
        targetSpan.replaceWith('_____');
      } else {
        clone.find('input[type="text"], input[type="hidden"]').replaceWith('_____');
        clone.find('.ielts-listening-question-number').remove();
      }
      
      // If we used the parent, replace other items with (number)
      if (isSpan) {
        clone.find('.ielts-listening-question-item').each((i, el) => {
          const num = $(el).find('.ielts-listening-question-number').text();
          $(el).replaceWith(`(${num})`);
        });
      }
      
      console.log(`Q${qNum}:`, cleanText(clone.text()));
    }
  }
}

console.log('--- Test 10 Q27 to Q30 ---');
parseQuestions($10, 27, 30);
console.log('\n--- Test 10 Q15 to Q20 ---');
parseQuestions($10, 15, 20);
