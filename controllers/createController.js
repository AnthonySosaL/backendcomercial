const admin = require("../config/firebaseAdmin");
const fs = require("fs");
const path = require("path");

// Controlador para crear un producto con la ruta de imagen
const createProduct = async (req, res) => {
  const { name, price, stock, status, imagePath } = req.body;

  // Validar que todos los campos estén presentes
  if (!name || price === undefined || stock === undefined || !status || !imagePath) {
    eliminarImagen(imagePath); // Eliminar la imagen si falta algún campo
    return res.status(400).json({ message: "Todos los campos son requeridos, incluido imagePath." });
  }

  // Validar valores negativos
  if (price < 0 || stock < 0) {
    eliminarImagen(imagePath); // Eliminar la imagen si los valores son inválidos
    return res.status(400).json({ message: "El precio y el stock no pueden ser negativos." });
  }

  try {
    // Crear el producto en Firestore
    const productRef = await admin.firestore().collection("products").add({
      name,
      price,
      stock,
      status,
      imagePath,
    });

    res.status(200).json({ message: "Producto creado con éxito.", productId: productRef.id });
  } catch (error) {
    console.error("Error creando producto:", error.message);
    eliminarImagen(imagePath); // Eliminar la imagen si ocurre un error en la creación
    res.status(500).json({ message: "Error creando producto.", error: error.message });
  }
};

// Función para eliminar la imagen del servidor
const eliminarImagen = (imagePath) => {
  try {
    const fullPath = path.join(__dirname, "..", imagePath); // Construir la ruta completa
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath); // Eliminar la imagen si existe
      console.log(`Imagen eliminada: ${imagePath}`);
    } else {
      console.log(`La imagen no existe: ${imagePath}`);
    }
  } catch (error) {
    console.error(`Error al eliminar la imagen ${imagePath}:`, error.message);
  }
};

module.exports = { createProduct };
