// backend/config/firebaseAdmin.js
const admin = require("firebase-admin");
const serviceAccount = require("./tiendavapes-4458b-firebase-adminsdk-fbsvc-a44e2cbb36.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  // databaseURL: "https://<TU-PROYECTO>.firebaseio.com" // si usas Realtime DB
});

module.exports = admin;
