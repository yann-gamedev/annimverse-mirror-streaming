const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const upload = require("../middleware/upload.middleware");
const { protect } = require("../middleware/auth.middleware"); // Pake satpam

// GET Profile
router.get("/:id", userController.getUserProfile);

// POST Upload Avatar
router.post(
  "/:id/avatar",
  upload.single("avatar"),
  userController.uploadAvatar,
);

// [BARU] PUT Update Profile (Wajib Login/Protect)
router.put("/:id", protect, userController.updateProfile);

module.exports = router;
