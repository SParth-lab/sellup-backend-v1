const { Router } = require('express');
const { sendNotification } = require('../Controllers/NotificationController.js');
const router = Router();


router.post("/send-notification", sendNotification.controller);

module.exports = router;