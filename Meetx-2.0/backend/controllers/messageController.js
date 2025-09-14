const db = require("../config-db"); // Database connection

// Send Message
const sendMessage = (req, res) => {
  const { receiverId, message } = req.body;
  const senderId = req.user.id; // JWT token se user id mil rahi

  if (!receiverId || !message) {
    return res.status(400).json({ message: "Receiver and message are required." });
  }

  const sql = "INSERT INTO messages (sender_id, receiver_id, message) VALUES (?, ?, ?)";
  db.query(sql, [senderId, receiverId, message], (err, result) => {
    if (err) {
      console.error("Error sending message:", err);
      return res.status(500).json({ message: "Database error." });
    }
    res.status(200).json({ message: "Message sent successfully!" });
  });
};

// Get Messages
const getMessages = (req, res) => {
  const senderId = req.user.id;
  const receiverId = req.params.receiverId;

  const sql = `
    SELECT * FROM messages 
    WHERE (sender_id = ? AND receiver_id = ?) 
       OR (sender_id = ? AND receiver_id = ?)
    ORDER BY timestamp ASC
  `;

  db.query(sql, [senderId, receiverId, receiverId, senderId], (err, results) => {
    if (err) {
      console.error("Error fetching messages:", err);
      return res.status(500).json({ message: "Database error." });
    }
    res.status(200).json(results);
  });
};

module.exports = { sendMessage, getMessages };
