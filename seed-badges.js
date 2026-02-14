/**
 * Seed script to populate badge definitions
 * Run once: node seed-badges.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Badge = require('./models/Badge');
const dns = require('dns');

// Force Google DNS
dns.setServers(['8.8.8.8', '8.8.4.4']);

const badges = [
    // Existing badges (if any)
    {
        code: 'NEWCOMER',
        name: 'Pendatang Baru',
        description: 'Bergabung dengan Annimverse',
        icon: 'user-plus',
        category: 'SPECIAL',
        requirementValue: 1
    },

    // NEW Phase 4 Badges
    {
        code: 'FIRST_WATCH',
        name: 'First Watch',
        description: 'Menonton episode anime pertama kali',
        icon: 'play-circle',
        category: 'WATCH',
        requirementValue: 1
    },
    {
        code: 'BINGE_WATCHER',
        name: 'Binge Watcher',
        description: 'Menonton 5+ episode dalam satu hari',
        icon: 'popcorn',
        category: 'WATCH',
        requirementValue: 5
    },
    {
        code: 'NIGHT_OWL',
        name: 'Night Owl',
        description: 'Menonton anime di tengah malam (00:00 - 03:00)',
        icon: 'moon',
        category: 'SPECIAL',
        requirementValue: 1
    },
    {
        code: 'GENRE_EXPLORER',
        name: 'Genre Explorer',
        description: 'Menonton anime dari 5 genre berbeda',
        icon: 'compass',
        category: 'WATCH',
        requirementValue: 5
    },
    {
        code: 'MARATHON',
        name: 'Marathon Runner',
        description: 'Menonton anime 7 hari berturut-turut',
        icon: 'flame',
        category: 'STREAK',
        requirementValue: 7
    },
    {
        code: 'STREAK_30',
        name: '30-Day Streak',
        description: 'Menonton anime 30 hari berturut-turut',
        icon: 'zap',
        category: 'STREAK',
        requirementValue: 30
    },
    {
        code: 'OTAKU',
        name: 'True Otaku',
        description: 'Mencapai level 10',
        icon: 'crown',
        category: 'SPECIAL',
        requirementValue: 10
    },
    {
        code: 'SPEED_RUNNER',
        name: 'Speed Runner',
        description: 'Menonton 20+ episode dalam seminggu',
        icon: 'rocket',
        category: 'WATCH',
        requirementValue: 20
    }
];

async function seedBadges() {
    try {
        console.log('🔗 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI, { family: 4 });
        console.log('✅ Connected!');

        // Clear existing badges (optional, comment out if you want to keep old ones)
        // await Badge.deleteMany({});
        // console.log('🗑️  Cleared old badges');

        // Insert new badges (using insertMany with upsert-like behavior)
        for (const badgeData of badges) {
            await Badge.findOneAndUpdate(
                { code: badgeData.code },
                badgeData,
                { upsert: true, new: true }
            );
            console.log(`✅ ${badgeData.name} (${badgeData.code})`);
        }

        console.log(`\n🎉 Successfully seeded ${badges.length} badges!`);
        mongoose.connection.close();
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

seedBadges();
