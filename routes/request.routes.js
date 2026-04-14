const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth.middleware");
const {
  createRequest,
  getAllRequests,
  getRequestById,
  voteRequest,
  deleteRequest,
  updateRequestStatus,
} = require("../controllers/request.controller");

// Public routes
router.get("/", getAllRequests);
router.get("/:id", getRequestById);

// Protected routes
router.post("/", protect, createRequest);
router.put("/:id/vote", protect, voteRequest);
router.delete("/:id", protect, deleteRequest);

// Admin routes (protect middleware checks for admin role)
router.put("/:id/status", protect, updateRequestStatus);

module.exports = router;
