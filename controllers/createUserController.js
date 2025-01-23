// backend/controllers/createUserController.js
const admin = require("../config/firebaseAdmin");

async function createUser(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Falta email o password" });
    }

    // 1. Crear usuario en Firebase Auth
    const userRecord = await admin.auth().createUser({
      email,
      password
    });

    // 2. Asignar custom claim
    await admin.auth().setCustomUserClaims(userRecord.uid, { role: "user" });

    return res.json({
      message: "Usuario creado con rol USER",
      uid: userRecord.uid,
      email: userRecord.email
    });
  } catch (error) {
    return res.status(400).json({
      error: "No se pudo crear user",
      detail: error.message
    });
  }
}

module.exports = { createUser };
