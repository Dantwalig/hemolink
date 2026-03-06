const { success } = require("../utils/apiResponse");

const healthCheck = (req, res) => {
  success(res, { status: "UP", timestamp: new Date().toISOString() }, "Server is running");
};

module.exports = { healthCheck };
