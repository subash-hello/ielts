/**
 * Generates realistic IELTS-style dialogue audio for each test part.
 * Each script is a full natural conversation, 5-8 minutes of spoken content.
 */
const fs = require('fs');
const https = require('https');
const path = require('path');
const googleTTS = require('google-tts-api');

const tests = require('../data/cambridgeListeningTests');
const outputDir = path.join(__dirname, '../../../frontend/public/audio');
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

/**
 * Build a full natural IELTS-style dialogue from a part's questions and transcript.
 * The answers are embedded naturally in the conversation.
 */
function buildNaturalScript(testNum, partIdx, part) {
  const qs = part.questions || [];
  const title = part.title || `Part ${partIdx + 1}`;
  const type = part.type || 'Conversation';

  // Use existing transcript if it's detailed enough
  let base = part.transcript || '';

  // Build a dialogue that naturally contains the answers
  if (type === 'Conversation' || type === 'Monologue') {
    // Gather all fill-blank answers into natural dialogue lines
    const fillBlanks = qs.filter(q => q.type === 'fillBlank');
    const mcqs = qs.filter(q => q.type === 'multipleChoice' || q.type === 'mcq');

    let dialogue = `[NARRATOR] You will now hear ${title}. Listen carefully and answer questions one to ten.\n\n`;
    dialogue += base + '\n\n';

    // Add filler natural speech to fill time
    dialogue += `[NARRATOR] Now listen again and check your answers.\n\n`;
    dialogue += base + '\n\n';

    // Pad with a recap
    if (fillBlanks.length > 0) {
      dialogue += `[NARRATOR] That is the end of ${title}. `;
      dialogue += fillBlanks.map(q => {
        const ans = q.correctAnswer.split('/')[0].trim();
        return `${q.text.replace('_____', ans)}`;
      }).join(' ') + '\n';
    }

    return dialogue;
  }

  return `[NARRATOR] ${title}. ${base}. [NARRATOR] That is the end of this section.`;
}

/**
 * Build scripts for Part 1 (Phone Conversation) from p1Scenarios
 */
function buildPart1Script(testNum, part) {
  const qs = part.questions || [];
  // Extract answers
  const answers = {};
  qs.forEach(q => { answers[q.id] = q.correctAnswer ? q.correctAnswer.split('/')[0].trim() : ''; });

  const title = part.title || 'Part 1';

  // Find what topic it is from title
  const topic = title.replace(/Part 1:\s*/i, '').replace(/\(Set \d+\)/, '').trim();

  // Get question answers by index
  const a = qs.map(q => q.correctAnswer ? q.correctAnswer.split('/')[0].trim() : '?');

  const script = `
[NARRATOR] Section one. You will hear a telephone conversation about a ${topic}. First you have some time to look at questions one to ten. [PAUSE 30 seconds]

[NARRATOR] Listen carefully and answer questions one to ten.

[AGENT] Good day, thank you for calling. My name is Alex, how can I help you today?

[CUSTOMER] Hello. I'd like to make a booking please.

[AGENT] Of course! Could you tell me what you're looking for?

[CUSTOMER] Yes, I need to book for ${a[0] || 'three'} please.

[AGENT] Certainly. And what type would you prefer?

[CUSTOMER] I'd like the ${a[1] || 'standard'} option please.

[AGENT] Excellent choice. And what date would you like to start?

[CUSTOMER] The ${a[2] || '12th'} of this month if possible.

[AGENT] Let me check availability... Yes, that date is available. The rate is ${a[3] || '120'} dollars.

[CUSTOMER] That sounds reasonable. What's included in that price?

[AGENT] The package includes ${a[4] || 'complimentary service'} at no extra charge.

[CUSTOMER] Wonderful. Is there anything else I should know about?

[AGENT] Yes, we also offer an optional ${a[5] || 'additional feature'} for an extra fee.

[CUSTOMER] And what's the deposit?

[AGENT] We require a deposit of ${a[6] || '50'} dollars to confirm the reservation.

[CUSTOMER] What is your cancellation policy?

[AGENT] We offer ${a[7] || '48 hours free'} cancellation. After that, the deposit is non-refundable.

[CUSTOMER] That's fine. How should I pay?

[AGENT] We only accept payment by ${a[8] || 'credit card'} for security purposes.

[CUSTOMER] No problem. My name is ${a[9] || 'John Smith'}.

[AGENT] Perfect, let me confirm that. Your booking for ${a[0]} starting the ${a[2]} has been confirmed at a rate of ${a[3]} dollars. A deposit of ${a[6]} dollars will be charged. You'll receive a confirmation email shortly.

[CUSTOMER] Thank you very much.

[AGENT] Thank you for calling. Have a wonderful day.

[NARRATOR] That is the end of section one. You now have half a minute to check your answers.

[PAUSE 30 seconds]

[NARRATOR] Now turn to section two.
`.trim();

  return script;
}

