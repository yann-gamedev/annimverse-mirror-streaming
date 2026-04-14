require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

// --- IMPORT ROUTES ---
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth.routes');
const animeRoutes = require('./routes/anime.routes');
const userRoutes = require('./routes/user.routes');
const interactionRoutes = require('./routes/interaction.routes');
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
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
}));
app.use(compression());

// Rate Limiting - General API (100 req / 15 min)
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many requests, please try again later." }
});

// Rate Limiting - Auth routes (more generous: 30 req / 15 min per IP)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Terlalu banyak percobaan, coba lagi nanti." }
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Only use verbose logging in development
if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev'));
}

// --- STATIC FILES ---
app.use(express.static(path.join(__dirname, 'public')));
app.use('/storage', express.static(path.join(__dirname, 'storage')));

// --- STATUS ENDPOINT (for health check and offline detection) ---
app.get('/api/status', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// --- ROUTING API ---
// Auth routes get their own more generous limiter
app.use('/api/auth', authLimiter, authRoutes);

// All other API routes use the general limiter
app.use('/api/anime', generalLimiter, animeRoutes);
app.use('/api/users', generalLimiter, userRoutes);
app.use('/api/interact', generalLimiter, interactionRoutes);
app.use('/api/stream', generalLimiter, streamRoutes);
app.use('/api/admin', generalLimiter, adminRoutes);
app.use('/api/requests', generalLimiter, requestRoutes);
app.use('/api/recommendations', generalLimiter, recommendationRoutes);

// --- FALLBACK ---
app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// --- GLOBAL ERROR HANDLER ---
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ message: 'Internal server error' });
});

// --- START ---
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`\n🚀 Server Annimverse running at: http://localhost:${PORT}`);
    });
}

module.exports = app;