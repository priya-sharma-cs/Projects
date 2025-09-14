const express = require("express");
const router = express.Router();
const db = require("../config-db");  // DB configuration

// Route to create a workspace
router.post("/", (req, res) => {
  const { name } = req.body;  // Extract the workspace name from request body
  if (!name) return res.status(400).json({ message: "Name is required" });  // If name is not provided

  // SQL query to insert a new workspace into the database
  const query = "INSERT INTO workspaces (name) VALUES (?)";
  db.query(query, [name], (err, result) => {
    if (err) return res.status(500).json({ message: "DB error" });  // If error occurs during database query
    res.json({ message: "Workspace created", workspaceId: result.insertId });  // Send success response with workspace ID
  });
});

module.exports = router;