/**
 * Build scripts for Part 2 (Monologue/Tour)
 */
function buildPart2Script(testNum, part) {
  const title = part.title || 'Part 2';
  const transcript = part.transcript || '';
  const qs = part.questions || [];
  const mcqs = qs.filter(q => q.type === 'multipleChoice' || q.type === 'mcq');
  const maps = qs.filter(q => q.type === 'mapLabeling' || q.type === 'matching');

  const script = `
[NARRATOR] Section two. You will hear a talk about ${title.replace(/Part 2:\s*/i, '').replace(/\(Set \d+\)/, '').trim()}. First you have some time to look at questions eleven to twenty. [PAUSE 30 seconds]

[NARRATOR] Listen carefully and answer questions eleven to twenty.

[SPEAKER] Good morning everyone. Thank you for coming today. I'm going to give you some important information, so please listen carefully.

${transcript}

Now, I'd like to tell you a bit more about the history of this area. It was first established many decades ago and has seen significant changes over the years. The community has worked hard to improve the facilities available, and we're proud of what we've achieved.

We have made sure that all areas are clearly labelled on the map you were given when you arrived. If you look at the map now, you'll notice that the various sections are marked with letters from A through to I.

${maps.map((q, i) => {
    const ans = q.correctAnswer;
    const loc = q.text;
    return `You can find the ${loc} at position ${ans} on your map.`;
  }).join(' ')}

If you have any questions about the locations, please don't hesitate to ask. We want to make sure you feel comfortable navigating the space.

${mcqs.map(q => {
    return `${q.text} The answer is ${q.correctAnswer}.`;
  }).join(' ')}

I hope you find today's visit both enjoyable and informative. Please remember to stay with the group and to respect the space for other visitors as well.

[NARRATOR] That is the end of section two. You now have half a minute to check your answers.

[PAUSE 30 seconds]

[NARRATOR] Now turn to section three.
`.trim();

  return script;
}

/**
 * Build scripts for Part 3 (Academic Discussion)
 */
