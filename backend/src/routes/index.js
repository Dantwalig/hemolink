const { Router } = require("express");
const healthRoutes = require("./health.routes.js");

const router = Router();

router.use("/health", healthRoutes);

module.exports = router;
