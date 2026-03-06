const jwt = require("jsonwebtoken");
const { error } = require("../utils/apiResponse");

const authenticate = (req, res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return error(res, "Access denied. No token provided.", 401);
  }

  const token = header.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return error(res, "Invalid or expired token.", 401);
  }
};

// Restrict access by role. Supported roles: "donor", "hospital"
// Usage: authorize("donor") or authorize("hospital") or authorize("donor", "hospital")
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return error(res, "Forbidden. You do not have access to this resource.", 403);
    }
    next();
  };
};

module.exports = { authenticate, authorize };
