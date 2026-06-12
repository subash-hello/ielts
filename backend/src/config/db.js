const mongoose = require('mongoose');
const User = require('../models/User');

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

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ielts-ai', {
      serverSelectionTimeoutMS: 5000, // Reduced to fail fast
      socketTimeoutMS: 45000,
    });
    console.log(`📦 MongoDB Connected: ${conn.connection.host}`);
    await seedAdmin();
    // const { seedDatabaseIfEmpty } = require('../utils/seeder');
    // await seedDatabaseIfEmpty();
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.log('⚠️ Falling back to a local in-memory database so the app can still run...');
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      await mongoose.connect(mongoUri);
      console.log(`📦 In-Memory MongoDB Connected! (Mock mode active)`);
      await seedAdmin();
      // const { seedDatabaseIfEmpty } = require('../utils/seeder');
      // await seedDatabaseIfEmpty();
    } catch (memError) {
      console.error('❌ Failed to start in-memory database:', memError.message);
      if (process.env.NODE_ENV === 'production') {
        process.exit(1);
      }
    }
  }
};

module.exports = connectDB;

