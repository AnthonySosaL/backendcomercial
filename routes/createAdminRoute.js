// backend/routes/createAdminRoute.js
const express = require("express");
const router = express.Router();
const { createAdmin } = require("../controllers/createAdminController");

router.post("/createAdmin", createAdmin);

module.exports = router;
