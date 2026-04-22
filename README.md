<div align="center">
  <img src="https://via.placeholder.com/150x150/111827/FFFFFF?text=Annimverse" alt="Annimverse Logo" width="150" height="auto" />
  <h1>🌌 Annimverse</h1>
  
  <p>
    <strong>Platform Streaming & Rekomendasi Anime Berbasis Web</strong>
  </p>
  
  <p>
    <a href="https://github.com/yann-gamedev/annimverse-mirror-streaming"><img src="https://img.shields.io/badge/Status-Active-success.svg?style=for-the-badge" alt="Status" /></a>
    <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/Node.js-18.x-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" /></a>
    <a href="https://expressjs.com/"><img src="https://img.shields.io/badge/Express.js-4.x-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" /></a>
    <a href="https://www.mongodb.com/"><img src="https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" /></a>
  </p>
</div>

---

##  Tentang Projek

**Annimverse** adalah sebuah platform berbasis web (*Web App*) komprehensif yang dikhususkan bagi penggemar anime untuk menjelajahi, menonton (streaming), sekaligus mendapatkan rekomendasi anime terkini. Dirancang menggunakan arsitektur Node.js dan Express pada sisi *backend*, serta menggunakan Vanilla JS bertenaga Tailwind CSS pada sisi antarmukanya.

Platform ini hadir dengan berbagai fitur layaknya situs streaming kelas atas seperti sistem otentikasi pengguna, perlindungan keamanan API, sistem interaksi sosial (like/komentar/request), dan kemampuan *deploy* serverless ke Vercel!

##  Fitur Unggulan

-  **Sistem Autentikasi Solid**: Fitur *Login*, *Register*, sistem keamanan dengan JWT (JSON Web Tokens), fitur *Lupa Password* terintegrasi Email (SMTP), serta opsi akses tertutup (*Home Server Mode*).
-  **Penyimpanan Media Fleksibel (Dual-Mode)**: Mendukung *streaming* langsung dari *Cloud* (Google Drive) maupun secara lokal dari Server Hardisk (*Local Storage*), terkelola fleksibel lewat konfigurasi environment.
-  **Mirror Streaming System**: Menyediakan pengalaman menonton anime yang stabil menggunakan pemetaan *endpoint* streaming.
-  **Sistem Rekomendasi Pintar**: Suguhan katalog anime khusus berdasarkan algoritma rekomendasi tersendiri.
-  **Interaksi & Personalisasi Pengguna**: Sistem kustomisasi profil lanjutan (Bio, Tema UI, Daftar Favorit), integrasi riwayat *Continue Watching* (Lanjutkan Menonton), dan penyederhanaan data level untuk pengalaman pribadi yang lebih rapi.
-  **Tingkat Keamanan Tinggi**: Telah dilengkapi dengan *Rate Limiting*, Helmet (Security Headers), dan *Cross-Origin Resource Sharing* (CORS).
-  **Admin Dashboard**: Endpoint spesifik peruntukan admin untuk mengelola manajemen katalog anime dan mengatur permintaan (*requests*) tontonan dari *user*. 

##  Tech Stack (Teknologi Utama)

**Frontend:**
- HTML5, CSS3, & Vanilla JavaScript
- [Tailwind CSS](https://tailwindcss.com/) (Framework desain & utilitas antarmuka)
- Lucide Icons (Untuk pemanis ikon berkelas UI)

**Backend:**
- [Node.js](https://nodejs.org/) & [Express.js](https://expressjs.com/) (Web Server)
- [MongoDB Atlas](https://www.mongodb.com/atlas) with Mongoose (Database NoSQL)
- [Bcryptjs](https://www.npmjs.com/package/bcryptjs) & [JWT](https://jwt.io/) (Kriptografi Kredensial dan *Token*)
- [Nodemailer](https://nodemailer.com/about/) (Sistem Reset Kata Sandi Otomatis)

##  Struktur Direktori

Diorganisasi menggunakan pola **MVC (Model-View-Controller)** sederhana:
```text
annimverse/
│
├── config/             # Kunci dan konfigurasi koneksi MongoDB
├── controllers/        # Logika dari backend / API functions 
├── middleware/         # Autentikasi token JWT & interceptors
├── models/             # Schema/Struktur Mongoose (User, Anime, dsb)
├── public/             # File-file *Frontend* (HTML, Tailwind CSS, Media)
├── routes/             # Pemetaan masing-masing Endpoint API
├── services/           # Modul eksternal seperti Email Service SMTP
├── utils/              # Fungsi Bantuan Tambahan
├── vercel.json         # Konfigurasi Pendelegasian Deployment (Serverless)
├── server.js           # Titik Masuk (Entry Point Utama Aplikasi)
└── package.json        # Manifest Dependency Node.js
```

##  Panduan Instalasi (Development)

Tertarik berkontribusi atau menjalankan ini secara lokal (*locahost*)? Ikuti tahap-tahap simpel berikut:

1. **Clone repository ini**
   ```bash
   git clone https://github.com/yann-gamedev/annimverse-mirror-streaming.git
   cd annimverse
   ```

2. **Install semua *dependencies*** (Modul Node.js)
   ```bash
   npm install
   ```

3. **Konfigurasi Environment (*.env*)**
   Salin *template* dari `.env.example` lalu beri nama menjadi `.env`. Kemudian isinya dengan data Anda sendiri:
   ```env
   PORT=4000
   MONGO_URI=mongodb+srv://<username>:<password>@cluster/annimverse
   JWT_SECRET=buat_kunci_rahasia_aman_disini
   SMTP_HOST=smtp.gmail.com
   SMTP_USER=email_anda@gmail.com
   SMTP_PASS=app_password_email_anda
   
   # Setup Tambahan (Opsi Publik vs Home Server Lokal)
   ALLOW_PUBLIC_REGISTRATION=true
   STORAGE_PROVIDER=cloud
   ```

4. **Jalankan Aplikasi** 
   Gunakan Nodemon untuk *hot-reload* selama masa *development*:
   ```bash
   npm run dev
   ```
   > Server akan otomatis berjalan di `http://localhost:4000` 

##  Deployment (Publikasi ke Vercel)

Proyek ini sudah dikalibrasi 100% untuk dieksekusi di ranah [Vercel](https://vercel.com/) sebagai lingkungan *Serverless Functions*. 

* Cukup tautkan repositori GitHub ini ke dashboard Vercel Anda.
* Sangat Penting: **JANGAN LUPA menambahkan seluruh isi Environment Variables** (`.env`) ke tab pengaturan *Settings* -> **Environment Variables** milik Vercel. Tanpa ini, backend akan membeku (Error 500).
* Pastikan pula *Network Access* pada MongoDB Atlas Anda diatur ke *Allow Access from Anywhere* (`0.0.0.0/0`) karena API Vercel bergerak dari IP dinamis!

##  Lisensi Penggunaan

Didistribusikan oleh pengguna dan tidak memiliki lisensi resmi. Bebas dikerjakan ulang dan dipublikasikan sesuai kebutuhan standar kreativitas personal maupun edukasional.

---
> Digaungkan dengan penuh dedikasi oleh **[Yann-GameDev](https://github.com/yann-gamedev)** 
