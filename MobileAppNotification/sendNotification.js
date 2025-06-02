const admin = require("../firebase/firebase");

const sendToTopic = async ({productId, userId}) => {
    const message = {
        notification: {
            title: "🎉 New Item for Rent! Hello Testing",
            body: "Check out the latest additions on Rentel now!",
        },
        data: {
            click_action: "FLUTTER_NOTIFICATION_CLICK",
            productId: productId,
            userId: userId
        },
        topic: "allUsers", // must match Flutter topic
    };
    admin
        .messaging()
        .send(message)
        .then((response) => {
            console.log("✅ Notification sent successfully:", response);
            return true;
        })
        .catch((error) => {
            console.error("❌ Error sending notification:", error);
        });
};

module.exports = sendToTopic;

