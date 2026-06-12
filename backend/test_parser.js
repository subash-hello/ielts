const fs = require('fs');
const cheerio = require('cheerio');

const html = fs.readFileSync('C:\\Users\\subas\\.gemini\\antigravity\\brain\\a3a0dc82-762a-48f7-b9fa-659041ee7182\\.system_generated\\steps\\3689\\content.md', 'utf8');
const $ = cheerio.load(html);

function cleanText(txt) {
  if (!txt) return '';
  return txt.replace(/\s+/g, ' ').replace(/&nbsp;/g, ' ').replace(/&rsquo;/g, "'").replace(/&ldquo;/g, '"').replace(/&rdquo;/g, '"').replace(/&pound;/g, '£').trim();
}

for (let qNum = 1; qNum <= 40; qNum++) {
  const qNumElem = $(`#ielts-listening-question-number-${qNum}`);
  if (!qNumElem.length) {
    console.log(`Q${qNum} -> not found`);
    continue;
  }
  const parentItem = qNumElem.closest('.ielts-listening-question-item');
  if (parentItem.length) {
    const optionsDivs = parentItem.find('.ielts-listening-option');
    if (optionsDivs.length) {
      const questionText = cleanText(parentItem.find('> span > span').text()) || cleanText(qNumElem.parent().text().replace(qNum.toString(), ''));
      console.log(`Q${qNum} (MCQ):`, questionText);
    } else {
      const itemParent = parentItem.parent();
      const clone = itemParent.clone();
      const targetSpan = clone.find(`#ielts-listening-question-number-${qNum}`).parent();
      targetSpan.replaceWith('_____');
      
      clone.find('.ielts-listening-question-item').each((i, el) => {
        const num = $(el).find('.ielts-listening-question-number').text();
        $(el).replaceWith(`(${num})`);
      });
      
      console.log(`Q${qNum} (FillBlank):`, cleanText(clone.text()));
    }
  } else {
    // Check if matching
    const tdQuestion = qNumElem.closest('.ielts-listening-matching-question-cell');
    if (tdQuestion.length) {
      const text = cleanText(tdQuestion.find('span').text()) || cleanText(tdQuestion.text().replace(qNum.toString(), ''));
      console.log(`Q${qNum} (Matching):`, text);
    } else {
      console.log(`Q${qNum} (Other): not inside regular containers`);
    }
  }
}
