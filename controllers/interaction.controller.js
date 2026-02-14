const Episode = require('../models/Episode');
const Comment = require('../models/Comment');
const Bookmark = require('../models/Bookmark');
const Anime = require('../models/Anime');
const History = require('../models/History');
const User = require('../models/User');

// 1. TOGGLE LIKE (Like / Unlike)
exports.toggleLike = async (req, res) => {
    try {
        const { episodeId, userId } = req.body;

        const episode = await Episode.findById(episodeId);
        if (!episode) return res.status(404).json({ message: "Episode tidak ditemukan" });

        // Cek apakah user sudah ada di daftar likes?
        const index = episode.likes.indexOf(userId);

        if (index === -1) {
            // Belum like -> Tambahkan (LIKE)
            episode.likes.push(userId);
            await episode.save();
            res.json({ message: "Liked", isLiked: true, total: episode.likes.length });
        } else {
            // Sudah like -> Hapus (UNLIKE)
            episode.likes.splice(index, 1);
            await episode.save();
            res.json({ message: "Unliked", isLiked: false, total: episode.likes.length });
        }
    } catch (error) {
        res.status(500).json({ message: "Error", error: error.message });
    }
};

// 2. KIRIM KOMENTAR
exports.postComment = async (req, res) => {
    try {
        const { episodeId, userId, text } = req.body;

        if (!text) return res.status(400).json({ message: "Komentar tidak boleh kosong" });

        const newComment = await Comment.create({
            user: userId,
            episode: episodeId,
            text
        });

        // Ambil data user lengkap untuk dikirim balik ke frontend (biar langsung muncul)
        const populatedComment = await Comment.findById(newComment._id).populate('user', 'username avatar');

        res.status(201).json(populatedComment);
    } catch (error) {
        res.status(500).json({ message: "Gagal kirim komentar", error: error.message });
    }
};

// 3. AMBIL KOMENTAR (Per Episode)
exports.getComments = async (req, res) => {
    try {
        const { episodeId } = req.params;

        // Ambil komen, urutkan dari yang terbaru, dan sertakan data username & avatar
        const comments = await Comment.find({ episode: episodeId })
            .sort({ createdAt: -1 })
            .populate('user', 'username avatar');

        res.json(comments);
    } catch (error) {
        res.status(500).json({ message: "Error", error: error.message });
    }
};

// [BARU] 4. TOGGLE BOOKMARK
exports.toggleBookmark = async (req, res) => {
    try {
        const { animeId, userId } = req.body;

        // Cek apakah sudah ada bookmarknya?
        const existing = await Bookmark.findOne({ user: userId, anime: animeId });

        if (existing) {
            // Kalau ada -> Hapus (Un-bookmark)
            await Bookmark.deleteOne({ _id: existing._id });
            res.json({ message: "Dihapus dari Library", isBookmarked: false });
        } else {
            // Kalau tidak ada -> Buat baru
            await Bookmark.create({ user: userId, anime: animeId });
            res.json({ message: "Disimpan ke Library", isBookmarked: true });
        }
    } catch (error) {
        res.status(500).json({ message: "Error Bookmark", error: error.message });
    }
};

// [BARU] 5. CEK STATUS BOOKMARK (Untuk Frontend)
exports.checkBookmark = async (req, res) => {
    try {
        const { animeId, userId } = req.query;
        const exists = await Bookmark.findOne({ user: userId, anime: animeId });
        res.json({ isBookmarked: !!exists }); // Mengembalikan true/false
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ✨ ENHANCED: CATAT HISTORY + STATS + BADGES
exports.addToHistory = async (req, res) => {
    try {
        const { userId, animeId, episodeId } = req.body;
        const { checkAndAwardBadges, resetDailyCount } = require('../utils/badgeUtils');

        // 1. Simpan/Update History
        const existing = await History.findOne({ user: userId, episode: episodeId });
        if (existing) {
            existing.watchedAt = Date.now();
            await existing.save();
        } else {
            await History.create({ user: userId, anime: animeId, episode: episodeId });
        }

        // 2. Update User Stats
        const user = await User.findById(userId);

        // A. Watch Time (assume 24 min per episode)
        const WATCH_DURATION = 24;
        user.stats.totalWatchTime += WATCH_DURATION;

        // B. Add XP (10 XP per minute)
        const XP_GAINED = WATCH_DURATION * 10;
        user.stats.xp += XP_GAINED;

        // C. Level Up Logic (1000 XP per level)
        const newLevel = Math.floor(user.stats.xp / 1000) + 1;
        const leveledUp = newLevel > user.stats.level;
        if (leveledUp) {
            user.stats.level = newLevel;
        }

        // D. Streak Calculation
        const now = new Date();
        const lastDate = user.stats.lastWatchDate ? new Date(user.stats.lastWatchDate) : null;

        if (lastDate) {
            const diffTime = Math.abs(now - lastDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
                user.stats.currentStreak += 1;
            } else if (diffDays > 1) {
                user.stats.currentStreak = 1;
            }
        } else {
            user.stats.currentStreak = 1;
        }

        user.stats.lastWatchDate = now;

        // E. Daily Episode Counter (for Binge Watcher badge)
        await resetDailyCount(user);

        await user.save();

        // 3. 🏆 CHECK AND AWARD BADGES!
        const newBadges = await checkAndAwardBadges(userId, animeId);

        res.json({
            message: "Progress direkam",
            stats: user.stats,
            xpGained: XP_GAINED,
            leveledUp,
            newBadges: newBadges.map(b => ({ name: b.name, description: b.description, icon: b.icon }))
        });

    } catch (error) {
        console.error("History Error:", error);
        res.status(500).json({ error: error.message });
    }
};

// [BARU] AMBIL HISTORY USER
exports.getUserHistory = async (req, res) => {
    try {
        const { userId } = req.params;

        const history = await History.find({ user: userId })
            .sort({ watchedAt: -1 }) // Urutkan dari yang terakhir ditonton
            .limit(10) // Ambil 10 terakhir
            .populate('anime', 'title posterUrl slug') // Ambil data anime
            .populate('episode', 'episodeNumber title'); // Ambil data episode

        res.json(history);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
