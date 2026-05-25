const express = require("express");
const router = express.Router();
const badgeController = require("../controllers/badge.controller");

// GET all badges (for the catalog/achievements page)
router.get("/", badgeController.getAllBadges);

module.exports = router;
