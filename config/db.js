const mongoose = require('mongoose');
const dns = require('dns');

// FIX: Windows DNS tidak bisa resolve MongoDB Atlas SRV records
// Solusi: Gunakan Google DNS (8.8.8.8 dan 8.8.4.4)
if (process.platform === 'win32') {
    dns.setServers(['8.8.8.8', '8.8.4.4']);
}

const connectDB = async () => {
    try {
        const clientOptions = {
            serverSelectionTimeoutMS: 5000,
        };

        if (process.platform === 'win32') {
            clientOptions.family = 4; // Force IPv4 only on Windows
        }

        const conn = await mongoose.connect(process.env.MONGO_URI, clientOptions);
        console.log(`✅ MongoDB Atlas Terkoneksi: ${conn.connection.host}`);
        console.log(`📂 Database: ${conn.connection.name}`);
    } catch (error) {
        console.error(`❌ Error Koneksi Database: ${error.message}`);
        console.log("👉 Cek file .env, pastikan password database sudah benar!");
        console.log("👉 Atau coba: npm install mongodb@4.1 --save (masalah DNS Windows)");
        // Kita tidak exit process agar server tetap nyala untuk debugging
    }
};

module.exports = connectDB;
