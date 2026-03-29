// Central error handler — must have 4 params so Express recognises it as error middleware
const errorHandler = (err, req, res, next) => { // eslint-disable-line no-unused-vars
  console.error("[ERROR]", err.stack || err.message);

  // Prisma known-request errors (e.g. unique constraint, not found)
  if (err.code && err.code.startsWith("P")) {
    if (err.code === "P2002") {
      return res.status(409).json({ success: false, message: "A record with that value already exists." });
    }
    if (err.code === "P2025") {
      return res.status(404).json({ success: false, message: "Record not found." });
    }
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({ success: false, message: "Invalid token." });
  }
  if (err.name === "TokenExpiredError") {
    return res.status(401).json({ success: false, message: "Token expired. Please log in again." });
  }

  // CORS error
  if (err.message && err.message.startsWith("CORS:")) {
    return res.status(403).json({ success: false, message: err.message });
  }

  const status  = err.statusCode || err.status || 500;
  const message = process.env.NODE_ENV === "production"
    ? "An internal server error occurred."
    : (err.message || "Unknown error");

  res.status(status).json({ success: false, message });
};

module.exports = errorHandler;
