const fs = require('fs');
const https = require('https');
const googleTTS = require('google-tts-api'); // CommonJS

const text = "Welcome to the University Campus Library. Let's look at the ground floor map to help you get oriented. When you enter through the main entrance, you will immediately see the Lending Desk on your right, which is marked as area A on your map. Right in the middle of the floor is the Main Reception, marked as B. If you walk past the reception to the east side of the building, you'll find the Cafe and Lounge, which is area C. In the top right, or north-east corner, is the Reference Section, area D. Moving over to the west side, you'll see a few different rooms. The Private Study Rooms are located at E. Just north of those is the Multimedia Lab, area F. In the far north-west corner, you will find the Silent Reading Area, area G. Next to the main reception, there's a small Photocopying Room at H. Finally, on the north side, the large area is the Group Study Zone, marked as I. Oh, and I almost forgot the IT Support Desk, which is located in area J.";

async function generateTTS() {
  try {
    const urls = googleTTS.getAllAudioUrls(text, {
      lang: 'en',
      slow: false,
      host: 'https://translate.google.com',
    });

    console.log(`Generated ${urls.length} audio chunks.`);

    const chunks = [];
    for (const urlObj of urls) {
      const buffer = await new Promise((resolve, reject) => {
        https.get(urlObj.url, (res) => {
          const data = [];
          res.on('data', (chunk) => data.push(chunk));
          res.on('end', () => resolve(Buffer.concat(data)));
          res.on('error', reject);
        }).on('error', reject);
      });
      chunks.push(buffer);
    }

    const finalBuffer = Buffer.concat(chunks);
    fs.writeFileSync('../frontend/public/library-map-audio.mp3', finalBuffer);
    console.log('Saved library-map-audio.mp3');

  } catch (error) {
    console.error('Error generating TTS:', error);
  }
}

generateTTS();
