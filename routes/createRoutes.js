const express = require("express");
const { createProduct } = require("../controllers/createController");
const router = express.Router();

// Ruta para crear un producto
router.post("/createProduct", createProduct);

module.exports = router;
