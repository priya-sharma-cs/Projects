const User = require('../models/userModel');  // User model ko import karo



// controllers/userController.js
const db = require('../config-db'); // Your DB connection setup

exports.getAllUsers = (req, res) => {
  db.query('SELECT * FROM users', (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching users' });
    }
    res.json(results);
  });
};



// User Profile API
const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id; // JWT se user ID le lo
    const user = await User.findById(userId);  // User ke details fetch karo
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      name: user.name,
      email: user.email,
      // Any other fields you want to send
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong!' });
  }
};

module.exports.getUserProfile;
