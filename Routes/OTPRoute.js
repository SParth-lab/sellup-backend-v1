const { Router } = require('express');
const { viaWhatsapp, verifyOTP } = require('../Controllers/OTPController.js');
const verifyToken  = require('../Helper/VerifyToken.js');
const router = Router();


router.post("/send-otp", verifyToken, viaWhatsapp.validator, viaWhatsapp.controller);

router.post("/verify-otp", verifyOTP.validator, verifyOTP.controller);

module.exports = router;