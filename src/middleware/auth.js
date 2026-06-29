const jwt = require('jsonwebtoken');
const User = require('../models/User');
const mongoose = require('mongoose');

const auth = async (req, res, next) => {
  try {
    // RESILIENCE LAYER: Fallback to Sandbox Mode if database is disconnected/offline
    if (mongoose.connection.readyState !== 1) {
      req.user = {
        _id: '507f1f77bcf86cd799439011',
        name: 'IELTS AI Admin',
        email: 'admin@ielts.ai',
        role: 'admin',
        xp: 15000,
        level: 15,
        ieltsGoal: 9.0
      };
      req.token = 'sandbox-token';
      return next();
    }

    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-for-demo');
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    req.user = user;
    req.token = token;
    
    // Update lastActive timestamp in background
    user.lastActive = new Date();
    user.save().catch(err => console.error('Error saving lastActive:', err.message));
    
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

const adminAuth = async (req, res, next) => {
  try {
    // RESILIENCE LAYER: Bypass DB check if database is disconnected
    if (mongoose.connection.readyState !== 1) {
      req.user = {
        _id: '507f1f77bcf86cd799439011',
        name: 'IELTS AI Admin',
        email: 'admin@ielts.ai',
        role: 'admin',
        xp: 15000,
        level: 15,
        ieltsGoal: 9.0
      };
      req.token = 'sandbox-token';
      return next();
    }

    await auth(req, res, () => {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }
      next();
    });
  } catch (error) {
    res.status(403).json({ error: 'Access denied' });
  }
};

module.exports = { auth, adminAuth };

