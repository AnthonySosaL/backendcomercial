const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const admin = require("../config/firebaseAdmin");

/**
 * Crear una sesión de Stripe Checkout
 */
async function createCheckoutSession(req, res) {
  try {
    const { items } = req.body;
    const authHeader = req.headers.authorization || "";
    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    const userId = decodedToken.uid;

    if (!items || !Array.isArray(items)) {
      throw new Error("Los elementos enviados no son válidos.");
    }

    const stripeItems = items.map((item) => {
      const { price_data, quantity } = item;

      if (
        !price_data ||
        !price_data.unit_amount ||
        !price_data.product_data ||
        !price_data.product_data.name ||
        isNaN(price_data.unit_amount) ||
        isNaN(quantity)
      ) {
        throw new Error(`Datos inválidos para el item: ${JSON.stringify(item)}`);
      }

      return {
        price_data: {
          currency: price_data.currency,
          product_data: {
            name: price_data.product_data.name,
          },
          unit_amount: parseInt(price_data.unit_amount, 10),
        },
        quantity: parseInt(quantity, 10),
      };
    });

    console.log("Items enviados a Stripe:", stripeItems);

    // Guardar los detalles del carrito en Firestore
    const db = admin.firestore();
    const cartRef = db.collection("sessions").doc();
    await cartRef.set({
      userId,
      items,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Crear sesión de Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: stripeItems,
      mode: "payment",
      success_url: `${process.env.CLIENT_URL}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/cart.html`,
      metadata: {
        sessionId: cartRef.id, // Guardar solo el ID de la sesión
        userId, // Guardar el ID del usuario para referencia
      },
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error("Error creando sesión de Stripe:", error.message);
    res.status(400).json({ error: error.message });
  }
}

/**
 * Verificar la sesión de Stripe después del éxito
 */
async function verifySession(req, res) {
    const sessionId = req.query.session_id;
  
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
  
      // Verificar si el pago es exitoso y el estado es "complete"
      if (session.payment_status === "paid" && session.status === "complete") {
        console.log("Pago exitoso:", session);
  
        const db = admin.firestore();
        const sessionRef = db.collection("sessions").doc(session.metadata.sessionId);
        const sessionDoc = await sessionRef.get();
  
        if (!sessionDoc.exists) {
          throw new Error("La sesión no se encontró en la base de datos.");
        }
  
        const { items, userId } = sessionDoc.data();
        const customerEmail = session.customer_details.email;
  
        // Verificar si la compra ya fue procesada
        const existingOrder = await db
          .collection("orders")
          .where("sessionId", "==", sessionId)
          .get();
  
        if (!existingOrder.empty) {
          console.log("El pedido ya fue procesado previamente.");
          return res.status(200).json({ message: "Pedido ya procesado." });
        }
  
        // Guardar compra en Firestore
        await guardarCompraEnBaseDeDatos(customerEmail, items, sessionId, userId);
  
        // Vaciar carrito
        await clearCartForUser(userId);
  
        return res.json({ success: true });
      } else {
        return res.json({ success: false, error: "El pago no fue exitoso o ya se completó." });
      }
    } catch (error) {
      console.error("Error verificando la sesión:", error.message);
      return res.status(500).json({ success: false, error: error.message });
    }
  }
  
async function actualizarEstadoPedido(orderId, nuevoEstado) {
    const db = admin.firestore();
  
    const orderRef = db.collection("orders").doc(orderId);
  
    await orderRef.update({
      status: nuevoEstado,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  
    console.log(`Estado del pedido ${orderId} actualizado a: ${nuevoEstado}`);
  }

/**
 * Vacía el carrito del usuario en Firestore.
 */
async function clearCartForUser(userId) {
  if (!userId || typeof userId !== "string") {
    throw new Error("El userId proporcionado es inválido.");
  }

  const db = admin.firestore();
  const cartRef = db.collection("carts").doc(userId);

  await db.runTransaction(async (transaction) => {
    const cartDoc = await transaction.get(cartRef);

    if (!cartDoc.exists) {
      console.log("El carrito ya está vacío.");
      return;
    }

    transaction.set(cartRef, { items: [] }); // Vaciar el carrito
  });
}
async function getUserOrders(userId) {
    const db = admin.firestore();
  
    const ordersQuery = db.collection("orders").where("userId", "==", userId);
    const snapshot = await ordersQuery.get();
  
    if (snapshot.empty) {
      console.log("No hay pedidos para este usuario.");
      return [];
    }
  
    return snapshot.docs.map((doc) => doc.data());
  }
  

/**
 * Guarda la compra en Firestore.
 */
async function guardarCompraEnBaseDeDatos(email, items, sessionId, userId) {
    const db = admin.firestore();
  
    const orderRef = db.collection("orders").doc();
  
    await orderRef.set({
      email,
      items,
      sessionId, // Asociar el session_id para evitar duplicados
      userId, // Asociar el pedido con el usuario
      status: "comprado", // Estado inicial de la compra
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  
    console.log("Compra guardada en la base de datos con session_id:", sessionId);
  }
  

module.exports = { createCheckoutSession, verifySession,actualizarEstadoPedido, getUserOrders };
