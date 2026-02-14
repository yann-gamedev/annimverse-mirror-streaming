const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    avatar: {
        type: String,
        default: '' // Bisa kosong atau link default
    },
    // Statistik User (XP, Level, Streak)
    stats: {
        level: { type: Number, default: 1 },
        xp: { type: Number, default: 0 },
        totalWatchTime: { type: Number, default: 0 }, // menit
        currentStreak: { type: Number, default: 0 },
        lastWatchDate: { type: Date, default: null }
    },
    // Badges earned by user
    badges: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Badge'
    }],
    // Tracking for badge logic
    watchHistory: {
        watchedGenres: [{ type: String }], // Track unique genres watched
        todayEpisodesCount: { type: Number, default: 0 },
        lastEpisodeDate: { type: Date, default: null }
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema); ts = mongoose.model('User', userSchema);
