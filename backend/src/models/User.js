const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['student', 'teacher', 'admin'], default: 'student' },
  status: { type: String, enum: ['pending', 'approved', 'declined'], default: 'pending' },
  avatar: { type: String, default: '' },
  ieltsGoal: { type: Number, min: 0, max: 9, default: 7.0 },
  currentBand: { type: Number, min: 0, max: 9, default: 0 },
  streak: { type: Number, default: 0 },
  bestStreak: { type: Number, default: 0 },
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  badges: [{ name: String, icon: String, earnedAt: Date }],
  subscription: { type: String, enum: ['free', 'pro', 'premium'], default: 'free' },
  targetExamDate: { type: Date },
  currentLevel: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'intermediate' },
  lastActive: { type: Date, default: Date.now },
  studyDays: [{ type: Date }],
  isVerified: { type: Boolean, default: false },
  verificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.verificationToken;
  delete obj.resetPasswordToken;
  delete obj.resetPasswordExpires;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
