const { google } = require("googleapis");
const Episode = require("../models/Episode");
const path = require("path");
const fs = require("fs");

// Setup Auth Google
// Pastikan service-account.json ada di folder root project (sejajar server.js)
const KEY_FILE_PATH = path.join(__dirname, "../service-account.json");
const SCOPES = ["https://www.googleapis.com/auth/drive.readonly"];

let authOptions = { scopes: SCOPES };

if (process.env.GOOGLE_CREDENTIALS) {
  // Apabila dijalankan di Vercel, kita akan membaca JSON secara utuh dari Environtment Variables
  try {
    authOptions.credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
  } catch (err) {
    console.error("Gagal melakukan parse GOOGLE_CREDENTIALS dari ENV");
  }
} else {
  // Jika lokal / dev mode, gunakan file json standard
  authOptions.keyFile = KEY_FILE_PATH;
}

const auth = new google.auth.GoogleAuth(authOptions);

const drive = google.drive({ version: "v3", auth });

exports.streamVideo = async (req, res) => {
  try {
    const episodeId = req.params.id;
    const episode = await Episode.findById(episodeId);

    if (!episode) return res.status(404).send("Episode tidak ditemukan");

    const isLocalProvider = process.env.STORAGE_PROVIDER === "local";

    if (isLocalProvider) {
      // ===== STREAM LOKAL =====
      if (!episode.localPath) {
        return res.status(404).send("File lokal video belum diatur.");
      }
      
      // Ambil path aman yang relatif terhadap folder utama jika tidak absolut
      const videoPath = path.resolve(episode.localPath);
      if (!fs.existsSync(videoPath)) {
        return res.status(404).send("File fisik video tidak ditemukan di server lokal.");
      }

      const stat = fs.statSync(videoPath);
      const fileSize = stat.size;
      const range = req.headers.range;

      if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunksize = end - start + 1;

        const head = {
          "Content-Range": `bytes ${start}-${end}/${fileSize}`,
          "Accept-Ranges": "bytes",
          "Content-Length": chunksize,
          "Content-Type": "video/mp4",
        };

        res.writeHead(206, head);
        fs.createReadStream(videoPath, { start, end }).pipe(res);
      } else {
        const head = {
          "Content-Length": fileSize,
          "Content-Type": "video/mp4",
        };
        res.writeHead(200, head);
        fs.createReadStream(videoPath).pipe(res);
      }
    } else {
      // ===== STREAM GOOGLE DRIVE =====
      // Cek apakah ID-nya masih dummy?
      if (!episode.gdriveId || episode.gdriveId === "dummy_id") {
        return res.status(404).send("Video belum tersedia di cloud (Invalid ID)");
      }

      const fileId = episode.gdriveId;

      // 1. Ambil Info File dari Google
      const fileMetadata = await drive.files.get({
        fileId: fileId,
        fields: "size, mimeType",
      });

      const fileSize = parseInt(fileMetadata.data.size);
      const range = req.headers.range;

      // 2. Streaming dengan Range (Chunking)
      if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunksize = end - start + 1;

        const head = {
          "Content-Range": `bytes ${start}-${end}/${fileSize}`,
          "Accept-Ranges": "bytes",
          "Content-Length": chunksize,
          "Content-Type": "video/mp4",
        };

        res.writeHead(206, head);

        const response = await drive.files.get(
          { fileId: fileId, alt: "media" },
          { responseType: "stream", headers: { Range: `bytes=${start}-${end}` } },
        );

        response.data.pipe(res);
      } else {
        const head = {
          "Content-Length": fileSize,
          "Content-Type": "video/mp4",
        };
        res.writeHead(200, head);
        const response = await drive.files.get(
          { fileId: fileId, alt: "media" },
          { responseType: "stream" },
        );
        response.data.pipe(res);
      }
    }
  } catch (error) {
    console.error("Stream Error:", error.message);
    // Jika errornya "File not found", berarti ID di database salah
    if (!res.headersSent) res.status(500).send("Gagal memutar video.");
  }
};
