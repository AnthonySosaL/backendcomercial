const admin = require("../config/firebaseAdmin");

// Controlador para actualizar la información del producto
const updateProductInformation = async (req, res) => {
  const { productId, name, price, stock, status } = req.body;

  // Validar que los datos requeridos están presentes
  if (!productId || !name || price === undefined || stock === undefined || !status) {
    return res.status(400).json({ message: "Todos los campos son requeridos." });
  }

  // Validar valores negativos
  if (price < 0 || stock < 0) {
    return res.status(400).json({ message: "El precio y el stock no pueden ser negativos." });
  }

  try {
    // Referencia al producto en Firestore
    const productRef = admin.firestore().collection("products").doc(productId);
    const productSnap = await productRef.get();

    // Verificar si el producto existe
    if (!productSnap.exists) {
      return res.status(404).json({ message: "Producto no encontrado." });
    }

    // Actualizar los datos del producto
    await productRef.update({ name, price, stock, status });

    res.status(200).json({ message: "Producto actualizado con éxito." });
  } catch (error) {
    console.error("Error actualizando producto:", error.message);
    res.status(500).json({ message: "Error al actualizar producto.", error: error.message });
  }
};

module.exports = { updateProductInformation };
