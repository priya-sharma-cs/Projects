const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware');

// Dashboard API
router.get('/dashboard', authenticateToken, (req, res) => {
  try {
    const user = {
      name: "John Doe",
      email: "john@example.com"
    };

    const activeMeetings = [
      { id: "12345", name: "Team Meeting" },
      { id: "67890", name: "Project Discussion" }
    ];

    const recentChats = [
      { message: "Hey everyone, let's start the meeting!" },
      { message: "Don't forget the deadline is tomorrow." }
    ];

    res.json({
      user,
      activeMeetings,
      recentChats
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong!" });
  }
});

module.exports = router;
