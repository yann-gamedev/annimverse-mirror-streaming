const express = require('express');
const router = express.Router();
const interactionController = require('../controllers/interaction.controller');
// Import middleware protect juga biar aman
const { protect } = require('../middleware/auth.middleware'); 

// Bookmark Routes
router.post('/bookmark', protect, interactionController.toggleBookmark);
router.get('/bookmark/check', protect, interactionController.checkBookmark); // Cek status

// POST /api/interact/like (Untuk Like)
router.post('/like', interactionController.toggleLike);

// POST /api/interact/comment (Kirim Komen)
router.post('/comment', interactionController.postComment);

// GET /api/interact/comment/:episodeId (Ambil List Komen)
router.get('/comment/:episodeId', interactionController.getComments);

router.post('/history', protect, interactionController.addToHistory);
router.get('/history/:userId', protect, interactionController.getUserHistory);

module.exports = router;