const fs = require('fs');
const path = require('path');
const https = require('https');
const cheerio = require('cheerio');

const CACHE_FILE = path.join(__dirname, 'cambridge18to25Raw.json');
const DATA_FILE = 'c:/Users/subas/OneDrive/Documents/projects/ielts/backend/src/data/cambridgeListeningTests.js';

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

function cleanText(txt) {
  if (!txt) return '';
  return txt.replace(/\s+/g, ' ').replace(/&nbsp;/g, ' ').replace(/&rsquo;/g, "'").replace(/&ldquo;/g, '"').replace(/&rdquo;/g, '"').replace(/&pound;/g, '£').trim();
}

async function scrapeLayouts(url, testTitle) {
  console.log(`Scraping layouts from ${url}...`);
  const html = await fetchHtml(url);
  const $ = cheerio.load(html);

  const sections = $('.ielts-listening-question-section');
  const scrapedParts = [];

  sections.each((index, sectionElem) => {
    const partNum = index + 1;
    const clone = $(sectionElem).clone();

    // Clean HTML
    clone.find('.ielts-listening-section-start-time-button').remove();
    clone.find('audio').remove();
    clone.find('.ielts-listening-part-audio').remove();
    clone.find('input[type="text"]').val('').attr('value', '');

    const layoutHtml = cleanText(clone.html());

    // Extract image URL if exists in this section
    const imgElem = $(sectionElem).find('img');
    let imageUrl = undefined;
    if (imgElem.length) {
      let src = imgElem.attr('src') || imgElem.attr('data-src');
      if (src) {
        src = src.trim();
        if (src.startsWith('/')) {
          imageUrl = `https://engnovate.com${src}`;
        } else {
          imageUrl = src;
        }
      }
    }

    scrapedParts.push({
      part: partNum,
      layoutHtml: layoutHtml || null,
      imageUrl: imageUrl || null
    });
  });

  return scrapedParts;
}

async function run() {
  if (!fs.existsSync(DATA_FILE)) {
    console.error('Data file not found at:', DATA_FILE);
    process.exit(1);
  }

  const dataset = require(DATA_FILE);
  let scrapedData = {};

  if (fs.existsSync(CACHE_FILE)) {
    try {
      scrapedData = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
      console.log(`Loaded ${Object.keys(scrapedData).length} tests from cache.`);
    } catch (e) {
      console.warn('Failed to parse cache, starting fresh');
    }
  }

  // Iterate over keys 1 to 30 (Cambridge 18-25)
  for (let i = 1; i <= 30; i++) {
    const key = i.toString();
    const test = dataset[key];

    if (!test) {
      console.warn(`Warning: Test key ${key} not found in dataset.`);
      continue;
    }

    if (scrapedData[key]) {
      console.log(`Skipping key ${key} (${test.title}) - already in cache`);
      continue;
    }

    // Parse book and test number from title
    const match = test.title.match(/Cambridge IELTS (\d+) Academic Listening Test (\d+)/i);
    if (!match) {
      console.warn(`Could not parse Book and Test number from title: "${test.title}"`);
      continue;
    }

    const book = match[1];
    const testNum = match[2];
    const url = `https://engnovate.com/ielts-listening-tests/cambridge-ielts-${book}-academic-listening-test-${testNum}/`;

    try {
      console.log(`\nWaiting 5 seconds before scraping key ${key} (${test.title})...`);
      await new Promise(resolve => setTimeout(resolve, 5000));

      const parts = await scrapeLayouts(url, test.title);
      scrapedData[key] = {
        title: test.title,
        parts: parts
      };

      // Save immediately to cache
      fs.writeFileSync(CACHE_FILE, JSON.stringify(scrapedData, null, 2), 'utf8');
      console.log(`✅ Successfully scraped layouts for key ${key} (${test.title})!`);
    } catch (err) {
      console.error(`❌ Failed to scrape key ${key} (${test.title}):`, err.message);
      // Wait longer on failure before next attempt
      await new Promise(resolve => setTimeout(resolve, 15000));
    }
  }

  console.log('\nScraping layouts completed.');
}

run();
