require('dotenv').config();
const mongoose = require('mongoose');
const Episode = require('./models/Episode');
const Anime = require('./models/Anime');

// ID ASLI DARI HASIL DIAGNOSA KAMU
const REAL_ID = '1UDG72xhqtuQSaWHBnonKFTDyF0i8fGif'; 

const fixData = async () => {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('🔌 Database Terkoneksi...');

    // Cari Anime Jujutsu Kaisen dulu
    const anime = await Anime.findOne({ slug: 'jujutsu-kaisen' }); // Pastikan slug sesuai database
    if (!anime) {
        console.log('❌ Anime tidak ketemu. Cek slug-nya.');
        process.exit();
    }

    // Update Episode 1 milik Jujutsu Kaisen
    const result = await Episode.findOneAndUpdate(
        { anime: anime._id, episodeNumber: 1 }, // Cari Eps 1
        { gdriveId: REAL_ID }, // Ganti ID-nya
        { new: true }
    );

    if (result) {
        console.log('✅ SUKSES! Database sudah diperbarui.');
        console.log(`   Episode 1 sekarang menggunakan ID: ${result.gdriveId}`);
    } else {
        console.log('⚠️ Episode 1 tidak ditemukan. Buat dulu lewat Admin Panel.');
    }

    process.exit();
};

fixData();
