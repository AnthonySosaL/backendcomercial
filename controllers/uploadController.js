const multer = require("multer");
const path = require("path");
const fs = require("fs");
const admin = require("../config/firebaseAdmin"); // Configuración de Firebase Admin SDK

// Configuración de multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/images"); // Carpeta donde se guardarán las imágenes
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== ".png" && ext !== ".jpg" && ext !== ".jpeg") {
      return cb(new Error("Solo se permiten archivos de imagen (PNG, JPG, JPEG)"));
    }
    cb(null, true);
  },
});

// Subir imagen (para crear producto)
const uploadImage = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No se subió ningún archivo" });
  }

  const imagePath = `/uploads/images/${req.file.filename}`;
  res.status(200).json({ imagePath }); // Retorna la ruta de la imagen
};

// Actualizar solo la imagen (para un producto existente)
const updateImage = async (req, res) => {
  const { productId } = req.body; // El ID del producto se envía en el body
  if (!productId) {
    return res.status(400).json({ message: "Falta el ID del producto" });
  }

  if (!req.file) {
    return res.status(400).json({ message: "No se subió ninguna imagen" });
  }

  try {
    // Referencia al producto en Firestore
    const productRef = admin.firestore().collection("products").doc(productId);
    const productSnap = await productRef.get();

    if (!productSnap.exists) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    const productData = productSnap.data();

    // Eliminar la imagen anterior del servidor, si existe
    if (productData.imagePath) {
      const oldImagePath = path.join(__dirname, "..", productData.imagePath);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    // Guardar la nueva imagen
    const newImagePath = `/uploads/images/${req.file.filename}`;
    await productRef.update({ imagePath: newImagePath });

    res.status(200).json({ message: "Imagen actualizada con éxito", imagePath: newImagePath });
  } catch (error) {
    console.error("Error actualizando imagen:", error.message);
    res.status(500).json({ message: "Error actualizando imagen", error: error.message });
  }
};

module.exports = { upload, uploadImage, updateImage };
