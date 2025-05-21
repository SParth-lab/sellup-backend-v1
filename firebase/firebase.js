// firebase.js
const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json"); // Path to your downloaded JSON

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
