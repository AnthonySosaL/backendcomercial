// backend/routes/createUserRoute.js
const express = require("express");
const router = express.Router();
const { createUser } = require("../controllers/createUserController");

router.post("/createUser", createUser);

module.exports = router;
