// backend/routes/authRoutes.js
const express = require("express");
const router = express.Router();
const { verifyRole } = require("../controllers/authController");

router.post("/verifyRole", verifyRole);

module.exports = router;
