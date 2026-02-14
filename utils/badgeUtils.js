/**
 * Badge Awarding Logic
 * Checks user progress and awards badges automatically
 */

const Badge = require('../models/Badge');
const User = require('../models/User');
const History = require('../models/History');
const Anime = require('../models/Anime');

/**
 * Award a badge to user if they don't have it yet
 */
async function awardBadge(userId, badgeCode) {
    try {
        const badge = await Badge.findOne({ code: badgeCode });
        if (!badge) return null;

        const user = await User.findById(userId);
        if (!user) return null;

        // Check if user already has this badge
        if (user.badges.includes(badge._id)) {
            return null; // Already has badge
        }

        // Award badge!
        user.badges.push(badge._id);
        await user.save();

        return badge;
    } catch (error) {
        console.error('Error awarding badge:', error);
        return null;
    }
}

/**
 * Check and award all applicable badges for a user
 */
async function checkAndAwardBadges(userId, animeId) {
    const newBadges = [];

    try {
        const user = await User.findById(userId).populate('badges');
        const anime = await Anime.findById(animeId);

        // 1. FIRST_WATCH - First episode ever watched
        const totalHistory = await History.countDocuments({ user: userId });
        if (totalHistory === 1) {
            const badge = await awardBadge(userId, 'FIRST_WATCH');
            if (badge) newBadges.push(badge);
        }

        // 2. BINGE_WATCHER - 5+ episodes in one day
        if (user.watchHistory.todayEpisodesCount >= 5) {
            const badge = await awardBadge(userId, 'BINGE_WATCHER');
            if (badge) newBadges.push(badge);
        }

        // 3. NIGHT_OWL - Watching between 00:00 and 03:00
        const currentHour = new Date().getHours();
        if (currentHour >= 0 && currentHour < 3) {
            const badge = await awardBadge(userId, 'NIGHT_OWL');
            if (badge) newBadges.push(badge);
        }

        // 4. GENRE_EXPLORER - Watched 5 different genres
        if (anime && anime.genres) {
            // Add new genres to user's watched genres
            const updatedGenres = new Set(user.watchHistory.watchedGenres);
            anime.genres.forEach(genre => updatedGenres.add(genre));

            if (updatedGenres.size >= 5) {
                const badge = await awardBadge(userId, 'GENRE_EXPLORER');
                if (badge) newBadges.push(badge);
            }

            // Update user's watched genres
            await User.findByIdAndUpdate(userId, {
                'watchHistory.watchedGenres': Array.from(updatedGenres)
            });
        }

        // 5. MARATHON - 7-day watch streak
        if (user.stats.currentStreak >= 7) {
            const badge = await awardBadge(userId, 'MARATHON');
            if (badge) newBadges.push(badge);
        }

        // 6. STREAK_30 - 30-day watch streak
        if (user.stats.currentStreak >= 30) {
            const badge = await awardBadge(userId, 'STREAK_30');
            if (badge) newBadges.push(badge);
        }

        // 7. OTAKU - Level 10
        if (user.stats.level >= 10) {
            const badge = await awardBadge(userId, 'OTAKU');
            if (badge) newBadges.push(badge);
        }

        // 8. SPEED_RUNNER - 20+ episodes in a week
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const weeklyCount = await History.countDocuments({
            user: userId,
            watchedAt: { $gte: oneWeekAgo }
        });

        if (weeklyCount >= 20) {
            const badge = await awardBadge(userId, 'SPEED_RUNNER');
            if (badge) newBadges.push(badge);
        }

    } catch (error) {
        console.error('Error checking badges:', error);
    }

    return newBadges;
}

/**
 * Reset daily episode count at midnight
 */
async function resetDailyCount(user) {
    const today = new Date().toDateString();
    const lastEpisodeDate = user.watchHistory.lastEpisodeDate
        ? new Date(user.watchHistory.lastEpisodeDate).toDateString()
        : null;

    if (today !== lastEpisodeDate) {
        user.watchHistory.todayEpisodesCount = 1;
        user.watchHistory.lastEpisodeDate = new Date();
    } else {
        user.watchHistory.todayEpisodesCount += 1;
    }

    await user.save();
}

module.exports = {
    awardBadge,
    checkAndAwardBadges,
    resetDailyCount
};
