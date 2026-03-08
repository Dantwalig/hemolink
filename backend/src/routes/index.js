const { Router } = require("express");
const healthRoutes = require("./health.routes.js");
const donorRoutes = require("./donor.routes.js");
const hospitalRoutes = require("./hospital.routes.js");
const requestRoutes = require("./request.routes.js");

const router = Router();

router.use("/health", healthRoutes);
router.use("/donors", donorRoutes);
router.use("/hospitals", hospitalRoutes);
router.use("/requests", requestRoutes);

module.exports = router;
