const jwt = require('jsonwebtoken');

// Middleware untuk memproteksi Rute
exports.protect = async (req, res, next) => {
    let token;

    // 1. Cek apakah ada token di Header (Authorization: Bearer <token>)
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Ambil tokennya saja (buang kata 'Bearer ')
            token = req.headers.authorization.split(' ')[1];

            // 2. Verifikasi Token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // 3. Simpan data user ke dalam Request (req.user)
            // Supaya controller di depannya tahu siapa yang sedang akses
            req.user = decoded; 

            next(); // Lanjut ke controller berikutnya
        } catch (error) {
            console.error(error);
            return res.status(401).json({ message: "Sesi habis, silakan login ulang." });
        }
    }

    if (!token) {
        return res.status(401).json({ message: "Akses ditolak, tidak ada token." });
    }
};