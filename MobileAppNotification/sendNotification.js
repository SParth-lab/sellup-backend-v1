const admin = require("../firebase/firebase");

const sendToTopic = async () => {
    const message = {
        notification: {
            title: "🎉 New Item for Rent! Hello Testing",
            body: "Check out the latest additions on Rentel now!",
        },
        data: {
            click_action: "FLUTTER_NOTIFICATION_CLICK",
            productId: "682df6632e20e6beb64e30ac",
            userId: "676728aac3ef60d554d5ee73"
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

