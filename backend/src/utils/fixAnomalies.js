const fs = require('fs');
const https = require('https');
const path = require('path');

const filePath = path.join(__dirname, '../data/cambridgeListeningTests.js');
let fileContent = fs.readFileSync(filePath, 'utf8');

// Use a simple regex to extract the object since it's a JS file.
// We will modify the JS file by replacing text.
const tests = require('../data/cambridgeListeningTests');

const fetchUrl = (url) => {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        if (res.statusCode === 301 || res.statusCode === 302) {
           return fetchUrl(res.headers.location).then(resolve).catch(reject);
        }
        return resolve(''); // Not found
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
};

const getSlug = (title) => {
  // e.g. "Cambridge IELTS 23 Academic Listening Test 2" -> "cambridge-ielts-23-academic-listening-test-2"
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
};

const extractOptionsFromHtml = (html) => {
  const groupOptions = {}; // groupId -> array of options
  const questionGroups = {}; // questionNumber -> groupId

  // 1. Find all question drops
  // e.g. <strong id="ielts-listening-question-number-27" ...>27</strong>... data-dnd-group="152597"
  // Wait, the group is usually on a parent element.
  // <span class="options-drop-zone dnd-zone" data-dnd-group="152597"><strong ...>27</strong>
  const qRegex = /data-dnd-group="([^"]+)".*?<strong[^>]*>(\d+)<\/strong>/gs;
  let match;
  while ((match = qRegex.exec(html)) !== null) {
    questionGroups[match[2]] = match[1];
  }
  
  // Sometimes the strong tag is before the dnd-zone
  const qRegex2 = /<strong[^>]*>(\d+)<\/strong>.*?data-dnd-group="([^"]+)"/gs;
  while ((match = qRegex2.exec(html)) !== null) {
    // only if they are close
    if (match[0].length < 200) {
      questionGroups[match[1]] = match[2];
    }
  }

  // 2. Find all options for each group
  // <div class="options-dnd-panel dnd-panel dnd-panel--matching" data-dnd-group="152597">... <div class="dnd-card" draggable="true" data-value="A" data-text="A. This is only relevant...">
  const panelRegex = /data-dnd-group="([^"]+)"(.*?)<\/div>\s*<\/div>\s*<\/div>/gs;
  while ((match = panelRegex.exec(html)) !== null) {
    const groupId = match[1];
    const panelContent = match[2];
    const optRegex = /data-text="([^"]+)"/g;
    let optMatch;
    groupOptions[groupId] = [];
    while ((optMatch = optRegex.exec(panelContent)) !== null) {
       // Only add valid A. B. C. options
       if (/^[A-Z]\.\s/.test(optMatch[1])) {
          groupOptions[groupId].push(optMatch[1]);
       }
    }
  }

  // Also extract map images if any
  const maps = {};

  return { groupOptions, questionGroups };
};

const run = async () => {
  let modifications = 0;

  for (const [testKey, test] of Object.entries(tests)) {
    let hasAnomaly = false;
    test.parts.forEach(p => {
      p.questions.forEach(q => {
        if (q.type === 'fillBlank' && q.correctAnswer && q.correctAnswer.length === 1 && /[A-J]/.test(q.correctAnswer)) {
          hasAnomaly = true;
        }
      });
    });

    if (!hasAnomaly) continue;

    console.log(`Fixing test: ${test.title}`);
    const slug = getSlug(test.title);
    let html = await fetchUrl(`https://engnovate.com/ielts-listening-tests/${slug}/`);
    
    if (!html) {
      console.log(`Failed to fetch ${slug}, trying general-training`);
      const gtSlug = slug.replace('academic', 'general-training');
      html = await fetchUrl(`https://engnovate.com/ielts-listening-tests/${gtSlug}/`);
    }

    if (!html) {
      console.log(`Could not fetch HTML for ${test.title}`);
      continue;
    }

    const { groupOptions, questionGroups } = extractOptionsFromHtml(html);
    
    // Now iterate and replace in fileContent
    test.parts.forEach(part => {
      part.questions.forEach(q => {
        if (q.type === 'fillBlank' && q.correctAnswer && q.correctAnswer.length === 1 && /[A-J]/.test(q.correctAnswer)) {
          const qNum = q.id.match(/q(\d+)$/)[1];
          const groupId = questionGroups[qNum];
          if (groupId && groupOptions[groupId] && groupOptions[groupId].length > 0) {
            const options = groupOptions[groupId];
            
            // Build the string to replace
            // We need to find the exact block for this question in the fileContent.
            // A safer way is to replace the object properties via regex.
            const qIdStr = `"id": "${q.id}"`;
            const qIndex = fileContent.indexOf(qIdStr);
            if (qIndex !== -1) {
              const startIdx = fileContent.lastIndexOf('{', qIndex);
              const endIdx = fileContent.indexOf('}', qIndex) + 1;
              const block = fileContent.slice(startIdx, endIdx);
              
              let newBlock = block.replace(/"type":\s*"fillBlank"/, `"type": "matching"`);
              
              // Remove trailing underscores from the text
              newBlock = newBlock.replace(/"text":\s*"([^"]+?)_+"/, `"text": "$1"`);
              
              // Inject options before correctAnswer
              const optionsStr = `"options": [\n              ` + options.map(o => `"${o}"`).join(',\n              ') + `\n            ],\n            "correctAnswer"`;
              newBlock = newBlock.replace(/"correctAnswer"/, optionsStr);

              fileContent = fileContent.slice(0, startIdx) + newBlock + fileContent.slice(endIdx);
              modifications++;
              console.log(`Fixed ${q.id}`);
            }
          } else {
             console.log(`Could not find options for ${q.id} (qNum ${qNum})`);
          }
        }
      });
    });
  }

  if (modifications > 0) {
    fs.writeFileSync(filePath, fileContent, 'utf8');
    console.log(`Successfully made ${modifications} modifications.`);
  } else {
    console.log('No modifications made.');
  }
};

run();
