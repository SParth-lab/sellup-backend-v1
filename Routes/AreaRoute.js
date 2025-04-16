const { Router } = require('express');
// const VerifyToken = require('../Helper/VerifyToken.js');
const router = Router();
const { getArea } = require('../Controllers/Area.js');

// VerifyToken
router.get("/getArea", getArea.controller);

module.exports = router;