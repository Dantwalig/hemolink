const { Router } = require("express");
const healthRoutes = require("./health.routes.js");
const donorRoutes = require("./donor.routes.js");

const router = Router();

router.use("/health", healthRoutes);
router.use("/donors", donorRoutes);

module.exports = router;
