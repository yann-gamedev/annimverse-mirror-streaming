const Anime = require("../models/Anime");
const History = require("../models/History");
const User = require("../models/User");

// Simple in-memory cache
let trendingCache = {
  data: null,
  timestamp: 0,
  TTL: 1000 * 60 * 60, // 1 Hour
};

/**
 * Get personalized recommendations for logged-in user
 * Based on their watch history and favorite genres
 */
exports.getPersonalizedRecommendations = async (req, res) => {
  try {
    const userId = req.user._id;
    const limit = parseInt(req.query.limit) || 20;

    // A/B Testing Logic
    // Group A (Even ID): Content-Based (Original)
    // Group B (Odd ID): Collaborative Filtering
    // We use the last char of ID which is hex, convert to int
    const lastChar = userId.toString().slice(-1);
    const isGroupB = parseInt(lastChar, 16) % 2 !== 0;

    if (isGroupB) {
      // Try Collaborative First
      const collabResult = await exports.getCollaborativeRecommendations(
        req,
        res,
        true,
      );
      if (collabResult && collabResult.recommendations.length > 0) {
        return res.json({
          ...collabResult,
          abGroup: "B", // Collaborative
        });
      }
      // If failed, fall through to Content-Based (Group A logic)
    }

    // --- GROUP A (Content-Based + Diversity Re-Ranking) Logic starts here ---
    // Get user's watch history
    const watchHistory = await History.find({ user: userId })
      .populate("anime")
      .sort({ watchedAt: -1 })
      .limit(100);

    if (watchHistory.length === 0) {
      return exports.getTrendingAnime(req, res);
    }

    // Extract watched IDs and Blacklisted IDs
    const userDoc = await User.findById(userId);
    const blacklistedIds = userDoc.blacklistedAnime
      ? userDoc.blacklistedAnime.map((id) => id.toString())
      : [];

    const watchedAnimeIds = [
      ...new Set([
        ...watchHistory.map((h) => h.anime._id.toString()),
        ...blacklistedIds,
      ]),
    ];

    // Get genres and favorites
    const allGenres = watchHistory
      .flatMap((h) => h.anime.genres)
      .filter((g) => g);

    // Count genre scores with recency weighting
    const genreScores = {};
    const now = new Date();
    watchHistory.forEach((h) => {
      if (!h.anime.genres) return;
      const daysAgo = (now - h.watchedAt) / (1000 * 60 * 60 * 24);
      const weight = 1 / (1 + daysAgo * 0.2);
      h.anime.genres.forEach((g) => {
        genreScores[g] = (genreScores[g] || 0) + weight;
      });
    });

    // Sort genres by weighted score
    const favoriteGenres = Object.keys(genreScores)
      .sort((a, b) => genreScores[b] - genreScores[a])
      .slice(0, 5);

    if (favoriteGenres.length === 0) return exports.getTrendingAnime(req, res);

    // Find Candidates (Get 50 instead of 20 for re-ranking)
    const candidates = await Anime.find({
      _id: { $nin: watchedAnimeIds },
      genres: { $in: favoriteGenres },
      rating: { $gte: 7.0 },
    })
      .sort({ rating: -1 })
      .limit(50);

    // Diversity Re-Ranking
    // Rule: If we select an anime, dampen the score of other anime with same genres
    const finalRecommendations = [];
    const selectedGenresCount = {};

    // Initial Scoring
    let scoredCandidates = candidates
      .map((anime) => {
        const matching = anime.genres.filter((g) =>
          favoriteGenres.includes(g),
        ).length;
        const baseScore =
          (matching / favoriteGenres.length) * 0.6 + (anime.rating / 10) * 0.4;
        return { ...anime.toObject(), _score: baseScore };
      })
      .sort((a, b) => b._score - a._score);

    // Re-Rank Loop
    while (finalRecommendations.length < limit && scoredCandidates.length > 0) {
      // Pick best current candidate
      const best = scoredCandidates[0];

      // Add to final
      // Find "Because you watched" reason
      let reason = null;
      let maxOverlap = 0;
      for (const h of watchHistory.slice(0, 20)) {
        if (!h.anime || !h.anime.genres) continue;
        const overlap = best.genres.filter((g) =>
          h.anime.genres.includes(g),
        ).length;
        if (overlap > maxOverlap) {
          maxOverlap = overlap;
          reason = h.anime.title;
        }
      }
      best.reason = reason ? `Karena kamu nonton ${reason}` : null;
      best._recommendationScore = best._score; // Preserve score for frontend

      finalRecommendations.push(best);

      // Remove from candidates
      scoredCandidates.shift();

      // Penalize similar genres in remaining candidates
      // If we picked "Action", reduce score of other "Action" anime
      best.genres.forEach((g) => {
        selectedGenresCount[g] = (selectedGenresCount[g] || 0) + 1;
      });

      scoredCandidates = scoredCandidates
        .map((c) => {
          let penalty = 0;
          c.genres.forEach((g) => {
            if (selectedGenresCount[g]) {
              penalty += selectedGenresCount[g] * 0.05; // 5% penalty per existing genre occurrence
            }
          });
          // Apply diversity penalty
          c._score = Math.max(0, c._score - penalty);
          return c;
        })
        .sort((a, b) => b._score - a._score);
    }

    res.json({
      recommendations: finalRecommendations,
      basedOn: {
        watchedCount: watchHistory.length,
        favoriteGenres: favoriteGenres,
        method: "content_based_diversity_v1",
      },
      abGroup: "A",
    });
  } catch (error) {
    console.error("Error getting personalized recommendations:", error);
    res.status(500).json({
      message: "Gagal mendapatkan rekomendasi",
      error: error.message,
    });
  }
};

