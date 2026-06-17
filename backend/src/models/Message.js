const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    required: true,
    trim: true
  },
  // If it's a direct message, recipient is populated
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  // If it's a group message, group is populated
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChatGroup'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Message', messageSchema);
