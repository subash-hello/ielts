const mongoose = require('mongoose');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '../../.env' });

const TestContent = require('../models/TestContent');

const IMAGE_DIR = path.join(__dirname, '../../../../frontend/public/images');
if (!fs.existsSync(IMAGE_DIR)) {
  fs.mkdirSync(IMAGE_DIR, { recursive: true });
}

async function searchEngnovate(testTitle) {
  try {
    const searchUrl = `https://engnovate.com/?s=${encodeURIComponent(testTitle)}`;
    const res = await fetch(searchUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const html = await res.text();
    const $ = cheerio.load(html);
    
    // Find the first article link
    const link = $('article h2 a').first().attr('href') || $('h3 a').first().attr('href') || $('.post-title a').first().attr('href');
    if (!link) return null;

    const pageRes = await fetch(link, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const pageHtml = await pageRes.text();
    const page$ = cheerio.load(pageHtml);
    
    // Extract images that might be maps
    let mapImgUrl = null;
    page$('img').each((i, el) => {
      const src = page$(el).attr('src');
      if (src && (src.toLowerCase().includes('map') || src.toLowerCase().includes('plan') || src.toLowerCase().includes('diagram'))) {
        mapImgUrl = src;
      }
    });

    if (!mapImgUrl) {
      // Just grab the largest or first relevant content image
      const firstImg = page$('.entry-content img').first().attr('src');
      if (firstImg) mapImgUrl = firstImg;
    }

    return mapImgUrl;
  } catch (err) {
    console.error(`Engnovate search failed for ${testTitle}: ${err.message}`);
    return null;
  }
}

async function searchIeltsTrainingOnline(testTitle) {
  try {
    const searchUrl = `https://ieltstrainingonline.com/?s=${encodeURIComponent(testTitle)}`;
    const res = await fetch(searchUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const html = await res.text();
    const $ = cheerio.load(html);
    
    const link = $('h2 a').first().attr('href') || $('.entry-title a').first().attr('href');
    if (!link) return null;

    const pageRes = await fetch(link, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const pageHtml = await pageRes.text();
    const page$ = cheerio.load(pageHtml);
    
    let mapImgUrl = null;
    page$('img').each((i, el) => {
      const src = page$(el).attr('src');
      if (src && (src.toLowerCase().includes('map') || src.toLowerCase().includes('plan') || src.toLowerCase().includes('diagram'))) {
        mapImgUrl = src;
      }
    });

    if (!mapImgUrl) {
      const firstImg = page$('.entry-content img').first().attr('src');
      if (firstImg) mapImgUrl = firstImg;
    }

    return mapImgUrl;
  } catch (err) {
    console.error(`IELTS Training Online search failed for ${testTitle}: ${err.message}`);
    return null;
  }
}

async function downloadImage(url, filename) {
  const filepath = path.join(IMAGE_DIR, filename);
  const writer = fs.createWriteStream(filepath);

  const response = await fetch(url, {
    method: 'GET',
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });

  if (!response.ok) throw new Error(`unexpected response ${response.statusText}`);

  // In Node 18+ fetch, response.body is a web stream. We can pipe it to fs using stream/web
  const { Readable } = require('stream');
  const body = Readable.fromWeb(response.body);
  body.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
}

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const tests = await TestContent.find({ subType: 'listening' });
    let updatedCount = 0;

    for (const test of tests) {
      if (!test.content || !test.content.parts) continue;
      
      let modified = false;

      for (const part of test.content.parts) {
        let needsMap = false;
        
        if (part.questions) {
          part.questions.forEach(q => {
            if (q.type === 'mapLabeling' || q.type === 'matching' || q.type === 'map' || q.text.toLowerCase().includes('map')) {
              needsMap = true;
            }
          });
        }

        if (needsMap && !part.imageUrl && !part.image) {
          console.log(`Missing map for: ${test.title} - Part ${part.part}`);
          
          let imgUrl = await searchEngnovate(test.title);
          if (!imgUrl) {
            console.log(`Not found on engnovate, trying ieltstrainingonline...`);
            imgUrl = await searchIeltsTrainingOnline(test.title);
          }

          if (imgUrl) {
            console.log(`Found image: ${imgUrl}`);
            const ext = path.extname(new URL(imgUrl).pathname) || '.jpg';
            const filename = `${test.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_part${part.part}_map${ext}`;
            
            try {
              await downloadImage(imgUrl, filename);
              part.imageUrl = `/images/${filename}`;
              modified = true;
              console.log(`Downloaded to ${part.imageUrl}`);
            } catch (dlErr) {
              console.error(`Failed to download ${imgUrl}:`, dlErr.message);
            }
          } else {
            console.log(`Could not find any map image for ${test.title} Part ${part.part}. Using fallback map.`);
            part.imageUrl = '/images/map_question.png';
            modified = true;
          }
        }
      }

      if (modified) {
        test.markModified('content');
        await test.save();
        updatedCount++;
      }
    }

    console.log(`Finished! Updated ${updatedCount} tests.`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
