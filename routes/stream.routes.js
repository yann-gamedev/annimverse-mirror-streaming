const express = require("express");
const router = express.Router();
const streamController = require("../controllers/stream.controller");

// GET /api/stream/:id
router.get("/:id", streamController.streamVideo);

module.exports = router;
