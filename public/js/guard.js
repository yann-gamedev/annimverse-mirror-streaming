/**
 * AUTH GUARD
 * Tugas: Mengecek apakah user punya 'tiket' (token) untuk masuk.
 * Jika tidak ada, tendang ke halaman login dengan pesan error.
 */

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    // 1. Cek Token
    if (!token || !user) {
        // Jika tidak ada token, berarti belum login.
        
        // Simpan pesan error agar bisa ditampilkan setelah redirect
        localStorage.setItem('auth_error', 'Anda harus login untuk mengakses halaman ini!');
        
        // Tendang ke halaman login
        window.location.href = 'login.html';
        return; // Hentikan script
    }

    // 2. (Opsional) Cek Token Expired
    // Nanti bisa kita tambahkan logika dekode JWT di sini
    // untuk memastikan tokennya belum kadaluarsa.
});

// Fungsi Logout (Bisa dipanggil dari tombol mana saja)
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Tampilkan pesan logout sukses (opsional)
    alert("Berhasil Logout!");
    window.location.href = 'index.html';
}