/**
 * Get similar anime based on a specific anime
 * Matches by genre overlap
 */
exports.getSimilarAnime = async (req, res) => {
  try {
    const { animeId } = req.params;
    const limit = parseInt(req.query.limit) || 10;

    // Get source anime
    const sourceAnime = await Anime.findById(animeId);
    if (!sourceAnime) {
      return res.status(404).json({ message: "Anime tidak ditemukan" });
    }

    if (!sourceAnime.genres || sourceAnime.genres.length === 0) {
      return res.json({ similar: [] });
    }

    // Find anime with matching genres (at least 2 matches for better similarity)
    const similarAnime = await Anime.find({
      _id: { $ne: animeId },
      genres: { $in: sourceAnime.genres },
    }).limit(limit * 3); // Get more for scoring

    // Score by genre overlap
    const scoredSimilar = similarAnime.map((anime) => {
      const matchingGenres = anime.genres.filter((g) =>
        sourceAnime.genres.includes(g),
      ).length;

      // Calculate similarity: genre overlap (50%) + rating (50%)
      const genreOverlap = matchingGenres / sourceAnime.genres.length;
      const similarityScore = genreOverlap * 0.5 + (anime.rating / 10) * 0.5;

      return {
        ...anime.toObject(),
        _similarityScore: similarityScore,
        _matchingGenres: matchingGenres,
      };
    });

    // Sort by similarity and return top results
    const topSimilar = scoredSimilar
      .sort((a, b) => {
        // First by matching genres, then by similarity score
        if (b._matchingGenres !== a._matchingGenres) {
          return b._matchingGenres - a._matchingGenres;
        }
        return b._similarityScore - a._similarityScore;
      })
      .slice(0, limit)
      .map(({ _similarityScore, _matchingGenres, ...anime }) => anime);

    res.json({
      similar: topSimilar,
      sourceAnime: {
        id: sourceAnime._id,
        title: sourceAnime.title,
        genres: sourceAnime.genres,
      },
    });
  } catch (error) {
    console.error("Error getting similar anime:", error);
    res.status(500).json({
      message: "Gagal mendapatkan anime serupa",
      error: error.message,
    });
  }
};

/**
 * Get trending anime based on watch count in last 30 days
 * Fallback for non-logged-in users or users with no history
 */
