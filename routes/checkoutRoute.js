const express = require("express");
const router = express.Router();
const { createCheckoutSession, verifySession, actualizarEstadoPedido, getUserOrders } = require("../controllers/checkoutController");

// Crear una sesión de Stripe Checkout
router.post("/create-checkout-session", createCheckoutSession);

// Verificar sesión después del éxito
router.get("/verify-session", verifySession);

// Actualizar el estado de un pedido
router.put("/update-order-status/:orderId", actualizarEstadoPedido);

// Obtener pedidos de un usuario específico
router.get("/user-orders/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const orders = await getUserOrders(userId);
    res.json({ success: true, orders });
  } catch (error) {
    console.error("Error obteniendo pedidos del usuario:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
