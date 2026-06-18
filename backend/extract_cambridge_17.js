const fs = require('fs');
const https = require('https');
const cheerio = require('cheerio');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const urls = [
  "https://engnovate.com/ielts-listening-tests/cambridge-ielts-17-academic-listening-test-1/"
];

function fetchHtml(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve(body));
    }).on('error', err => reject(err));
  });
}

const systemPrompt = `You are an expert data extractor for IELTS Listening tests.
Given a chunk of HTML representing a part (e.g., Section 1, 2, 3, or 4) of an IELTS Listening test, extract the questions into a precise JSON structure.

Rules:
1. Identify the question type (e.g., fillBlank, multipleChoice, matching, mapLabeling).
2. If it's a Table Completion, Flowchart, or Summary Completion, use the 'displayLayouts' structure.
3. For 'displayLayouts', the type can be 'table', 'flowchart', or 'summary'. 
   - 'table' must have 'headers' (array of strings) and 'rows' (array of array of strings).
   - Use '{{c17tXpYqZ}}' (e.g., {{c17t1p1q1}}) as the placeholder for the blank inside the table cells.
4. Output MUST be a valid JSON array of objects representing 'questions' and an optional 'displayLayouts' array.

Example output format for a part:
{
  "displayLayouts": [
    {
      "type": "table",
      "questionIds": ["c17t1q1", "c17t1q2"],
      "headers": ["Type", "Details"],
      "rows": [
        ["Example", "Make sure {{c17t1q1}} is clean"],
        ["Next", "Pay is {{c17t1q2}} per hour"]
      ]
    }
  ],
  "questions": [
    {
      "id": "c17t1q1",
      "type": "fillBlank",
      "text": "Make sure _____ is clean",
      "correctAnswer": ""
    }
  ]
}`;

async function processPart(htmlChunk, testIdx, partNum) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash", systemInstruction: systemPrompt });
  
  const prompt = `Extract the questions for Test ${testIdx}, Part ${partNum}. Here is the HTML:\n\n${htmlChunk.substring(0, 8000)}`;
  
  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    // parse JSON from markdown codeblock
    const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonStr);
  } catch (err) {
    console.error(`Error processing Test ${testIdx} Part ${partNum}:`, err.message);
    return { questions: [] };
  }
}

async function scrapeTest(url, testIdx) {
  console.log(`Scraping Test ${testIdx}...`);
  const html = await fetchHtml(url);
  const $ = cheerio.load(html);
  
  // Extract audio
  const mp3s = [];
  $('audio source').each((i, el) => {
    const src = $(el).attr('src');
    if (src && src.endsWith('.mp3') && !mp3s.includes(src)) {
      mp3s.push(src);
    }
  });

  const parts = [];
  for (let p = 1; p <= 4; p++) {
    console.log(`  Processing Part ${p}...`);
    // Extract transcript
    let transcriptText = '';
    $(`#ielts-listening-transcript-${p} p`).each((i, el) => {
      transcriptText += $(el).text() + '\n';
    });

    let questionsHtml = '';
    const startQ = (p - 1) * 10 + 1;
    const endQ = p * 10;
    
    // Attempt to grab the question wrapper
    for(let q=startQ; q<=endQ; q++) {
       const qElem = $(`#ielts-listening-question-number-${q}`);
       if (qElem.length) {
         let htmlChunk = qElem.closest('table').length 
            ? qElem.closest('table').parent().html() 
            : qElem.parent().parent().html();
         if (!questionsHtml.includes(htmlChunk.substring(0, 50))) {
            questionsHtml += htmlChunk + '\n';
         }
       }
    }

    // Call LLM
    const parsedData = await processPart(questionsHtml, testIdx, p);

    parts.push({
      part: p,
      title: `Part ${p}: Questions ${startQ}-${endQ}`,
      type: "Conversation",
      audioUrl: mp3s[p-1] || mp3s[0] || "",
      transcript: transcriptText.trim(),
      displayLayouts: parsedData.displayLayouts || undefined,
      questions: parsedData.questions || []
    });
  }

  return {
    id: `c17t${testIdx}`,
    title: `Cambridge IELTS 17 Academic Listening Test ${testIdx}`,
    duration: "30 min",
    difficulty: "hard",
    parts
  };
}

async function main() {
  const tests = {};
  for (let i = 0; i < urls.length; i++) {
    const testData = await scrapeTest(urls[i], i + 1);
    tests[testData.id] = testData;
  }
  
  fs.writeFileSync('src/data/cambridge17.json', JSON.stringify(tests, null, 2));
  console.log('Done! Saved to src/data/cambridge17.json');
}

main();
