const { Router } = require('express');
const { sendNotification } = require('../Controllers/NotificationController.js');
const router = Router();


router.post("/send-notification", sendNotification.validator, sendNotification.controller);

module.exports = router;