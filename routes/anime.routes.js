const express = require('express');
const router = express.Router();
const animeController = require('../controllers/anime.controller');

// [BARU] Import Middleware Satpam
const { protect } = require('../middleware/auth.middleware');

// Public Routes (Boleh diakses siapa saja)
router.get('/', animeController.getAllAnime);
router.get('/search', animeController.searchAnime);
router.get('/:slug', animeController.getAnimeDetail);
router.get('/:slug/episodes', animeController.getAnimeEpisodes);
router.get('/:slug/watch/:eps', animeController.getWatchData);

// Protected Routes (Hanya boleh diakses User Login/Admin)
// Kita pasang 'protect' sebelum controller dijalankan
router.post('/', protect, animeController.createAnime);           // KUNCI INI
router.post('/episode', protect, animeController.createEpisode);  // KUNCI INI

module.exports = router;