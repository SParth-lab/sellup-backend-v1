const { Router } = require('express');
const { createCategory, getCategories } = require('../Controllers/CategoryController.js');
const VerifyToken = require('../Helper/VerifyToken.js');
const router = Router();


router.post("/create", createCategory.validator, createCategory.controller);

router.get("/get", VerifyToken, getCategories.controller);

module.exports = router;