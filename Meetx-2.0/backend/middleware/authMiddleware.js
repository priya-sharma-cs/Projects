const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const token = req.header("Authorization");

  console.log("Received token:", token);  // Log token on the server side for debugging

  if (!token) return res.status(401).json({ message: "Access denied" });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    req.user = user;  // Store the user details in the request object
    next();
  });
};

module.exports = authenticateToken;