exports.getTrendingAnime = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const days = parseInt(req.query.days) || 30;

    // Check Cache
    const now = Date.now();
    if (
      trendingCache.data &&
      now - trendingCache.timestamp < trendingCache.TTL
    ) {
      // Serve from cache if valid and requested with default params (optimization)
      if (days === 30 && limit <= 20) {
        return res.json({
          ...trendingCache.data,
          cached: true,
        });
      }
    }

    // Calculate date threshold
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - days);

    // Aggregate watch count by anime in the last N days
    const trendingData = await History.aggregate([
      {
        $match: {
          watchedAt: { $gte: dateThreshold },
        },
      },
      {
        $group: {
          _id: "$anime",
          viewCount: { $sum: 1 },
          lastWatched: { $max: "$watchedAt" },
        },
      },
      {
        $sort: { viewCount: -1, lastWatched: -1 },
      },
      {
        $limit: limit,
      },
    ]);

    if (trendingData.length === 0) {
      // No trending data, fallback to highest-rated recent anime
      const fallbackAnime = await Anime.find({})
        .sort({ rating: -1, createdAt: -1 })
        .limit(limit);

      return res.json({
        trending: fallbackAnime,
        fallback: true,
      });
    }

    // Populate anime details
    const animeIds = trendingData.map((t) => t._id);
    const animeDetails = await Anime.find({ _id: { $in: animeIds } });

    // Map view counts to anime
    const animeMap = {};
    animeDetails.forEach((anime) => {
      animeMap[anime._id.toString()] = anime.toObject();
    });

    const trendingAnime = trendingData
      .map((t) => ({
        ...animeMap[t._id.toString()],
        _trendingData: {
          viewCount: t.viewCount,
          lastWatched: t.lastWatched,
        },
      }))
      .filter((a) => a._id); // Remove any nulls

    const responseData = {
      trending: trendingAnime.map(({ _trendingData, ...anime }) => anime),
      period: `${days} hari terakhir`,
      totalViews: trendingData.reduce((sum, t) => sum + t.viewCount, 0),
    };

    // Update Cache (only for default query)
    if (days === 30) {
      trendingCache.data = responseData;
      trendingCache.timestamp = Date.now();
    }

    res.json(responseData);
  } catch (error) {
    console.error("Error getting trending anime:", error);
    res.status(500).json({
      message: "Gagal mendapatkan anime trending",
      error: error.message,
    });
  }
};

/**
 * Get collaborative recommendations (User-Based)
 * "Users who watched what you watched, also watched..."
 */
exports.getCollaborativeRecommendations = async (
  req,
  res,
  internalCall = false,
) => {
  try {
    const userId = req.user._id;
    const limit = parseInt(req.query?.limit) || 20;

    // 1. Get user's history (just IDs)
    const userHistory = await History.find({ user: userId })
      .select("anime")
      .sort({ watchedAt: -1 })
      .limit(20);
    const userAnimeIds = userHistory.map((h) => h.anime);

    if (userAnimeIds.length < 3) {
      // Not enough data, fallback
      if (internalCall) return null;
      return exports.getPersonalizedRecommendations(req, res);
    }

    // 2. Find similar users (who watched the same anime)
    const similarHistories = await History.find({
      anime: { $in: userAnimeIds },
      user: { $ne: userId },
    }).limit(200);

    const similarUserIds = [...new Set(similarHistories.map((h) => h.user))];

    if (similarUserIds.length === 0) {
      if (internalCall) return null;
      return exports.getPersonalizedRecommendations(req, res);
    }

    // 3. Find what those similar users watched (that current user hasn't)
    const candidateHistories = await History.find({
      user: { $in: similarUserIds },
      anime: { $nin: userAnimeIds },
    })
      .populate("anime")
      .limit(500);

    // 4. Count frequency
    const animeFrequency = {};
    candidateHistories.forEach((h) => {
      if (!h.anime) return;
      // Filter low rated garbage here too
      if (h.anime.rating < 7.0) return;

      const id = h.anime._id.toString();
      if (!animeFrequency[id]) {
        animeFrequency[id] = {
          anime: h.anime,
          count: 0,
        };
      }
      animeFrequency[id].count++;
    });

    // 5. Sort by popularity among similar users
    const recommendations = Object.values(animeFrequency)
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)
      .map((item) => item.anime);

    if (recommendations.length === 0) {
      if (internalCall) return null;
      return exports.getPersonalizedRecommendations(req, res);
    }

    const response = {
      recommendations,
      basedOn: {
        method: "collaborative_filtering",
        similarUsersCount: similarUserIds.length,
      },
      abGroup: "B", // Collaborative
    };

    if (internalCall) return response;
    res.json(response);
  } catch (error) {
    console.error("Error in collaborative filtering:", error);
    if (internalCall) return null;
    res.status(500).json({ message: "Collaborative filtering failed" });
  }
};

