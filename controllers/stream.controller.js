const { google } = require("googleapis");
const Episode = require("../models/Episode");
const path = require("path");
const fs = require("fs");

// Setup Auth Google
const KEY_FILE_PATH = path.join(__dirname, "../service-account.json");
const SCOPES = ["https://www.googleapis.com/auth/drive.readonly"];

let authOptions = { scopes: SCOPES };
let authInitError = null;

if (process.env.GOOGLE_CREDENTIALS) {
  // Vercel deployment: read credentials from env var
  try {
    authOptions.credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
  } catch (err) {
    authInitError = "GOOGLE_CREDENTIALS env var contains invalid JSON";
    console.error("❌ [Stream] " + authInitError);
  }
} else if (fs.existsSync(KEY_FILE_PATH)) {
  // Local dev: use service-account.json file
  authOptions.keyFile = KEY_FILE_PATH;
} else {
  authInitError = "No Google credentials found. Set GOOGLE_CREDENTIALS env var or place service-account.json in project root.";
  console.error("❌ [Stream] " + authInitError);
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
        let end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        end = Math.min(end, fileSize - 1);
        const chunksize = end - start + 1;

        const head = {
          "Content-Range": `bytes ${start}-${end}/${fileSize}`,
          "Accept-Ranges": "bytes",
          "Content-Length": chunksize,
          "Content-Type": "video/mp4",
        };

        res.writeHead(206, head);
        const stream = fs.createReadStream(videoPath, { start, end });
        stream.on("error", (err) => {
          console.error("❌ [Stream] Local file read error:", err.message);
          if (!res.headersSent) res.status(500).send("Error membaca file video.");
          else stream.destroy();
        });
        res.on("close", () => stream.destroy());
        stream.pipe(res);
      } else {
        const head = {
          "Content-Length": fileSize,
          "Content-Type": "video/mp4",
        };
        res.writeHead(200, head);
        const stream = fs.createReadStream(videoPath);
        stream.on("error", (err) => {
          console.error("❌ [Stream] Local file read error:", err.message);
          if (!res.headersSent) res.status(500).send("Error membaca file video.");
          else stream.destroy();
        });
        res.on("close", () => stream.destroy());
        stream.pipe(res);
      }
    } else {
      // ===== STREAM GOOGLE DRIVE =====
      
      // Check if auth was initialized properly
      if (authInitError) {
        console.error("❌ [Stream] Auth not configured:", authInitError);
        return res.status(500).send("Server belum dikonfigurasi untuk streaming cloud. Cek GOOGLE_CREDENTIALS.");
      }

      if (!episode.gdriveId || episode.gdriveId === "dummy_id" || episode.gdriveId.startsWith("dummy")) {
        return res.status(404).send("Video belum tersedia di cloud (Invalid ID)");
      }

      const fileId = episode.gdriveId;

      // Validate auth is still working before streaming
      try {
        await auth.getClient();
      } catch (authErr) {
        console.error("❌ [Stream] Google Auth failed:", authErr.message);
        return res.status(500).send(
          "Google Drive authentication gagal. Service account key mungkin expired atau revoked."
        );
      }

      // Stream directly from Google Drive
      const range = req.headers.range;
      
      // 1. Get file metadata for size
      const metaResponse = await drive.files.get({
        fileId: fileId,
        fields: "size, mimeType"
      });
      
      const fileSize = parseInt(metaResponse.data.size, 10);
      const mimeType = metaResponse.data.mimeType || "video/mp4";

      if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        let end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        end = Math.min(end, fileSize - 1);
        const chunksize = end - start + 1;

        const head = {
          "Content-Range": `bytes ${start}-${end}/${fileSize}`,
          "Accept-Ranges": "bytes",
          "Content-Length": chunksize,
          "Content-Type": mimeType,
        };

        res.writeHead(206, head);

        const options = {
          responseType: "stream",
          headers: { Range: `bytes=${start}-${end}` }
        };

        const response = await drive.files.get(
          { fileId: fileId, alt: "media" },
          options
        );

        response.data.on("error", (err) => {
          console.error("❌ [Stream] Google Drive stream error mid-transfer:", err.message);
          if (response.data && typeof response.data.destroy === "function") {
            response.data.destroy();
          }
        });

        res.on("close", () => {
          if (response.data && typeof response.data.destroy === "function") {
            response.data.destroy();
          }
        });

        response.data.pipe(res);
      } else {
        const head = {
          "Content-Length": fileSize,
          "Content-Type": mimeType,
        };
        res.writeHead(200, head);

        const options = { responseType: "stream" };
        const response = await drive.files.get(
          { fileId: fileId, alt: "media" },
          options
        );

        response.data.on("error", (err) => {
          console.error("❌ [Stream] Google Drive stream error mid-transfer:", err.message);
          if (response.data && typeof response.data.destroy === "function") {
            response.data.destroy();
          }
        });

        res.on("close", () => {
          if (response.data && typeof response.data.destroy === "function") {
            response.data.destroy();
          }
        });

        response.data.pipe(res);
      }
    }
  } catch (error) {
    console.error("❌ [Stream] Error:", error.message);
    
    if (res.headersSent) return;

    // Provide specific error messages based on Google API error codes
    const status = error.code || error.status || 500;
    
    if (status === 404) {
      return res.status(404).send(
        "File tidak ditemukan di Google Drive. gdriveId mungkin salah atau file sudah dihapus."
      );
    }
    
    if (status === 403) {
      return res.status(403).send(
        "Akses ditolak oleh Google Drive. Pastikan file sudah di-share ke service account: stream-bot@annimverse-storage.iam.gserviceaccount.com"
      );
    }

    if (status === 429) {
      return res.status(429).send(
        "Google Drive API quota exceeded. Coba lagi nanti."
      );
    }

    if (error.message && error.message.includes("invalid_grant")) {
      return res.status(500).send(
        "Google service account key sudah expired/revoked. Perlu generate key baru dari Google Cloud Console."
      );
    }

    res.status(500).send("Gagal memutar video: " + error.message);
  }
};
