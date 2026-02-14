const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    anime: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Anime',
        required: true
    },
    episode: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Episode',
        required: true
    },
    // Nanti bisa dikembangkan untuk simpan menit terakhir (resume playback)
    watchedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Agar satu user tidak punya duplikat history untuk episode yang sama
// (Kalau nonton ulang, update waktu saja, jangan buat data baru)
historySchema.index({ user: 1, episode: 1 }, { unique: true });

// Indexes for recommendation queries
historySchema.index({ user: 1, watchedAt: -1 });
historySchema.index({ anime: 1, watchedAt: -1 });

module.exports = mongoose.model('History', historySchema);