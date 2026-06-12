const User = require('../models/User');
const { generateToken } = require('../utils/helpers');

class AuthService {
  async register({ name, email, password, ieltsGoal, targetExamDate, currentLevel }) {
    const existing = await User.findOne({ email });
    if (existing) throw new Error('Email already registered');
    
    const user = new User({ name, email, password, ieltsGoal, targetExamDate, currentLevel });
    await user.save();
    
    const token = generateToken({ id: user._id, role: user.role });
    return { user, token };
  }

  async login({ email, password }) {
    const user = await User.findOne({ email });
    if (!user) throw new Error('Invalid email or password');
    
    const isMatch = await user.comparePassword(password);
    if (!isMatch) throw new Error('Invalid email or password');
    
    user.lastActive = new Date();
    const today = new Date().toDateString();
    const lastStudyDay = user.studyDays.length > 0 ? user.studyDays[user.studyDays.length - 1].toDateString() : null;
    if (lastStudyDay !== today) {
      user.studyDays.push(new Date());
    }
    await user.save();
    
    const token = generateToken({ id: user._id, role: user.role });
    return { user, token };
  }
}

module.exports = new AuthService();
