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
      console.log('📦 Admin user already exists: admin@ielts.ai');
    }
  } catch (error) {
    console.error('❌ Error seeding admin user:', error.message);
  }
};

const seedPdfs = async () => {
  try {
    const pdfDir = fs.existsSync(path.join(__dirname, '../../pdf'))
      ? path.join(__dirname, '../../pdf')
      : path.join(__dirname, '../../../pdf');
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

const updateMismatchedWritingPrompts = async () => {
  try {
    const TestContent = require('../models/TestContent');
    const cambridgeWritingTests = require('../data/cambridgeWritingTests');
    
    let updatedCount = 0;
    for (const test of cambridgeWritingTests) {
      const dbTest = await TestContent.findOne({ title: test.title, type: 'practice_task' });
      if (dbTest && dbTest.content && dbTest.content.parts && test.content && test.content.parts) {
        let changed = false;
        for (let i = 0; i < dbTest.content.parts.length; i++) {
          const dbPart = dbTest.content.parts[i];
          const filePart = test.content.parts[i];
          if (dbPart && filePart && dbPart.text !== filePart.text) {
            dbPart.text = filePart.text;
            changed = true;
          }
        }
        if (changed) {
          dbTest.markModified('content.parts');
          await dbTest.save();
          updatedCount++;
        }
      }
    }
    if (updatedCount > 0) {
      console.log(`✅ Writing prompts migration: Updated ${updatedCount} tasks to match source files.`);
    }
  } catch (err) {
    console.error('❌ Failed to update writing prompts in database:', err.message);
  }
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
    await updateMismatchedWritingPrompts();
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.log('⚠️ Falling back to a local in-memory database so the app can still run...');
    try {
      if (process.env.NODE_ENV === 'production') {
        throw new Error('MongoMemoryServer disabled in production to prevent Docker build hangs');
      }
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      await mongoose.connect(mongoUri);
      console.log(`📦 In-Memory MongoDB Connected! (Mock mode active)`);
      await seedAdmin();
      await seedPdfs();
      await updateMismatchedWritingPrompts();
    } catch (memError) {
      console.error('❌ Failed to start in-memory database:', memError.message);
      if (process.env.NODE_ENV === 'production') {
        console.warn('⚠️ Server running in degraded state (no database connected)');
      }
    }
  }
};

module.exports = connectDB;

