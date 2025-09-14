const db = require("../config-db");  // Assuming you have db.js handling MySQL connection

// Function to find a user by email
const findUserByEmail = (email, callback) => {
  db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
    callback(err, results);
  });
};

// Function to create a new user
const createUser = (name, email, password, callback) => {
  const query = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
  db.query(query, [name, email, password], (err, results) => {
    callback(err, results);
  });
};

module.exports = {
  findUserByEmail,
  createUser
};
