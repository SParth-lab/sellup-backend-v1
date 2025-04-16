const { Router } = require('express');
const { createCategory, getCategories } = require('../Controllers/CategoryController.js');
const VerifyToken = require('../Helper/VerifyToken.js');
const router = Router();


router.post("/create", createCategory.validator, createCategory.controller);

// VerifyToken
router.get("/get", getCategories.controller);

module.exports = router;