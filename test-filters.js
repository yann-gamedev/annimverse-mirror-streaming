// Quick test script to check API and database
require('dotenv').config();
const mongoose = require('mongoose');
const dns = require('dns');

// Force Google DNS
dns.setServers(['8.8.8.8', '8.8.4.4']);

async function testAPI() {
    try {
        console.log('🔍 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI, { family: 4 });
        console.log('✅ Connected to:', mongoose.connection.name);

        // Check Anime model structure
        const Anime = require('./models/Anime');

        // Get sample anime
        const sampleAnime = await Anime.findOne();
        console.log('\n📺 Sample Anime Structure:');
        console.log(JSON.stringify(sampleAnime, null, 2));

        // Test genre query
        console.log('\n🔍 Testing Romance genre query...');
        const romanceAnime = await Anime.find({ genres: 'Romance' }).limit(3);
        console.log(`Found ${romanceAnime.length} Romance anime`);
        romanceAnime.forEach(a => console.log(`  - ${a.title}: ${a.genres}`));

        // Test with $in operator
        console.log('\n🔍 Testing $in operator...');
        const genreArray = ['Romance'];
        const animeWithIn = await Anime.find({ genres: { $in: genreArray } }).limit(3);
        console.log(`Found ${animeWithIn.length} anime with $in`);
        animeWithIn.forEach(a => console.log(`  - ${a.title}: ${a.genres}`));

        // Get all anime count
        const totalCount = await Anime.countDocuments();
        console.log(`\n📊 Total anime in database: ${totalCount}`);

        mongoose.connection.close();
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

testAPI();
