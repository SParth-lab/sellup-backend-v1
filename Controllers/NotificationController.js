const sendToTopic = require("../MobileAppNotification/sendNotification");

const sendNotification = {
    controller: async (req, res) => {
        const send  = await sendToTopic();
        return res.status(200).json({ message: "Notification sent successfully" });
    }
}

module.exports = { sendNotification };