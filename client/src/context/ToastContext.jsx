import { createContext, useContext, useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

const TOAST_ICONS = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const TOAST_COLORS = {
  success: '#22c55e',
  error: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',
};

let toastIdCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef({});

  const removeToast = useCallback((id) => {
    // Start exit animation
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isExiting: true } : t))
    );

    // Remove after animation completes
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
      if (timersRef.current[id]) {
        clearTimeout(timersRef.current[id]);
        delete timersRef.current[id];
      }
    }, 300);
  }, []);

  const addToast = useCallback(
    (message, type = 'info', duration = 4000) => {
      const id = ++toastIdCounter;

      setToasts((prev) => [
        ...prev,
        { id, message, type, isExiting: false },
      ]);

      if (duration > 0) {
        timersRef.current[id] = setTimeout(() => {
          removeToast(id);
        }, duration);
      }

      return id;
    },
    [removeToast]
  );

  const success = useCallback(
    (msg, duration) => addToast(msg, 'success', duration),
    [addToast]
  );

  const error = useCallback(
    (msg, duration) => addToast(msg, 'error', duration),
    [addToast]
  );

  const warning = useCallback(
    (msg, duration) => addToast(msg, 'warning', duration),
    [addToast]
  );

  const info = useCallback(
    (msg, duration) => addToast(msg, 'info', duration),
    [addToast]
  );

  const value = {
    addToast,
    removeToast,
    success,
    error,
    warning,
    info,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {createPortal(
        <div className="toast-container">
          {toasts.map((toast) => {
            const IconComponent = TOAST_ICONS[toast.type] || Info;
            const borderColor = TOAST_COLORS[toast.type] || TOAST_COLORS.info;

            return (
              <div
                key={toast.id}
                className={`toast toast-${toast.type}${toast.isExiting ? ' toast-exiting' : ''}`}
                role="alert"
                aria-live="polite"
              >
                <IconComponent
                  size={20}
                  style={{ color: borderColor, flexShrink: 0, marginTop: '1px' }}
                />
                <p style={{ flex: 1, fontSize: '0.9rem', lineHeight: 1.5, color: '#e0e0e0', margin: 0 }}>
                  {toast.message}
                </p>
                <button
                  onClick={() => removeToast(toast.id)}
                  aria-label="Dismiss notification"
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '2px',
                    color: '#6b6b75',
                    flexShrink: 0,
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#e0e0e0')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#6b6b75')}
                >
                  <X size={16} />
                </button>
              </div>
            );
          })}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export default ToastContext;
