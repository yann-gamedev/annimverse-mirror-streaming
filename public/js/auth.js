const API_URL = '/api/auth';

// --- FUNGSI CUSTOM TOAST (ALERT KEREN) ---
function showToast(message, type = 'success') {
    // 1. Cek apakah container sudah ada? Kalau belum, buat.
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }

    // 2. Buat elemen toast
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    // Icon berdasarkan tipe
    const icon = type === 'success' ? 'check-circle' : 'alert-circle';
    const title = type === 'success' ? 'Berhasil!' : 'Oops!';
    const color = type === 'success' ? 'text-green-500' : 'text-red-500';

    toast.innerHTML = `
        <div class="toast-header ${color}">
            <i data-lucide="${icon}" class="w-4 h-4"></i>
            <span>${title}</span>
        </div>
        <div class="toast-body">${message}</div>
    `;

    // 3. Masukkan ke container
    container.appendChild(toast);
    
    // Render icon Lucide yang baru ditambahkan
    if (window.lucide) lucide.createIcons();

    // 4. Trigger Animasi Masuk (kasih delay dikit biar CSS transisi jalan)
    requestAnimationFrame(() => {
        toast.classList.add('show');
    });

    // 5. Hapus otomatis setelah 3 detik
    setTimeout(() => {
        toast.classList.remove('show'); // Animasi keluar
        setTimeout(() => {
            toast.remove(); // Hapus dari DOM
        }, 400); // Tunggu animasi selesai
    }, 3000);
}

// --- LOGIKA REGISTER ---
const handleRegister = async (e) => {
    e.preventDefault(); 
    
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const btn = e.target.querySelector('button');

    const originalText = btn.innerHTML; // Simpan isi asli (termasuk icon)
    btn.innerHTML = `<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i> Loading...`; // Animasi loading di tombol
    btn.disabled = true;
    if (window.lucide) lucide.createIcons();

    try {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });

        const result = await response.json();

        if (response.ok) {
            showToast(result.message, 'success'); // Panggil Toast Sukses
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500); // Tunggu 1.5 detik biar user baca notif dulu
        } else {
            showToast(result.message, 'error'); // Panggil Toast Error
        }

    } catch (error) {
        console.error(error);
        showToast("Gagal terhubung ke server!", 'error');
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
        if (window.lucide) lucide.createIcons();
    }
};

// --- LOGIKA LOGIN ---
const handleLogin = async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const btn = e.target.querySelector('button');

    const originalText = btn.innerHTML;
    btn.innerHTML = `<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i> Masuk...`;
    btn.disabled = true;
    if (window.lucide) lucide.createIcons();

    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const result = await response.json();

        if (response.ok) {
            localStorage.setItem('token', result.token);
            localStorage.setItem('user', JSON.stringify(result.user));

            showToast(`Selamat datang, ${result.user.username}!`, 'success');
            setTimeout(() => {
                window.location.href = 'menu.html';
            }, 1500);
        } else {
            showToast(result.message, 'error');
        }

    } catch (error) {
        console.error(error);
        showToast("Gagal terhubung ke server!", 'error');
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
        if (window.lucide) lucide.createIcons();
    }
};

// --- INIT ---
document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
    if (registerForm) registerForm.addEventListener('submit', handleRegister);

    const loginForm = document.getElementById('loginForm');
    if (loginForm) loginForm.addEventListener('submit', handleLogin);
});