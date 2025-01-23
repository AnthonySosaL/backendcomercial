// backend/controllers/createSampleDataController.js
const admin = require("../config/firebaseAdmin");

/**
 * Crea datos de muestra:
 * 1) Crea algunos usuarios en Firebase Auth con roles distintos.
 * 2) Crea algunos productos en Firestore.
 * 
 * Solo accesible si el solicitante es admin.
 */
async function createSampleData(req, res) {
  try {
    // 1) Verificar que quien hace la petición es admin
    //    Necesitamos un token en headers o en req.body.
    const authorization = req.headers.authorization || "";
    if (!authorization.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided" });
    }
    const token = authorization.split("Bearer ")[1];
    const decoded = await admin.auth().verifyIdToken(token);
    if (decoded.role !== "admin") {
      return res.status(403).json({ error: "No eres admin" });
    }

    // 2) Crear usuarios de ejemplo en Firebase Auth
    //    NOTA: Si ya existen, te dará error al intentar crearlos. Podrías ignorarlo
    //    o usar updateUser. Aquí lo hago de ejemplo "forzando" la creación.
    const sampleUsers = [
      { email: "user_demo1@example.com", password: "123456", role: "user" },
      { email: "user_demo2@example.com", password: "123456", role: "user" }
    ];

    const createdUsers = [];

    for (const u of sampleUsers) {
      try {
        const userRecord = await admin.auth().createUser({
          email: u.email,
          password: u.password
        });
        // Asignar custom claims
        await admin.auth().setCustomUserClaims(userRecord.uid, { role: u.role });

        createdUsers.push({
          email: u.email,
          role: u.role,
          uid: userRecord.uid
        });
      } catch (err) {
        // Si el usuario ya existe, puedes manejarlo
        createdUsers.push({
          email: u.email,
          error: err.message
        });
      }
    }

    // 3) Crear productos de ejemplo en Firestore
    const productsRef = admin.firestore().collection("products");

    // Ejemplo de productos
    const sampleProducts = [
      { name: "Vape sabor mango", price: 100, stock: 50 },
      { name: "Vape sabor fresa", price: 120, stock: 40 },
      { name: "Vape sabor menta", price: 90,  stock: 60 }
    ];

    const createdProducts = [];
    for (const p of sampleProducts) {
      const docRef = await productsRef.add(p);
      createdProducts.push({ id: docRef.id, ...p });
    }

    // 4) Responder con un resumen
    return res.json({
      message: "Datos de ejemplo creados (usuarios + productos).",
      createdUsers,
      createdProducts
    });
  } catch (error) {
    return res.status(500).json({
      error: "Error creando datos de ejemplo",
      detail: error.message
    });
  }
}

module.exports = { createSampleData };
