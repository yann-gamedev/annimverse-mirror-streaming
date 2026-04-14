const jwt = require("jsonwebtoken");

// Middleware to protect routes
exports.protect = async (req, res, next) => {
  // Check for token in Header (Authorization: Bearer <token>)
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      const token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach user data to request
      req.user = decoded;

      return next();
    } catch (error) {
      console.error("Auth middleware error:", error.message);
      return res
        .status(401)
        .json({ message: "Sesi habis, silakan login ulang." });
    }
  } else {
    return res.status(401).json({ message: "Akses ditolak, tidak ada token." });
  }
};
