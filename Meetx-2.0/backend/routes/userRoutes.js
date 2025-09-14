const express = require("express");
const router = express.Router();
const { getAllUsers } = require('../controllers/userController');
const authenticateToken = require("../middleware/authMiddleware"); // authentication middleware
const db = require("../config-db"); // database connection

// Route to get all users (with token authentication)
router.get('/users', authenticateToken, getAllUsers);

// Route to get current logged-in user profile
router.get("/profile", authenticateToken, (req, res) => {
  const userId = req.user.id;

  const sql = "SELECT id, name, email FROM users WHERE id = ?";
  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Server error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = results[0];
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
    });
  });
});

module.exports = router;
