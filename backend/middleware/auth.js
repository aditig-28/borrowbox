const jwt = require("jsonwebtoken");

const getJwtSecret = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }
  return process.env.JWT_SECRET;
};

const authenticateToken = (req, res, next) => {
  const header = req.headers.authorization;
  const token = header && header.startsWith("Bearer ")
    ? header.slice(7)
    : null;

  if (!token) {
    return res.status(401).json({
      message: "No authentication token provided",
    });
  }

  try {
    req.user = jwt.verify(token, getJwtSecret());
    return next();
  } catch (_error) {
    return res.status(401).json({
      message: "Invalid or expired authentication token",
    });
  }
};

const requirePurpose = (purpose) => (req, res, next) => {
  if (req.user.purpose !== purpose) {
    return res.status(403).json({
      message: `A token with purpose '${purpose}' is required`,
    });
  }
  return next();
};

const authorizeRoles = (...allowedRoles) => (req, res, next) => {
  if (req.user.purpose && req.user.purpose !== "access") {
    return res.status(403).json({ message: "Insufficient role permissions" });
  }
  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({
      message: "Insufficient role permissions",
    });
  }
  return next();
};

module.exports = {
  authenticateToken,
  authorizeRoles,
  requirePurpose,
};
