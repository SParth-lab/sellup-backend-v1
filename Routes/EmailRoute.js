const { Router } = require('express');
const { sendEmail, verifyOTP } = require('../Controllers/EmailController.js');
const router = Router();


router.post("/send-email", sendEmail.validator, sendEmail.controller);

router.post("/verify-otp", verifyOTP.validator, verifyOTP.controller);

module.exports = router;