/**
 * Handle user explicit feedback (Hide/Not Interested)
 */
exports.submitFeedback = async (req, res) => {
  try {
    const { animeId, type } = req.body;
    const userId = req.user._id;

    if (type !== "hide") {
      return res.status(400).json({ message: "Invalid feedback type" });
    }

    await User.findByIdAndUpdate(userId, {
      $addToSet: { blacklistedAnime: animeId },
    });

    res.json({ message: "Anime sembunyikan dari rekomendasi", success: true });
  } catch (error) {
    console.error("Feedback error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

/**
 * Get personalized trending anime
 * Global trending filtered/boosted by user preferences
 */
exports.getPersonalizedTrending = async (req, res) => {
  try {
    // 1. Get User preferences
    const userId = req.user._id;
    const user = await User.findById(userId);
    const watchedGenres = user.watchHistory?.watchedGenres || [];

    // 2. Get Global Trending (Reuse existing logic/cache)
    let trendingList = [];

    if (trendingCache.data) {
      trendingList = trendingCache.data.trending;
    } else {
      // Fetch from DB if not cached (simplified version)
      const trendingData = await History.aggregate([
        {
          $match: {
            watchedAt: {
              $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            },
          },
        },
        { $group: { _id: "$anime", viewCount: { $sum: 1 } } },
        { $sort: { viewCount: -1 } },
        { $limit: 50 },
      ]);
      // Fallback:
      if (!trendingCache.data) return exports.getTrendingAnime(req, res);
    }

    // 3. Score trending items by User Preference
    const scoredTrending = trendingList
      .map((anime) => {
        let score = anime._trendingData?.viewCount || 0;

        // Boost if genre matches user favorites
        const matchCount = anime.genres.filter((g) =>
          watchedGenres.includes(g),
        ).length;
        if (matchCount > 0) {
          score *= 1 + matchCount * 0.2; // 20% boost per matching genre
        }

        // Remove if blacklisted
        if (
          user.blacklistedAnime &&
          user.blacklistedAnime.includes(anime._id.toString())
        ) {
          return null;
        }

        return { ...anime, _score: score };
      })
      .filter(Boolean)
      .sort((a, b) => b._score - a._score);

    res.json({
      trending: scoredTrending.slice(0, 20),
      personalized: true,
    });
  } catch (error) {
    console.error("Personalized trending error:", error);
    res.status(500).json({ message: "Error" });
  }
};

/**
 * Get Watch Party Recommendations
 * Intersection of preferences between multiple users
 */
exports.getWatchPartyRecommendations = async (req, res) => {
  try {
    const { userIds } = req.body; // Array of User IDs
    if (!userIds || !Array.isArray(userIds) || userIds.length < 2) {
      return res.status(400).json({ message: "Perlu minimal 2 user" });
    }

    // 1. Fetch all users and their history
    const users = await User.find({ _id: { $in: userIds } });

    let genreFrequency = {};

    // 2. Aggregate preferences
    for (const user of users) {
      if (user.watchHistory?.watchedGenres) {
        user.watchHistory.watchedGenres.forEach((g) => {
          genreFrequency[g] = (genreFrequency[g] || 0) + 1;
        });
      }
    }

    // 3. Find "Common Ground" Genres (Genres liked by > 50% of the party)
    const threshold = userIds.length * 0.5;
    const commonGenres = Object.keys(genreFrequency).filter(
      (g) => genreFrequency[g] >= threshold,
    );

    // Fallback if no intersection: take top 3 global genres of the group
    const targetGenres =
      commonGenres.length > 0
        ? commonGenres
        : Object.keys(genreFrequency)
            .sort((a, b) => genreFrequency[b] - genreFrequency[a])
            .slice(0, 3);

    // 4. Find Anime matching target genres
    const recommendations = await Anime.find({
      genres: { $in: targetGenres },
      rating: { $gte: 7.5 }, // Higher standard for groups
    })
      .sort({ rating: -1 })
      .limit(20);

    res.json({
      recommendations,
      commonGenres: targetGenres,
      partySize: users.length,
    });
  } catch (error) {
    console.error("Watch party error:", error);
    res.status(500).json({ message: "Error" });
  }
};
