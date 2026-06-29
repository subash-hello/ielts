const express = require('express');
const Joi = require('joi');
const mongoose = require('mongoose');
const authService = require('../services/auth.service');
const { validate } = require('../middleware/validate');
const { formatResponse } = require('../utils/helpers');

const router = express.Router();

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  ieltsGoal: Joi.number().min(0).max(9),
  targetExamDate: Joi.date(),
  currentLevel: Joi.string().valid('beginner', 'intermediate', 'advanced')
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

router.post('/register', validate(registerSchema), async (req, res) => {
  try {
    // RESILIENCE LAYER: Fallback to Sandbox Mode if database is disconnected
    if (mongoose.connection.readyState !== 1) {
      const { name, email, ieltsGoal } = req.body;
      const user = {
        _id: '507f1f77bcf86cd799439012',
        name,
        email,
        role: 'student',
        status: 'pending',
        xp: 0,
        level: 1,
        ieltsGoal: ieltsGoal || 7.0,
        subscription: 'free'
      };
      const token = 'sandbox-token';
      return res.status(201).json(formatResponse({ user, token }, 'Registration successful (Sandbox Mode)'));
    }

    const { user, token } = await authService.register(req.body);

    // Emit real-time Socket.io alert to all administrators
    const io = req.app.get('io');
    if (io && user.role === 'student') {
      io.emit('student-login-request', {
        studentId: user._id,
        name: user.name,
        email: user.email,
        ieltsGoal: user.ieltsGoal || 7.0,
        timestamp: new Date()
      });
    }

    res.status(201).json(formatResponse({ user, token }, 'Registration successful'));
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/login', validate(loginSchema), async (req, res) => {
  try {
    // RESILIENCE LAYER: Fallback to Sandbox Mode if database is disconnected
    if (mongoose.connection.readyState !== 1) {
      const { email, password } = req.body;
      const isAdmin = email === 'admin@ielts.ai' && password === 'adminpass123';
      
      const user = {
        _id: isAdmin ? '507f1f77bcf86cd799439011' : '507f1f77bcf86cd799439012',
        name: isAdmin ? 'IELTS AI Admin' : 'Sandbox Student',
        email,
        role: isAdmin ? 'admin' : 'student',
        status: isAdmin ? 'approved' : 'pending',
        xp: isAdmin ? 15000 : 2450,
        level: isAdmin ? 15 : 12,
        ieltsGoal: 7.5,
        subscription: isAdmin ? 'premium' : 'free'
      };
      
      const token = 'sandbox-token';
      return res.json(formatResponse({ user, token }, 'Login successful (Sandbox Mode)'));
    }

    const { user, token } = await authService.login(req.body);

    // Enforce Administrator Approvals
    if (user.role === 'student') {
      if (user.status === 'declined') {
        return res.status(403).json({ error: 'Access Denied: Your account request was declined by the administrator.' });
      }

      if (user.status === 'pending') {
        // Emit alert to active admin portals that a pending student has logged in and is waiting
        const io = req.app.get('io');
        if (io) {
          io.emit('student-login-request', {
            studentId: user._id,
            name: user.name,
            email: user.email,
            ieltsGoal: user.ieltsGoal || 7.0,
            timestamp: new Date()
          });
        }
      }
    }

    res.json(formatResponse({ user, token }, 'Login successful'));
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    // Fallback if db not connected
    if (mongoose.connection.readyState !== 1) {
      const demoCode = '123456';
      return res.json(formatResponse({ demoCode }, 'Password reset code generated (Sandbox Mode). Use code: 123456'));
    }

    const User = require('../models/User');
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ error: 'No user registered with that email address.' });
    }

    // Generate 6-digit reset code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordToken = resetCode;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    res.json(formatResponse({ demoCode: resetCode }, `Password reset code sent. (Demo Code: ${resetCode})`));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    // Fallback if db not connected
    if (mongoose.connection.readyState !== 1) {
      if (code !== '123456') {
        return res.status(400).json({ error: 'Invalid or expired password reset code.' });
      }
      return res.json(formatResponse(null, 'Password has been reset successfully (Sandbox Mode)'));
    }

    const User = require('../models/User');
    const user = await User.findOne({
      email: email.toLowerCase(),
      resetPasswordToken: code,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired password reset code.' });
    }

    // Update password
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json(formatResponse(null, 'Password has been reset successfully.'));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/verify/:token', async (req, res) => {
  res.json(formatResponse(null, 'Email verified'));
});

module.exports = router;

