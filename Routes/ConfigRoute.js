const { Router } = require('express');
const { addOrUpdateConfig, removeConfig, getConfig, updateConfigStatus } = require('../Controllers/ConfigController.js');
const verifyAdminToken = require('../Helper/VerifyAdminToken.js');

const router = Router();

// Admin only routes - require authentication
router.post("/add-or-update", verifyAdminToken, addOrUpdateConfig.validator, addOrUpdateConfig.controller);
router.delete("/remove", verifyAdminToken, removeConfig.validator, removeConfig.controller);
router.patch("/status", verifyAdminToken, updateConfigStatus.validator, updateConfigStatus.controller);

// Public route - no authentication required
router.get("/get", getConfig.validator, getConfig.controller);

module.exports = router;
