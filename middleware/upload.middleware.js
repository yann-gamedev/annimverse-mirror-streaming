const multer = require("multer");
const path = require("path");

// 1. Konfigurasi Gudang Penyimpanan
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Tentukan folder penyimpanan
    cb(null, "storage/avatars/");
  },
  filename: function (req, file, cb) {
    // Ganti nama file agar unik (avatar-angkaacak.jpg)
    // Ini mencegah file lama tertimpa jika ada user upload nama file yang sama
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "avatar-" + uniqueSuffix + path.extname(file.originalname));
  },
});

// 2. Filter Jenis File (Hanya Gambar)
const fileFilter = (req, file, cb) => {
  // Cek apakah tipe filenya image/jpeg, image/png, dll
  if (file.mimetype.startsWith("image/")) {
    cb(null, true); // Boleh masuk
  } else {
    cb(new Error("Hanya boleh upload file gambar!"), false); // Tolak
  }
};

// 3. Inisialisasi Multer
const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // Maksimal ukuran 2MB
  fileFilter: fileFilter,
});

module.exports = upload;
