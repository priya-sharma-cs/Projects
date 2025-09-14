const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authMiddleware");  // jo bhi tera middleware file ka path hai
const { signup, login } = require("../controllers/authController");

router.post("/signup", signup);
router.post("/login", login);



// get-user route
router.get("/get-user", authenticateToken, async (req, res) => {
    try {
      const user = req.user;  // authenticateToken middleware mein set kiya tha
      res.status(200).json({ user });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Server Error" });
    }
  });

module.exports = router;
