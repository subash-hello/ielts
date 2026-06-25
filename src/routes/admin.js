const express = require('express');
const { adminAuth } = require('../middleware/auth');
const User = require('../models/User');
const Session = require('../models/Session');
const TestContent = require('../models/TestContent');
const MockTest = require('../models/MockTest');
const { formatResponse } = require('../utils/helpers');
const { getModel } = require('../config/gemini');

const router = express.Router();

router.get('/stats', adminAuth, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeToday = await User.countDocuments({ lastActive: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } });
    const totalSessions = await Session.countDocuments();
    const premiumUsers = await User.countDocuments({ subscription: { $ne: 'free' } });
    res.json(formatResponse({ totalUsers, activeToday, totalSessions, premiumUsers }));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/users', adminAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const users = await User.find().skip((page - 1) * limit).limit(limit).select('-password').sort({ createdAt: -1 });
    const total = await User.countDocuments();
    res.json(formatResponse({ users, total, page, pages: Math.ceil(total / limit) }));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/users/:id', adminAuth, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
    res.json(formatResponse(user));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/analytics', adminAuth, async (req, res) => {
  try {
    const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const newUsers = await User.countDocuments({ createdAt: { $gte: last30Days } });
    const sessionsThisMonth = await Session.countDocuments({ createdAt: { $gte: last30Days } });
    res.json(formatResponse({ newUsers, sessionsThisMonth }));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add new content
router.post('/content', adminAuth, async (req, res) => {
  try {
    const newContent = new TestContent({
      ...req.body,
      createdBy: req.user.id
    });
    await newContent.save();
    res.json(formatResponse(newContent, 'Content added successfully'));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// AI Content Generation
router.post('/content/generate', adminAuth, async (req, res) => {
  try {
    const { prompt, type, subType, difficulty } = req.body;
    const model = getModel();
    
    const systemPrompt = `You are an expert IELTS examiner and content creator. Generate realistic IELTS practice material based on the following request.
You MUST return the output ONLY as valid JSON matching the format required for the specified type/subType.
Type: ${type}
SubType: ${subType}
Difficulty: ${difficulty}
User Prompt: ${prompt}

If type is "practice_task" and subType is "speaking", return JSON like: { "part": 2, "desc": "Detailed instructions...", "duration": "3 min" }
If type is "practice_task" and subType is "writing", return JSON like: { "taskType": 2, "prompt": "Essay prompt...", "duration": "40 min" }
If type is "mock_test", generate a comprehensive JSON representing the test.
Only return the raw JSON object. Do not include markdown \`\`\`json block.`;

    const result = await model.generateContent(systemPrompt);
    const text = result.response.text();
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const jsonContent = JSON.parse(cleanText);

    res.json(formatResponse(jsonContent, 'AI generated successfully'));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all content
router.get('/content', adminAuth, async (req, res) => {
  try {
    const content = await TestContent.find().sort({ createdAt: -1 });
    res.json(formatResponse(content));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete content
router.delete('/content/:id', adminAuth, async (req, res) => {
  try {
    await TestContent.findByIdAndDelete(req.params.id);
    res.json(formatResponse(null, 'Content deleted successfully'));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update content
router.put('/content/:id', adminAuth, async (req, res) => {
  try {
    const updated = await TestContent.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(formatResponse(updated, 'Content updated successfully'));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all student results (Mock tests)
router.get('/results', adminAuth, async (req, res) => {
  try {
    const results = await MockTest.find({ status: 'completed' }).populate('userId', 'name email').sort({ createdAt: -1 });
    res.json(formatResponse(results));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/approve-student', adminAuth, async (req, res) => {
  try {
    const { studentId, action } = req.body; // action: 'approve' | 'decline'
    const status = action === 'approve' ? 'approved' : 'declined';
    
    const user = await User.findByIdAndUpdate(studentId, { status }, { new: true }).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Broadcast the real-time status update to the student's socket room
    const io = req.app.get('io');
    if (io) {
      io.to(studentId).emit('status-update', { status });
    }

    res.json(formatResponse(user, `Student was successfully ${action}d.`));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/users/:id', adminAuth, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(formatResponse(null, 'User successfully deleted from directory'));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/ai/chat', adminAuth, async (req, res) => {
  try {
    const { prompt, history = [] } = req.body;

    const cambridgeMatch = prompt.match(/(?:upload|add|create|seed|insert)?\s*cambridge\s+(listening|reading|writing)\s+(\d+)\s+(?:test|task)?\s*(\d+)/i);
    if (cambridgeMatch) {
      const subType = cambridgeMatch[1].toLowerCase();
      const book = parseInt(cambridgeMatch[2]);
      const testNum = parseInt(cambridgeMatch[3]);
      
      const cambridgeListeningTests = require('../data/cambridgeListeningTests');
      const { topics: cambridgeReadingTopics, generateTestContent: generateReadingContent } = require('../data/cambridgeReadingTests');
      const cambridgeWritingTests = require('../data/cambridgeWritingTests');
      
      if (subType === 'listening') {
        const foundKey = Object.keys(cambridgeListeningTests).find(k => {
          const t = cambridgeListeningTests[k];
          return t.title && t.title.toLowerCase().includes("ielts " + book) && t.title.toLowerCase().includes("listening test " + testNum);
        });
        
        if (!foundKey) {
          return res.json(formatResponse({
            text: `Could not find Cambridge IELTS ${book} Listening Test ${testNum} in our local data.`,
            toolExecuted: false
          }));
        }
        
        const test = cambridgeListeningTests[foundKey];
        const existing = await TestContent.findOne({ title: test.title, type: 'practice_task' });
        if (existing) {
          return res.json(formatResponse({
            text: `**${test.title}** already exists in the database!`,
            toolExecuted: false
          }));
        }
        
        const newContent = new TestContent({
          title: test.title,
          type: 'practice_task',
          subType: 'listening',
          difficulty: test.difficulty || 'medium',
          content: {
            parts: test.parts,
            duration: '30 min',
            type: 'Full Listening Test'
          },
          createdBy: req.user.id
        });
        await newContent.save();
        
        return res.json(formatResponse({
          text: `Successfully uploaded **${test.title}** to the database without any errors!`,
          toolExecuted: true
        }));
      }
      
      if (subType === 'reading') {
        const matchingTopics = cambridgeReadingTopics.filter(t => 
          t.title && t.title.toLowerCase().includes("ielts " + book) && t.title.toLowerCase().includes("reading test " + testNum)
        );
        
        if (matchingTopics.length === 0) {
          return res.json(formatResponse({
            text: `Could not find Cambridge IELTS ${book} Reading Test ${testNum} in our local data.`,
            toolExecuted: false
          }));
        }

        const matchingTitles = matchingTopics.map(t => t.title);
        const existingCount = await TestContent.countDocuments({ title: { $in: matchingTitles }, type: 'practice_task' });
        if (existingCount === matchingTopics.length) {
          return res.json(formatResponse({
            text: `Passages for **Cambridge IELTS ${book} Reading Test ${testNum}** already exist in the database!`,
            toolExecuted: false
          }));
        }
        
        let uploadedTitles = [];
        for (const topicData of matchingTopics) {
          const generated = generateReadingContent(topicData);
          await TestContent.deleteMany({ title: topicData.title, type: 'practice_task' });
          
          const newContent = new TestContent({
            title: topicData.title,
            type: 'practice_task',
            subType: 'reading',
            difficulty: topicData.difficulty,
            content: {
              title: topicData.title.split(' Academic ')[0] + " - " + topicData.topic,
              passage: generated.passage,
              questions: generated.questions,
              timeLimit: 20,
              difficulty: topicData.difficulty,
              topic: topicData.topic,
              type: topicData.type
            },
            createdBy: req.user.id
          });
          await newContent.save();
          uploadedTitles.push(topicData.title);
        }
        
        return res.json(formatResponse({
          text: `Successfully uploaded **${matchingTopics.length} passages** for **Cambridge IELTS ${book} Reading Test ${testNum}** to the database without any errors:\n` + uploadedTitles.map(t => `- ${t}`).join('\n'),
          toolExecuted: true
        }));
      }
      
      if (subType === 'writing') {
        const test = cambridgeWritingTests.find(t => 
          t.title && t.title.toLowerCase().includes("ielts " + book) && t.title.toLowerCase().includes("writing test " + testNum)
        );
        
        if (!test) {
          return res.json(formatResponse({
            text: `Could not find Cambridge IELTS ${book} Writing Test ${testNum} in our local data.`,
            toolExecuted: false
          }));
        }

        const existing = await TestContent.findOne({ title: test.title, type: 'practice_task' });
        if (existing) {
          return res.json(formatResponse({
            text: `**${test.title}** already exists in the database!`,
            toolExecuted: false
          }));
        }
        
        const newContent = new TestContent({
          title: test.title,
          type: 'practice_task',
          subType: 'writing',
          difficulty: test.difficulty || 'medium',
          content: test.content,
          createdBy: req.user.id
        });
        await newContent.save();
        
        return res.json(formatResponse({
          text: `Successfully uploaded **${test.title}** to the database without any errors!`,
          toolExecuted: true
        }));
      }
    }

    const { genAI } = require('../config/gemini');
    
    // Tools definition
    const tools = [{
      functionDeclarations: [
        {
          name: 'addTestContent',
          description: 'Add new test content (mock test or practice task) to the database. Generate appropriate content payload based on the user request before calling this.',
          parameters: {
            type: 'OBJECT',
            properties: {
              title: { type: 'STRING', description: 'Title of the content' },
              type: { type: 'STRING', description: 'Type of content: "mock_test" or "practice_task"' },
              subType: { type: 'STRING', description: 'SubType: "reading", "listening", "writing", "speaking", or "full"' },
              difficulty: { type: 'STRING', description: 'Difficulty: "easy", "medium", or "hard"' },
              contentJSON: { type: 'STRING', description: 'Stringified JSON of the actual content payload. MUST be valid JSON.' }
            },
            required: ['title', 'type', 'subType', 'difficulty', 'contentJSON']
          }
        },
        {
          name: 'updateUserRole',
          description: 'Update a user role by email or name (use name if email is unknown).',
          parameters: {
            type: 'OBJECT',
            properties: {
              searchTerm: { type: 'STRING', description: 'User email or exact name' },
              role: { type: 'STRING', description: 'New role: "admin" or "student"' }
            },
            required: ['searchTerm', 'role']
          }
        },
        {
          name: 'getStats',
          description: 'Get platform statistics (total users, active today).',
          parameters: { type: 'OBJECT', properties: {} }
        }
      ]
    }];

    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash', 
      tools,
      systemInstruction: `You are a powerful AI Admin Assistant for an IELTS platform. The user will ask you to create test content (e.g., listening tests, reading passages, mock tests). You MUST ALWAYS invent and generate the requested content payload yourself based on the user's prompt. Do NOT ask the user to provide the JSON or content. If the test requires audio URLs, image URLs, or map URLs, just hallucinate realistic dummy URLs (e.g., 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', 'https://placehold.co/600x400.png'). Your job is to completely generate the content and immediately save it using the addTestContent tool.

When creating content JSON, adhere exactly to these structures:

For Listening Tests:
{
  "parts": [
    {
      "part": 1,
      "title": "Part 1 Title",
      "audioUrl": "dummy_audio_url",
      "imageUrl": "dummy_map_url_if_needed",
      "questions": [
        { "id": "q1", "type": "multipleChoice", "text": "Question 1?", "options": ["A", "B", "C"], "correctAnswer": "A" },
        { "id": "q2", "type": "fillBlank", "text": "The answer is ___", "correctAnswer": "word" }
      ]
    }
  ]
}

For Reading Tests:
{
  "passages": [
    {
      "title": "Passage Title",
      "content": "Full reading passage text...",
      "questions": [
        { "id": "r1", "type": "multipleChoice", "text": "Question?", "options": ["A", "B", "C"], "correctAnswer": "A" },
        { "id": "r2", "type": "trueFalse", "text": "Statement?", "correctAnswer": "True" }
      ]
    }
  ]
}

For Writing/Speaking Tests:
{
  "prompt": "The test prompt or question...",
  "taskType": 2 // (or 1)
}`
    });
    let formattedHistory = history.map(msg => ({
      role: msg.role === 'ai' ? 'model' : 'user',
      parts: [{ text: msg.text }]
    }));

    // Ensure the first message in history is from 'user', as required by Gemini startChat
    while (formattedHistory.length > 0 && formattedHistory[0].role !== 'user') {
      formattedHistory.shift();
    }

    const chat = model.startChat({ history: formattedHistory });

    let result;
    let retries = 3;
    while (retries > 0) {
      try {
        result = await chat.sendMessage(prompt);
        break;
      } catch (err) {
        if (err.message && (err.message.includes('503') || err.message.includes('high demand') || err.message.includes('overloaded'))) {
          retries--;
          if (retries === 0) throw err;
          await new Promise(resolve => setTimeout(resolve, 3000)); // wait 3s before retry
        } else {
          throw err;
        }
      }
    }
    let responseText = result.response.text();
    let functionCalls = result.response.functionCalls && result.response.functionCalls();
    
    // Process function calls if any
    let toolResponses = [];
    if (functionCalls && functionCalls.length > 0) {
      for (const call of functionCalls) {
        let toolResponseData = {};
        try {
          if (call.name === 'addTestContent') {
            const parsedContent = JSON.parse(call.args.contentJSON);
            const newContent = new TestContent({
              title: call.args.title,
              type: call.args.type,
              subType: call.args.subType,
              difficulty: call.args.difficulty,
              content: parsedContent,
              createdBy: req.user.id
            });
            await newContent.save();
            toolResponseData = { success: true, id: newContent._id, message: 'Content created successfully' };
          } else if (call.name === 'updateUserRole') {
            const user = await User.findOne({
              $or: [{ email: call.args.searchTerm }, { name: new RegExp('^' + call.args.searchTerm + '$', 'i') }]
            });
            if (user) {
              user.role = call.args.role;
              await user.save();
              toolResponseData = { success: true, message: `Updated user ${user.name} to ${call.args.role}` };
            } else {
              toolResponseData = { success: false, message: 'User not found' };
            }
          } else if (call.name === 'getStats') {
            const totalUsers = await User.countDocuments();
            const activeToday = await User.countDocuments({ lastActive: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } });
            toolResponseData = { totalUsers, activeToday };
          }
        } catch (err) {
          toolResponseData = { success: false, error: err.message };
        }
        
        toolResponses.push({
          functionResponse: {
            name: call.name,
            response: toolResponseData
          }
        });
      }
      
      // Send tool response back to get final text
      result = await chat.sendMessage(toolResponses);
      responseText = result.response.text();
    }

    res.json(formatResponse({ text: responseText, toolExecuted: toolResponses.length > 0 }));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
