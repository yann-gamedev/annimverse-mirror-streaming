// Offline Indicator & Connection Status Manager
class OfflineIndicator {
    constructor() {
        this.banner = null;
        this.isOnline = navigator.onLine;
        this.checkInterval = null;
        this.init();
    }

    init() {
        // Create banner element (hidden by default)
        this.createBanner();

        // Listen to online/offline events
        window.addEventListener('online', () => this.handleOnline());
        window.addEventListener('offline', () => this.handleOffline());

        // Verify actual connectivity every 30 seconds
        this.checkInterval = setInterval(() => this.verifyConnection(), 30000);

        // Initial check - verify we're really online
        this.verifyConnection();
    }

    async verifyConnection() {
        // Double-check if we can actually reach the server
        try {
            const response = await fetch('/api/status', {
                method: 'GET',
                cache: 'no-cache',
                signal: AbortSignal.timeout(5000) // 5 second timeout
            });

            if (response.ok && !this.isOnline) {
                // We're actually online but state was wrong
                this.handleOnline();
            }
        } catch (error) {
            // Only show offline if navigator also says offline
            if (!navigator.onLine && !this.isOnline) {
                this.show();
            }
        }
    }

    createBanner() {
        this.banner = document.createElement('div');
        this.banner.id = 'offline-banner';
        this.banner.className = 'fixed top-0 left-0 right-0 z-50 bg-yellow-600 text-white px-4 py-3 text-center text-sm font-medium transform transition-transform duration-300 -translate-y-full';
        this.banner.innerHTML = `
      <div class="flex items-center justify-center gap-2">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" />
        </svg>
        <span>You're offline. Some features may not work.</span>
      </div>
    `;
        document.body.appendChild(this.banner);
    }

    show() {
        if (this.banner && !this.isOnline) {
            this.banner.classList.remove('-translate-y-full');
            this.banner.classList.add('translate-y-0');
        }
    }

    hide() {
        if (this.banner) {
            this.banner.classList.remove('translate-y-0');
            this.banner.classList.add('-translate-y-full');
        }
    }

    handleOnline() {
        this.isOnline = true;
        this.hide();
        console.log('✅ Connection restored');

        // Trigger custom event
        window.dispatchEvent(new CustomEvent('connection-restored'));
    }

    handleOffline() {
        this.isOnline = false;

        // Verify it's really offline before showing banner
        this.verifyConnection();

        console.log('⚠️  Connection lost (verifying...)');

        // Trigger custom event
        window.dispatchEvent(new CustomEvent('connection-lost'));
    }

    getStatus() {
        return this.isOnline;
    }

    destroy() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
        }
        if (this.banner) {
            this.banner.remove();
        }
    }
}

// Initialize offline indicator when DOM is ready ONLY if online
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        // Only initialize if we're actually offline
        if (!navigator.onLine) {
            window.offlineIndicator = new OfflineIndicator();
        } else {
            console.log('✅ Online - offline indicator not needed');
        }
    });
} else {
    if (!navigator.onLine) {
        window.offlineIndicator = new OfflineIndicator();
    } else {
        console.log('✅ Online - offline indicator not needed');
    }
}
