const jwt = require("jsonwebtoken");
const Student = require("../models/Student");

const getJwtSecret = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }
  return process.env.JWT_SECRET;
};

const authenticateToken = async (req, res, next) => {
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
    const decoded = jwt.verify(token, getJwtSecret());
    req.user = decoded;

    // Refresh live role from DB so role changes reflect immediately
    if (decoded.id) {
      try {
        const student = await Student.findById(decoded.id).select("role");
        if (student && student.role) {
          req.user.role = student.role;
        }
      } catch (_err) {
        // fallback to token role
      }
    }

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
