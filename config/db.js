const mongoose = require('mongoose');
const dns = require('dns');

// Windows DNS can't resolve MongoDB Atlas SRV records
// Use Google DNS on Windows (local dev only, Vercel runs Linux)
if (process.platform === 'win32') {
    dns.setServers(['8.8.8.8', '8.8.4.4']);
}

// Cache the connection for serverless environments (Vercel)
let cached = global._mongooseConnection;
if (!cached) {
    cached = global._mongooseConnection = { conn: null, promise: null };
}

const connectDB = async () => {
    // If already connected, reuse the connection
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            serverSelectionTimeoutMS: 10000, // 10s for cold starts
            socketTimeoutMS: 45000,
            family: process.platform === 'win32' ? 4 : undefined, // Force IPv4 on Windows
        };

        cached.promise = mongoose.connect(process.env.MONGO_URI, opts)
            .then((mongoose) => {
                console.log(`✅ MongoDB Atlas Connected: ${mongoose.connection.host}`);
                console.log(`📂 Database: ${mongoose.connection.name}`);
                return mongoose;
            })
            .catch((error) => {
                cached.promise = null; // Reset so next invocation retries
                console.error(`❌ Database Connection Error: ${error.message}`);
                console.log("👉 Check your .env file and MongoDB Atlas network access list");
                // Don't throw - let server keep running for debugging
                return null;
            });
    }

    try {
        cached.conn = await cached.promise;
    } catch (error) {
        cached.promise = null;
        console.error(`❌ Database Connection Error: ${error.message}`);
    }

    return cached.conn;
};

module.exports = connectDB;
