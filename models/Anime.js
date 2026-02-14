const mongoose = require('mongoose');

const animeSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    slug: {
        // Slug adalah versi URL-friendly dari judul. 
        // Contoh: "Solo Leveling" -> "solo-leveling"
        type: String,
        lowercase: true,
        unique: true
    },
    synopsis: {
        type: String,
        required: true
    },
    genres: [{
        type: String // Contoh: ["Action", "Fantasy", "Isekai"]
    }],
    posterUrl: {
        type: String, // Link gambar poster (bisa dari TMDB atau link gambar lain)
        default: 'https://placehold.co/300x450?text=No+Poster'
    },
    rating: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['Ongoing', 'Completed', 'Movie'],
        default: 'Ongoing'
    },
    releaseYear: {
        type: Number
    },
    totalEpisodes: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Indexes for recommendation query performance
animeSchema.index({ genres: 1 });
animeSchema.index({ rating: -1 });
animeSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Anime', animeSchema);