// backend/routes/createSampleDataRoute.js
const express = require("express");
const router = express.Router();
const { createSampleData } = require("../controllers/createSampleDataController");

// POST /api/admin/createSampleData
router.post("/createSampleData", createSampleData);

module.exports = router;
