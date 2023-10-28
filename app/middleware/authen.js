const jwt = require("jsonwebtoken");
const dotenv = require("dotenv").config();

exports.verifyToken = (req, res, next) => {
  // Get the token from the request headers
  const token = req.headers.authorization;
  const secret = process.env.SECRET_CODE;

  // Check if token exists
  if (!token) {
    return res.status(401).json({
      status: "401",
      success: false,
      message: "Unauthorized: Token is missing.",
    });
  }

  // Verify the token
  jwt.verify(token, secret, (err, decoded) => {
    if (err) {
      return res.status(403).json({
        status: "403",
        success: false,
        message: "Forbidden: Invalid token.",
      });
    }

    // If the token is valid, store the decoded user information in the request object
    req.user = decoded;

    // Continue to the next middleware or route handler
    next();
  });
};
