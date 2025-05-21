// sendNotification.js
const admin = require("../firebase/firebase");

// sendToTopic.js
// const admin = require("./firebase"); // your Firebase Admin SDK init

const sendToTopic = async (topicName, title, body, data = {}) => {
    const message = {
        topic: topicName,
        notification: {
            title,
            body,
        },
        data,
        android: {
            priority: "high",
        },
        apns: {
            payload: {
                aps: {
                    sound: "default",
                    contentAvailable: true,
                },
            },
        },
    };

    try {
        const response = await admin.messaging().send(message);
        console.log("✅ Sent to topic:", response);
    } catch (error) {
        console.error("❌ Error sending to topic:", error);
    }
};

module.exports = sendToTopic;

