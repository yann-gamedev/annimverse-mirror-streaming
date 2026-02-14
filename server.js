require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

// --- IMPORT ROUTE ---
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth.routes');
const animeRoutes = require('./routes/anime.routes');
const userRoutes = require('./routes/user.routes');
const interactionRoutes = require('./routes/interaction.routes');
// [WAJIB] Import route streaming yang tadi hilang
const streamRoutes = require('./routes/stream.routes');
const adminRoutes = require('./routes/admin.routes');
const requestRoutes = require('./routes/request.routes');
const recommendationRoutes = require('./routes/recommendation.routes');


const app = express();
const PORT = process.env.PORT || 4000;

connectDB();

// --- MIDDLEWARES ---
// Security & Performance
app.set('trust proxy', 1); // Required for Vercel/Heroku (Rate Limiting)
app.use(helmet({
    contentSecurityPolicy: false, // Disable temporarily if it breaks inline scripts (common in simple HTML apps)
    crossOriginEmbedderPolicy: false
}));
app.use(compression()); // Gzip compression

// Rate Limiting (100 req / 15 min)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many requests, please try again later." }
});
// Apply limiter to all API routes
app.use('/api/', limiter);

app.use(cors()); // Configure origin in production!
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// --- STATIC FILES ---
app.use(express.static(path.join(__dirname, 'public')));
app.use('/storage', express.static(path.join(__dirname, 'storage')));

// --- SIMPLE STATUS ENDPOINT (for offline detection) ---
app.get('/api/status', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// --- DEBUG DB ENDPOINT (Remove in production later) ---
app.get('/api/debug-db', async (req, res) => {
    try {
        const mongoose = require('mongoose');
        const state = mongoose.connection.readyState;
        const states = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };

        // Check outgoing IP (to verify whitelist)
        const ipRes = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipRes.json();

        res.json({
            status: states[state] || 'unknown',
            readyState: state,
            host: mongoose.connection.host,
            dbName: mongoose.connection.name,
            serverIP: ipData.ip,
            envLoaded: !!process.env.MONGO_URI,
            mongoUriPrefix: process.env.MONGO_URI ? process.env.MONGO_URI.substring(0, 15) + '...' : 'undefined'
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- ROUTING API ---
app.use('/api/auth', authRoutes);
app.use('/api/anime', animeRoutes);
app.use('/api/users', userRoutes);
app.use('/api/interact', interactionRoutes);
// [WAJIB] Pasang jalur streaming di sini
app.use('/api/stream', streamRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/recommendations', recommendationRoutes);

// --- FALLBACK ---
app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// --- START ---
app.listen(PORT, () => {
    console.log(`\n🚀 Server Annimverse meluncur di: http://localhost:${PORT}`);
});