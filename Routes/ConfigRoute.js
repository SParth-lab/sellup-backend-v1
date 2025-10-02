const { Router } = require('express');
const { addOrUpdateConfig, removeConfig, getConfig, updateConfigStatus, setCategoryOrder, getCategoryOrder, updateCategoryOrder } = require('../Controllers/ConfigController.js');
const verifyAdminToken = require('../Helper/VerifyAdminToken.js');

const router = Router();

// Admin only routes - require authentication
router.post("/add-or-update", verifyAdminToken, addOrUpdateConfig.validator, addOrUpdateConfig.controller);
router.delete("/remove", verifyAdminToken, removeConfig.validator, removeConfig.controller);
router.patch("/status", verifyAdminToken, updateConfigStatus.validator, updateConfigStatus.controller);

// Category ordering routes - Admin only
router.post("/category-order/set", verifyAdminToken, setCategoryOrder.validator, setCategoryOrder.controller);
router.patch("/category-order/update", verifyAdminToken, updateCategoryOrder.validator, updateCategoryOrder.controller);

// Public route - no authentication required
router.get("/get", getConfig.validator, getConfig.controller);
router.get("/category-order/get", getCategoryOrder.validator, getCategoryOrder.controller);

module.exports = router;
