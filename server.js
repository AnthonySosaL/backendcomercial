require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path"); // Módulo para manejar rutas
const createAdminRoute = require("./routes/createAdminRoute");
const createUserRoute = require("./routes/createUserRoute");
const authRoutes = require("./routes/authRoutes");
const createSampleDataRoute = require("./routes/createSampleDataRoute");
const checkoutRoute = require("./routes/checkoutRoute");
const cartRoutes = require("./routes/cartRoutes");
const uploadRoutes = require("./routes/uploadRoutes");

const app = express();
app.use(cors());
app.use(express.json());

// Configuración para servir archivos estáticos (imágenes)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));



// Rutas del backend
app.use("/api/auth", createAdminRoute);
app.use("/api/auth", createUserRoute);
app.use("/api/auth", authRoutes);
app.use("/api/admin", createSampleDataRoute);
app.use("/api/checkout", checkoutRoute);
app.use("/api", cartRoutes);
app.use("/api/uploadRoutes", uploadRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Backend corriendo en http://localhost:${PORT}`);
});
