const sendToTopic = require("../MobileAppNotification/sendNotification");

const sendNotification = {
    validator: async (req, res, next) => {
        const { title, body } = req.body;
        if (!title || !body) return res.status(400).json({ message: "Title and body are required" });
        next();
    },
    controller: async (req, res) => {
        const { topic = "allUsers", title, body, data = {} } = req.body;
        sendToTopic(
            topic,
            title,
            body,
            data
        );
        return res.status(200).json({ message: "Notification sent successfully" });
    }
}

module.exports = { sendNotification };