const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin.controller");
const { protect } = require("../middleware/auth.middleware");

// Semua route admin wajib login dan punya role admin
router.use(protect);

// GET Statistics
router.get("/stats", adminController.getStats);

// POST Create Badge
router.post("/badge", adminController.createBadge);

// GET All Users
router.get("/users", adminController.getAllUsers);

// PUT Update User Role
router.put("/users/:id/role", adminController.updateUserRole);

module.exports = router;
