/**
 * Toast Notification System for Annimverse
 * Modern replacement for alert() with smooth animations
 */

const Toast = {
    /**
     * Show a toast notification
     * @param {string} message - The message to display
     * @param {string} type - Type: 'success', 'error', 'info', 'warning'
     * @param {number} duration - Duration in ms (default: 3000)
     */
    show(message, type = 'info', duration = 3000) {
        // Create toast container if it doesn't exist
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.className = 'toast-container';
            document.body.appendChild(container);
        }

        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast toast-${type} toast-enter`;

        // Icon based on type
        const icons = {
            success: 'check-circle',
            error: 'x-circle',
            warning: 'alert-triangle',
            info: 'info'
        };

        toast.innerHTML = `
            <i data-lucide="${icons[type]}" class="toast-icon"></i>
            <span class="toast-message">${message}</span>
        `;

        container.appendChild(toast);

        // Re-render Lucide icons for the new toast
        lucide.createIcons();

        // Trigger enter animation
        setTimeout(() => {
            toast.classList.remove('toast-enter');
            toast.classList.add('toast-visible');
        }, 10);

        // Auto remove after duration
        setTimeout(() => {
            toast.classList.remove('toast-visible');
            toast.classList.add('toast-exit');

            setTimeout(() => {
                toast.remove();

                // Remove container if no toasts left
                if (container.children.length === 0) {
                    container.remove();
                }
            }, 300);
        }, duration);
    },

    success(message, duration = 3000) {
        this.show(message, 'success', duration);
    },

    error(message, duration = 4000) {
        this.show(message, 'error', duration);
    },

    warning(message, duration = 3500) {
        this.show(message, 'warning', duration);
    },

    info(message, duration = 3000) {
        this.show(message, 'info', duration);
    }
};

// Make Toast globally available
window.Toast = Toast;
