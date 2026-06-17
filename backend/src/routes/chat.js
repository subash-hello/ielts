const express = require('express');
const { auth } = require('../middleware/auth');
const User = require('../models/User');
const ChatGroup = require('../models/ChatGroup');
const Message = require('../models/Message');

const router = express.Router();

// Get all users to chat with (exclude self)
router.get('/users', auth, async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } }).select('name email avatar status role');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get user's groups
router.get('/groups', auth, async (req, res) => {
  try {
    const groups = await ChatGroup.find({ members: req.user._id }).populate('members', 'name email').sort('-createdAt');
    res.json(groups);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new group
router.post('/group', auth, async (req, res) => {
  try {
    const { name, members } = req.body;
    if (!name || !members || !Array.isArray(members)) {
      return res.status(400).json({ error: 'Name and members array are required' });
    }
    
    // Ensure the creator is in the members list
    if (!members.includes(req.user._id.toString())) {
      members.push(req.user._id.toString());
    }

    const group = new ChatGroup({
      name,
      admin: req.user._id,
      members
    });

    await group.save();
    
    // Populate members for response
    await group.populate('members', 'name email');
    res.status(201).json(group);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get messages for a direct chat or group
router.get('/messages/:type/:id', auth, async (req, res) => {
  try {
    const { type, id } = req.params;
    let messages = [];

    if (type === 'direct') {
      // Find messages where sender is me and recipient is id, OR sender is id and recipient is me
      messages = await Message.find({
        $or: [
          { sender: req.user._id, recipient: id },
          { sender: id, recipient: req.user._id }
        ]
      }).populate('sender', 'name').sort('createdAt');
    } else if (type === 'group') {
      // Ensure user is in group
      const group = await ChatGroup.findById(id);
      if (!group || !group.members.includes(req.user._id)) {
        return res.status(403).json({ error: 'Access denied' });
      }
      
      messages = await Message.find({ group: id }).populate('sender', 'name').sort('createdAt');
    } else {
      return res.status(400).json({ error: 'Invalid type' });
    }

    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
