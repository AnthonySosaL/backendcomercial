// backend/controllers/createUserController.js
const admin = require("../config/firebaseAdmin");

// backend/controllers/createUserController.js
async function createUser(req, res) {
  console.log("llegaste");
  try {
    const { email, password } = req.body;
    
    // Validación mejorada
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        error: "Datos incompletos",
        message: "Se requieren email y password" 
      });
    }

    const userRecord = await admin.auth().createUser({ email, password });
    await admin.auth().setCustomUserClaims(userRecord.uid, { role: "user" });

    return res.status(201).json({
      success: true,
      message: "Usuario creado con rol USER",
      data: {
        uid: userRecord.uid,
        email: userRecord.email
      }
    });
    
  } catch (error) {
    console.error("Error en createUser:", error); // Log para debugging
    
    // Manejo específico de errores de Firebase
    let errorMessage = "Error al crear usuario";
    if (error.code === 'auth/email-already-exists') {
      errorMessage = "El email ya está registrado";
    } else if (error.code === 'auth/invalid-password') {
      errorMessage = "La contraseña debe tener al menos 6 caracteres";
    }

    return res.status(400).json({
      success: false,
      error: errorMessage,
      code: error.code || 'unknown_error',
      detail: error.message
    });
  }
}

module.exports = { createUser };
