const express = require('express');
const { auth } = require('../middleware/auth');
const Note = require('../models/Note');
const { formatResponse } = require('../utils/helpers');

const router = express.Router();

// Get all notes
router.get('/', auth, async (req, res) => {
  try {
    const notes = await Note.find({ userId: req.user._id }).sort({ lastModified: -1 });
    res.json(formatResponse(notes));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new note
router.post('/', auth, async (req, res) => {
  try {
    const { subject, content } = req.body;
    const note = new Note({
      userId: req.user._id,
      subject: subject || 'Untitled Chapter',
      content: content || '',
      lastModified: new Date()
    });
    await note.save();
    res.json(formatResponse(note));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a note
router.put('/:id', auth, async (req, res) => {
  try {
    const { subject, content } = req.body;
    const note = await Note.findOne({ _id: req.params.id, userId: req.user._id });
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }
    
    if (subject !== undefined) note.subject = subject;
    if (content !== undefined) note.content = content;
    note.lastModified = new Date();
    
    await note.save();
    res.json(formatResponse(note));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a note
router.delete('/:id', auth, async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }
    res.json(formatResponse({ message: 'Note deleted successfully' }));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
