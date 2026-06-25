require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const https = require('https');
const cheerio = require('cheerio');
const TestContent = require('./src/models/TestContent');

// Helper to fetch HTML from URL
function fetchHtml(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    }, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Failed to load page: ${res.statusCode} for ${url}`));
        return;
      }
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve(body));
    }).on('error', err => reject(err));
  });
}

function cleanText(txt) {
  if (!txt) return '';
  return txt
    .replace(/\s+/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&rsquo;/g, "'")
    .replace(/&ldquo;/g, '"')
    .replace(/&rdquo;/g, '"')
    .replace(/&pound;/g, '£')
    .trim();
}

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find all Cambridge Listening tests
    const tests = await TestContent.find({
      type: 'practice_task',
      subType: 'listening',
      title: /Cambridge IELTS/i
    }).sort({ title: 1 });

    console.log(`Found ${tests.length} tests to migrate.`);

    for (const test of tests) {
      const match = test.title.match(/Cambridge IELTS\s+(\d+)(?:\s+Academic)?\s+Listening\s+Test\s+(\d+)/i);
      if (!match) {
        console.log(`Skipping (no regex match): ${test.title}`);
        continue;
      }

      const setNum = match[1];
      const testNum = match[2];
      const url = `https://engnovate.com/ielts-listening-tests/cambridge-ielts-${setNum}-academic-listening-test-${testNum}/`;

      console.log(`\n--------------------------------------------`);
      console.log(`Migrating: ${test.title}`);
      console.log(`URL: ${url}`);

      try {
        const html = await fetchHtml(url);
        const $ = cheerio.load(html);

        const parts = test.content.parts || test.content.listeningParts || [];
        if (parts.length === 0) {
          console.log(`⚠️ Warning: No parts array found in test.content for ${test.title}`);
          continue;
        }

        const sections = $('.ielts-listening-question-section');
        if (sections.length === 0) {
          console.log(`❌ Error: No .ielts-listening-question-section found on the scraped page for ${test.title}`);
          continue;
        }

        console.log(`Scraped ${sections.length} parts from webpage. Database has ${parts.length} parts.`);

        let updated = false;
        for (let i = 0; i < parts.length; i++) {
          const sectionElem = sections.eq(i);
          if (sectionElem.length) {
            const clone = sectionElem.clone();
            
            // Clean up the HTML
            clone.find('.ielts-listening-section-start-time-button').remove();
            clone.find('audio').remove();
            clone.find('.ielts-listening-part-audio').remove();
            
            // Clear input values
            clone.find('input[type="text"]').val('').attr('value', '');
            
            const layoutHtml = cleanText(clone.html());
            
            if (layoutHtml) {
              parts[i].layoutHtml = layoutHtml;
              updated = true;
            }
          }
        }

        if (updated) {
          test.content.parts = parts;
          test.markModified('content');
          await test.save();
          console.log(`✅ Successfully saved layout HTML for ${test.title}`);
        } else {
          console.log(`⚠️ No layout HTML was extracted for ${test.title}`);
        }

      } catch (err) {
        console.error(`❌ Failed migrating ${test.title}:`, err.message);
      }

      // Add a rate limit delay of 1.5 seconds between requests
      await new Promise(resolve => setTimeout(resolve, 1500));
    }

    console.log('\n============================================');
    console.log('Migration finished!');
    process.exit(0);

  } catch (err) {
    console.error('Fatal error during migration:', err);
    process.exit(1);
  }
}

run();
