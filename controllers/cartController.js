// backend/controllers/cartController.js
const admin = require("../config/firebaseAdmin");

/**
 * Agregar un producto al carrito del usuario.
 * Si el producto ya existe, incrementa la cantidad.
 */
async function addToCart(req, res) {
  try {
    const { productId, quantity } = req.body; // Producto y cantidad a agregar
    const authHeader = req.headers.authorization || "";
    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided" });
    }
    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    const uid = decodedToken.uid;

    const db = admin.firestore();
    const cartRef = db.collection("carts").doc(uid);

    await db.runTransaction(async (transaction) => {
      const cartDoc = await transaction.get(cartRef);

      let items = [];
      if (cartDoc.exists) {
        items = cartDoc.data().items || [];
      }

      // Verificar si el producto ya está en el carrito
      const itemIndex = items.findIndex((item) => item.productId === productId);

      if (itemIndex >= 0) {
        // Si ya existe, incrementamos la cantidad
        items[itemIndex].quantity += quantity;
      } else {
        // Si no existe, lo agregamos
        items.push({ productId, quantity });
      }

      transaction.set(cartRef, { items });
    });

    return res.json({ message: "Producto agregado al carrito" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
async function clearCart(req, res) {
  try {
    const authHeader = req.headers.authorization || "";
    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided" });
    }
    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    const uid = decodedToken.uid;

    const db = admin.firestore();
    const cartRef = db.collection("carts").doc(uid);

    await db.runTransaction(async (transaction) => {
      const cartDoc = await transaction.get(cartRef);
      if (!cartDoc.exists) {
        throw new Error("El carrito ya está vacío.");
      }

      transaction.set(cartRef, { items: [] }); // Vaciar el carrito
    });

    return res.json({ message: "Carrito vaciado correctamente." });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
  
  async function updateCart(req, res) {
    try {
      const { productId, quantity } = req.body; // Producto y nueva cantidad
      if (!productId || quantity < 1) {
        return res.status(400).json({ error: "Datos inválidos." });
      }
  
      const authHeader = req.headers.authorization || "";
      if (!authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "No token provided" });
      }
      const token = authHeader.split("Bearer ")[1];
      const decodedToken = await admin.auth().verifyIdToken(token);
      const uid = decodedToken.uid;
  
      const db = admin.firestore();
      const cartRef = db.collection("carts").doc(uid);
  
      await db.runTransaction(async (transaction) => {
        const cartDoc = await transaction.get(cartRef);
  
        if (!cartDoc.exists) {
          throw new Error("El carrito está vacío.");
        }
  
        let items = cartDoc.data().items || [];
        const itemIndex = items.findIndex((item) => item.productId === productId);
  
        if (itemIndex === -1) {
          throw new Error("Producto no encontrado en el carrito.");
        }
  
        // Actualizar la cantidad del producto
        items[itemIndex].quantity = quantity;
  
        transaction.set(cartRef, { items });
      });
  
      return res.json({ message: "Cantidad actualizada correctamente." });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
/**
 * Eliminar un producto del carrito del usuario.
 */
async function removeFromCart(req, res) {
  try {
    const { productId } = req.body;
    const authHeader = req.headers.authorization || "";
    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided" });
    }
    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    const uid = decodedToken.uid;

    const db = admin.firestore();
    const cartRef = db.collection("carts").doc(uid);

    await db.runTransaction(async (transaction) => {
      const cartDoc = await transaction.get(cartRef);

      if (!cartDoc.exists) {
        throw new Error("El carrito está vacío.");
      }

      let items = cartDoc.data().items || [];
      items = items.filter((item) => item.productId !== productId);

      transaction.set(cartRef, { items });
    });

    return res.json({ message: "Producto eliminado del carrito" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

module.exports = { addToCart, removeFromCart,clearCart,updateCart  };
