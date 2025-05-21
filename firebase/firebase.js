// firebase.js
const admin = require("firebase-admin");

admin.initializeApp({
    credential: admin.credential.cert(),
});

module.exports = admin;
