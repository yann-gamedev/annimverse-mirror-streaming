const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const {
    getPersonalizedRecommendations,
    getSimilarAnime,
    getTrendingAnime,
    submitFeedback,
    getPersonalizedTrending,
    getWatchPartyRecommendations
} = require('../controllers/recommendation.controller');

// Public routes
router.get('/trending', getTrendingAnime);
router.get('/similar/:animeId', getSimilarAnime);

// Protected routes (requires login)
router.get('/', protect, getPersonalizedRecommendations);

// Phase 3 Routes
router.post('/feedback', protect, submitFeedback);
router.get('/trending/personalized', protect, getPersonalizedTrending);
router.post('/party', getWatchPartyRecommendations);

module.exports = router;
