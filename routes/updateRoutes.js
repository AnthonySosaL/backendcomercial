const express = require("express");
const { updateProductInformation } = require("../controllers/updateController");
const router = express.Router();

// Ruta para actualizar la información de un producto
router.put("/updateinformation", updateProductInformation);

module.exports = router;
