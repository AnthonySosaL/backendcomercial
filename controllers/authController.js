// backend/controllers/authController.js
const admin = require("../config/firebaseAdmin");

async function verifyRole(req, res) {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ error: "No se recibió token" });
    }

    // Verificar token con Admin SDK
    const decoded = await admin.auth().verifyIdToken(token);
    // Extraer la custom claim (ej: decoded.role)
    const userRole = decoded.role || "noRoleFound";

    return res.json({
      message: "Token válido",
      uid: decoded.uid,
      email: decoded.email,
      role: userRole
    });
  } catch (error) {
    return res.status(401).json({
      error: "Token inválido",
      detail: error.message
    });
  }
}

module.exports = {
  verifyRole
};
