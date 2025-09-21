const { Router } = require('express');
const { addBanner, editBanner, getBanners, deleteBanner } = require('../Controllers/BannerController.js');
const verifyAdminToken = require('../Helper/VerifyAdminToken.js');

const router = Router();

// Admin only routes - require authentication
router.post("/add", verifyAdminToken, addBanner.validator, addBanner.controller);
router.put("/:bannerId", verifyAdminToken, editBanner.validator, editBanner.controller);
router.delete("/:bannerId", verifyAdminToken, deleteBanner.validator, deleteBanner.controller);

// Public route - no authentication required
router.get("/get", getBanners.validator, getBanners.controller);

module.exports = router;
