// backend/routes/cartRoutes.js
const express = require("express");
const router = express.Router();
const { addToCart, removeFromCart,clearCart,updateCart  } = require("../controllers/cartController");

// Agregar un producto al carrito
router.post("/cart/add", addToCart);

// Eliminar un producto del carrito
router.post("/cart/remove", removeFromCart);
router.post("/cart/clear", clearCart);

// Actualizar la cantidad de un producto en el carrito
router.post("/cart/update", updateCart);

module.exports = router;
