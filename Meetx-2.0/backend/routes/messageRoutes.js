const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware');

const { sendMessage, getMessages } = require('../controllers/messageController');

// Send a new message
router.post('/send', authenticateToken, sendMessage);

// Get all messages between logged-in user and another user
router.get('/messages/:receiverId', authenticateToken, getMessages);

module.exports = router;
