const express = require("express");
const { upload, uploadImage, updateImage } = require("../controllers/uploadController");

const router = express.Router();

// Ruta para subir imagen al crear producto
router.post("/upload", upload.single("image"), uploadImage);

// Ruta para actualizar solo la imagen de un producto existente
router.put("/updateImage", upload.single("image"), updateImage);

module.exports = router;