function buildPart3Script(testNum, part) {
  const title = part.title || 'Part 3';
  const transcript = part.transcript || '';
  const qs = part.questions || [];
  const matchings = qs.filter(q => q.type === 'matching');
  const fillBlanks = qs.filter(q => q.type === 'fillBlank');
  const mcqs = qs.filter(q => q.type === 'multipleChoice' || q.type === 'mcq');

  const topic = title.replace(/Part 3:\s*/i, '').replace(/\(Set \d+\)/, '').trim();

  const script = `
[NARRATOR] Section three. You will hear a conversation between students and their tutor about ${topic}. First you have some time to look at questions twenty-one to thirty. [PAUSE 30 seconds]

[NARRATOR] Listen carefully and answer questions twenty-one to thirty.

[TUTOR] Good morning Lorna, good morning Ian. Have a seat. I've reviewed your project outline and I think it's coming along well, but we need to talk through a few things before you submit.

[LORNA] Of course. We've been working really hard on it.

[IAN] Yes, we've both put in a lot of extra hours this week.

[TUTOR] I can see that. Let me share my feedback. ${transcript}

[IAN] That's really helpful, thank you. I wasn't sure how to prioritize the different sections.

[TUTOR] Well, the key is to think about what evidence you have for each claim. For example, ${matchings.length > 0 ? `${matchings[0].text} would be considered ${matchings[0].correctAnswer}.` : 'your primary sources should be cited properly.'}

[LORNA] And what about the ${matchings.length > 1 ? matchings[1].text : 'secondary analysis'}?

[TUTOR] That falls into ${matchings.length > 1 ? matchings[1].correctAnswer : 'a different category'}. You need to give it appropriate weight in your report.

[IAN] I see. And ${matchings.length > 2 ? matchings[2].text : 'the remaining sections'}?

[TUTOR] ${matchings.length > 2 ? `That's ${matchings[2].correctAnswer} priority for now.` : 'That can be addressed in the conclusion.'}

[LORNA] What about the deadline? We want to make sure we submit everything on time.

[TUTOR] ${fillBlanks.length > 0 ? `Remember, ${fillBlanks[0].text.replace('_____', fillBlanks[0].correctAnswer.split('/')[0].trim())}.` : 'The deadline is next week, so please plan accordingly.'}

[IAN] ${fillBlanks.length > 1 ? fillBlanks[1].text.replace('_____', fillBlanks[1].correctAnswer.split('/')[0].trim()) + '.' : 'We will make sure to include all required references.'}

[TUTOR] Good. Also, I want to check - ${mcqs.length > 0 ? mcqs[0].text : 'what format will you use for your presentation?'}

[LORNA] ${mcqs.length > 0 ? mcqs[0].correctAnswer : 'We plan to use slides with a Q and A session.'}

[TUTOR] That's the right approach. One more thing - ${mcqs.length > 1 ? mcqs[1].text : 'which primary method are you using?'}

[IAN] ${mcqs.length > 1 ? mcqs[1].correctAnswer : 'We are using a mixed methods approach.'}

[TUTOR] Very good. I think you're on the right track. Make sure you both review the marking rubric carefully before you submit, and don't hesitate to email me if you have any questions.

[LORNA] Thank you so much, that's been really useful.

[IAN] Yes, we really appreciate your time.

[NARRATOR] That is the end of section three. You now have half a minute to check your answers.

[PAUSE 30 seconds]

[NARRATOR] Now turn to section four.
`.trim();

  return script;
}

/**
 * Build scripts for Part 4 (Academic Lecture)
 */
function buildPart4Script(testNum, part) {
  const title = part.title || 'Part 4';
  const transcript = part.transcript || '';
  const qs = part.questions || [];
  const fillBlanks = qs.filter(q => q.type === 'fillBlank');
  const mcqs = qs.filter(q => q.type === 'multipleChoice' || q.type === 'mcq');
  const tfng = qs.filter(q => q.type === 'trueFalseNotGiven');

  const topic = title.replace(/Part 4:\s*/i, '').replace(/Lecture\s*/i, '').replace(/\(Set \d+\)/, '').trim();

  const script = `
[NARRATOR] Section four. You will hear a lecture about ${topic}. First you have some time to look at questions thirty-one to forty. [PAUSE 30 seconds]

[NARRATOR] Listen carefully and answer questions thirty-one to forty.

[PROFESSOR] Good morning. Welcome to today's lecture. I'm going to be talking about ${topic}, which is a fascinating area of study with many practical implications for our modern world.

Before I begin, I want to acknowledge that this is a complex topic, and I encourage you to take detailed notes as we go through the material.

${transcript}

Let me elaborate on some of the key points. ${fillBlanks.length > 0 ? `When we consider ${fillBlanks[0].text.replace('_____', fillBlanks[0].correctAnswer.split('/')[0].trim())}, we can see how this relates to the broader context of our discussion.` : ''}

${fillBlanks.length > 1 ? `Furthermore, research has shown that ${fillBlanks[1].text.replace('_____', fillBlanks[1].correctAnswer.split('/')[0].trim())}.` : ''}

${fillBlanks.length > 2 ? `It's also important to note that ${fillBlanks[2].text.replace('_____', fillBlanks[2].correctAnswer.split('/')[0].trim())}.` : ''}

${mcqs.length > 0 ? `One common question in this field is: ${mcqs[0].text} Studies have consistently shown that the answer is ${mcqs[0].correctAnswer}.` : ''}

${mcqs.length > 1 ? `Similarly, when we ask: ${mcqs[1].text} The evidence points to ${mcqs[1].correctAnswer}.` : ''}

Now, let me discuss some of the broader implications. This field has seen tremendous growth over the past few decades, largely driven by technological advances and increased research funding.

${fillBlanks.length > 3 ? `One key metric to track is this: ${fillBlanks[3].text.replace('_____', fillBlanks[3].correctAnswer.split('/')[0].trim())}.` : ''}

${tfng.length > 0 ? `Now, there is a common misconception I want to address: "${tfng[0].text}" - this statement is actually ${tfng[0].correctAnswer}.` : ''}

${fillBlanks.length > 4 ? `To summarise the data: ${fillBlanks[4].text.replace('_____', fillBlanks[4].correctAnswer.split('/')[0].trim())}.` : ''}

In conclusion, I hope today's lecture has given you a solid foundation in understanding ${topic}. The key takeaways are the importance of careful measurement, the value of longitudinal data, and the need for interdisciplinary collaboration.

Thank you for your attention. Please review your notes and come prepared to discuss these concepts in our next seminar.

[NARRATOR] That is the end of section four. You now have one minute to check your answers.

[PAUSE 60 seconds]

[NARRATOR] That is the end of the listening test. You now have ten minutes to transfer your answers to the answer sheet.
`.trim();

  return script;
}

function buildScript(testNum, partIdx, part) {
  const type = part.type || '';
  if (partIdx === 0) return buildPart1Script(testNum, part);
  if (partIdx === 1) return buildPart2Script(testNum, part);
  if (partIdx === 2) return buildPart3Script(testNum, part);
  if (partIdx === 3) return buildPart4Script(testNum, part);
  return buildNaturalScript(testNum, partIdx, part);
}

async function downloadAudioChunks(text) {
  const urls = googleTTS.getAllAudioUrls(text, {
    lang: 'en',
    slow: false,
    host: 'https://translate.google.com',
  });

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
    await new Promise(r => setTimeout(r, 200));
  }

  return Buffer.concat(chunks);
}

async function generateAll() {
  for (let testNum = 1; testNum <= 12; testNum++) {
    const test = tests[testNum.toString()];
    if (!test || !test.parts) continue;

    for (let partIdx = 0; partIdx < test.parts.length; partIdx++) {
      const part = test.parts[partIdx];
      const filename = `test${testNum}_part${partIdx + 1}.mp3`;
      const filePath = path.join(outputDir, filename);

      const script = buildScript(testNum, partIdx, part);
      console.log(`🔊 Regenerating ${filename} (~${script.length} chars)...`);

      try {
        const audioBuffer = await downloadAudioChunks(script);
        fs.writeFileSync(filePath, audioBuffer);
        console.log(`✅ Saved ${filename} (${(audioBuffer.length / 1024).toFixed(0)} KB)`);
        await new Promise(r => setTimeout(r, 500));
      } catch (err) {
        console.error(`❌ Failed ${filename}:`, err.message);
      }
    }
  }
  console.log('\n🎉 Done! All audio files regenerated with full IELTS-style scripts.');
}

generateAll();
