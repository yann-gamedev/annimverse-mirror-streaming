const Anime = require("../models/Anime");
const Episode = require("../models/Episode");

// 📚 GET ALL ANIME (dengan advanced filters + pagination)
exports.getAllAnime = async (req, res) => {
  try {
    // Extract query parameters
    const {
      genres, // Multiple genres: "Action,Romance"
      sort = "latest",
      status, // "Ongoing" or "Completed"
      yearFrom,
      yearTo,
      page = 1,
      limit = 20,
      q, // Search query
    } = req.query;

    // Build query object
    let query = {};

    // Search by title (case-insensitive)
    if (q) {
      query.title = { $regex: q, $options: "i" };
    }

    // Filter by multiple genres (OR logic)
    if (genres) {
      const genreArray = genres.split(",").map((g) => g.trim());
      query.genres = { $in: genreArray };
    }

    // Filter by status
    if (status && status !== "All") {
      query.status = status;
    }

    // Filter by year range
    if (yearFrom || yearTo) {
      query.releaseYear = {};
      if (yearFrom) query.releaseYear.$gte = parseInt(yearFrom);
      if (yearTo) query.releaseYear.$lte = parseInt(yearTo);
    }

    // Sorting options
    const sortOptions = {
      latest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      rating: { rating: -1 },
      "title-asc": { title: 1 },
      "title-desc": { title: -1 },
      "year-desc": { releaseYear: -1 },
      "year-asc": { releaseYear: 1 },
    };

    const sortQuery = sortOptions[sort] || sortOptions["latest"];

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const totalAnimes = await Anime.countDocuments(query);
    const totalPages = Math.ceil(totalAnimes / parseInt(limit));

    // Execute query
    const animeList = await Anime.find(query)
      .sort(sortQuery)
      .skip(skip)
      .limit(parseInt(limit))
      .select("-__v");

    res.json({
      animes: animeList,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalAnimes,
        hasMore: parseInt(page) < totalPages,
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("❌ Error fetching anime:", error);
    res.status(500).json({
      message: "Gagal mengambil data anime",
      error: error.message,
    });
  }
};

// 2. Search Anime
exports.searchAnime = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) return res.json([]);

    const results = await Anime.find({
      title: { $regex: q, $options: "i" },
    }).limit(10);

    res.json(results);
  } catch (error) {
    res.status(500).json({ message: "Search Error", error: error.message });
  }
};

// 3. Ambil Detail Satu Anime
exports.getAnimeDetail = async (req, res) => {
  try {
    const anime = await Anime.findOne({ slug: req.params.slug });

    if (!anime) {
      return res.status(404).json({ message: "Anime tidak ditemukan" });
    }

    res.json(anime);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// 4. Tambah Anime Baru
exports.createAnime = async (req, res) => {
  try {
    const {
      title,
      slug,
      synopsis,
      genres,
      posterUrl,
      rating,
      status,
      releaseYear,
      totalEpisodes,
    } = req.body;

    if (!title || !slug) {
      return res.status(400).json({ message: "Judul dan Slug wajib diisi" });
    }

    const newAnime = await Anime.create({
      title,
      slug,
      synopsis,
      genres,
      posterUrl,
      rating,
      status,
      releaseYear,
      totalEpisodes,
    });

    res.status(201).json({ message: "Anime berhasil dibuat!", data: newAnime });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal membuat anime", error: error.message });
  }
};

// 5. Tambah Episode Baru ✅ VERSI FINAL (HAPUS DUPLIKAT)
exports.createEpisode = async (req, res) => {
  try {
    const { animeId, episodeNumber, title, gdriveId, duration } = req.body;

    // Validasi input
    if (!animeId || !episodeNumber || !gdriveId) {
      return res.status(400).json({
        message: "Anime, Episode Number, dan Google Drive ID wajib diisi!",
      });
    }

    // Cek apakah anime ada
    const anime = await Anime.findById(animeId);
    if (!anime) {
      return res.status(404).json({
        message: "Anime tidak ditemukan!",
      });
    }

    // Cek apakah episode sudah ada
    const exists = await Episode.findOne({
      anime: animeId,
      episodeNumber: episodeNumber,
    });

    if (exists) {
      return res.status(400).json({
        message: `Episode ${episodeNumber} sudah ada di database!`,
      });
    }

    // Buat episode baru
    const newEpisode = await Episode.create({
      anime: animeId,
      episodeNumber,
      title: title || `Episode ${episodeNumber}`,
      gdriveId,
      duration: duration || 24,
    });

    // 🔥 FIX: Update totalEpisodes di Anime
    await Anime.findByIdAndUpdate(animeId, {
      $inc: { totalEpisodes: 1 },
    });

    console.log(
      `✅ Episode ${episodeNumber} berhasil ditambahkan ke ${anime.title}`,
    );

    res.status(201).json({
      message: "Episode berhasil ditambahkan!",
      data: {
        episode: newEpisode,
        animeTitle: anime.title,
        totalEpisodes: anime.totalEpisodes + 1,
      },
    });
  } catch (error) {
    console.error("❌ Error Create Episode:", error);
    res.status(500).json({
      message: "Gagal menambah episode: " + error.message,
      error: error.stack,
    });
  }
};

// 6. Ambil List Episode
exports.getAnimeEpisodes = async (req, res) => {
  try {
    const { slug } = req.params;

    const anime = await Anime.findOne({ slug });
    if (!anime) {
      return res.status(404).json({ message: "Anime tidak ditemukan" });
    }

    const episodes = await Episode.find({ anime: anime._id })
      .sort({ episodeNumber: 1 })
      .select("-gdriveId");

    res.json(episodes);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// 7. Ambil Data untuk Nonton
exports.getWatchData = async (req, res) => {
  try {
    const { slug, eps } = req.params;

    const anime = await Anime.findOne({ slug });
    if (!anime) {
      return res.status(404).json({ message: "Anime tidak ditemukan" });
    }

    const episode = await Episode.findOne({
      anime: anime._id,
      episodeNumber: eps,
    });

    if (!episode) {
      return res.status(404).json({ message: "Episode belum tersedia" });
    }

    res.json({
      anime: {
        _id: anime._id,
        title: anime.title,
        slug: anime.slug,
        posterUrl: anime.posterUrl,
      },
      episode: episode,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
