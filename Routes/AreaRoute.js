const { Router } = require('express');
const VerifyToken = require('../Helper/VerifyToken.js');
const router = Router();
const { getArea } = require('../Controllers/Area.js');


router.get("/getArea", VerifyToken, getArea.controller);

module.exports = router;