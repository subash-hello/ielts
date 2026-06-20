const mongoose = require('mongoose');
const User = require('../models/User');
const Pdf = require('../models/Pdf');
const fs = require('fs');
const path = require('path');

const seedAdmin = async () => {
  try {
    const adminEmail = 'admin@ielts.ai';
    const adminExists = await User.findOne({ email: adminEmail });
    if (!adminExists) {
      const admin = new User({
        name: 'IELTS AI Admin',
        email: adminEmail,
        password: 'adminpass123',
        role: 'admin',
        isVerified: true,
        status: 'approved'
      });
      await admin.save();
      console.log('⚡ Admin user seeded successfully: admin@ielts.ai / adminpass123');
    } else {
      await User.updateOne({ email: adminEmail }, { password: '$2a$10$d9a7zsUeZNxy/hAHcv.p5uUmF5NK5/0fjBS0CE9l8bDxnlUtjVHoO' });
      console.log('📦 Admin user already exists: admin@ielts.ai (updated hash)');
    }
  } catch (error) {
    console.error('❌ Error seeding admin user:', error.message);
  }
};

const seedPdfs = async () => {
  try {
    const pdfDir = path.join(__dirname, '../../pdf');
    if (!fs.existsSync(pdfDir)) {
      console.log('📦 No PDF directory found, skipping PDF seed.');
      return;
    }

    const files = fs.readdirSync(pdfDir);
    let addedCount = 0;
    for (const file of files) {
      if (!file.endsWith('.pdf')) continue;
      
      const existing = await Pdf.findOne({ filename: file });
      if (!existing) {
        let category = 'Academics';
        const lowerName = file.toLowerCase();
        if (lowerName.includes('general')) category = 'General';
        
        let title = file.replace('.pdf', '').trim();
        const pdf = new Pdf({ title, filename: file, category });
        await pdf.save();
        addedCount++;
      }
    }
    
    if (addedCount > 0) {
      console.log(`📦 Seeded ${addedCount} PDFs from filesystem successfully!`);
    } else {
      console.log('📦 All PDFs are already seeded.');
    }
  } catch (error) {
    console.error('❌ Error seeding PDFs:', error.message);
  }
};

const fixTestImages = async () => {
  try {
    const TestContent = require('../models/TestContent');
    const newWritingTests = [
      {
        title: "Cambridge IELTS 15 Academic Writing Test 1",
        type: "practice_task",
        subType: "writing",
        content: {
          parts: [
            {
              title: "Writing Task 1",
              instruction: "You should spend about 20 minutes on this task.",
              imageUrl: "https://subash-2064-ielts-backend.hf.space/images/coffee_tea.png",
              text: "The chart below shows the results of a survey about people's coffee and tea buying and drinking habits in five Australian cities.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.",
              questions: [
                {
                  id: "w1_1",
                  type: "longText",
                  text: "Write your answer for Task 1 here.",
                  correctAnswer: ""
                }
              ]
            },
            {
              title: "Writing Task 2",
              instruction: "You should spend about 40 minutes on this task.",
              text: "In some countries, owning a home rather than renting one is very important for people.\n\nWhy might this be the case?\n\nDo you think this is a positive or negative situation?\n\nGive reasons for your answer and include any relevant examples from your own knowledge or experience.\n\nWrite at least 250 words.",
              questions: [
                {
                  id: "w1_2",
                  type: "longText",
                  text: "Write your answer for Task 2 here.",
                  correctAnswer: ""
                }
              ]
            }
          ]
        }
      },
      {
        title: "Cambridge IELTS 16 Academic Writing Test 1",
        type: "practice_task",
        subType: "writing",
        content: {
          parts: [
            {
              title: "Writing Task 1",
              instruction: "You should spend about 20 minutes on this task.",
              imageUrl: "https://subash-2064-ielts-backend.hf.space/images/tourist.png",
              text: "The graph below shows the number of tourists visiting a particular Caribbean island between 2010 and 2017.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.",
              questions: [
                {
                  id: "w2_1",
                  type: "longText",
                  text: "Write your answer for Task 1 here.",
                  correctAnswer: ""
                }
              ]
            },
            {
              title: "Writing Task 2",
              instruction: "You should spend about 40 minutes on this task.",
              text: "Many manufactured food and drink products contain high levels of sugar, which causes many health problems. Sugary products should be made more expensive to encourage people to consume less sugar.\n\nDo you agree or disagree?\n\nGive reasons for your answer and include any relevant examples from your own knowledge or experience.\n\nWrite at least 250 words.",
              questions: [
                {
                  id: "w2_2",
                  type: "longText",
                  text: "Write your answer for Task 2 here.",
                  correctAnswer: ""
                }
              ]
            }
          ]
        }
      },
      {
        title: "Cambridge IELTS 14 Academic Writing Test 2",
        type: "practice_task",
        subType: "writing",
        content: {
          parts: [
            {
              title: "Writing Task 1",
              instruction: "You should spend about 20 minutes on this task.",
              imageUrl: "https://subash-2064-ielts-backend.hf.space/images/geothermal.png",
              text: "The diagram below shows how geothermal energy is used to produce electricity.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.",
              questions: [
                {
                  id: "w3_1",
                  type: "longText",
                  text: "Write your answer for Task 1 here.",
                  correctAnswer: ""
                }
              ]
            },
            {
              title: "Writing Task 2",
              instruction: "You should spend about 40 minutes on this task.",
              text: "Some people say that the main environmental problem of our time is the loss of particular species of plants and animals. Others say that there are more important environmental problems.\n\nDiscuss both these views and give your own opinion.\n\nGive reasons for your answer and include any relevant examples from your own knowledge or experience.\n\nWrite at least 250 words.",
              questions: [
                {
                  id: "w3_2",
                  type: "longText",
                  text: "Write your answer for Task 2 here.",
                  correctAnswer: ""
                }
              ]
            }
          ]
        }
      }
    ];

    const currentCount = await TestContent.countDocuments({ subType: 'writing' });
    if (currentCount !== 3) {
      await TestContent.deleteMany({ subType: 'writing' });
      await TestContent.insertMany(newWritingTests);
      console.log('Re-seeded writing tests with clean images!');
    } else {
      console.log('Writing tests already fixed!');
    }
  } catch (e) { console.error('Image fix error', e); }
};

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ielts-ai', {
      serverSelectionTimeoutMS: 5000, // Reduced to fail fast
      socketTimeoutMS: 45000,
    });
    console.log(`📦 MongoDB Connected: ${conn.connection.host}`);
    await seedAdmin();
    await seedPdfs();
    await fixTestImages();
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.log('⚠️ Falling back to a local in-memory database so the app can still run...');
    try {
      // const { MongoMemoryServer } = require('mongodb-memory-server');
      throw new Error('MongoMemoryServer removed');
      const mongoUri = mongoServer.getUri();
      await mongoose.connect(mongoUri);
      console.log(`📦 In-Memory MongoDB Connected! (Mock mode active)`);
      await seedAdmin();
      await seedPdfs();
      // const { seedDatabaseIfEmpty } = require('../utils/seeder');
      // await seedDatabaseIfEmpty();
    } catch (memError) {
      console.error('❌ Failed to start in-memory database:', memError.message);
      if (process.env.NODE_ENV === 'production') {
        // process.exit(1); console.error('Disabled exit to debug HF hanging');
      }
    }
  }
};

module.exports = connectDB;

