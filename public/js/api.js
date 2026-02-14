// Centralized API client with retry logic and error handling
class APIClient {
    constructor(baseURL = '', options = {}) {
        this.baseURL = baseURL;
        this.maxRetries = options.maxRetries || 3;
        this.retryDelay = options.retryDelay || 1000;
        this.timeout = options.timeout || 30000;
    }

    async request(url, options = {}) {
        const fullURL = this.baseURL + url;
        let lastError;

        for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
            try {
                // Add timeout to request
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), this.timeout);

                const response = await fetch(fullURL, {
                    ...options,
                    signal: controller.signal,
                });

                clearTimeout(timeoutId);

                // Handle HTTP errors
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new APIError(
                        errorData.message || `HTTP ${response.status}: ${response.statusText}`,
                        response.status,
                        errorData
                    );
                }

                return await response.json();

            } catch (error) {
                lastError = error;

                // Don't retry on client errors  (4xx) or abort
                if (error.name === 'AbortError' || (error.status >= 400 && error.status < 500)) {
                    throw error;
                }

                // If not last attempt, wait and retry
                if (attempt < this.maxRetries) {
                    const delay = this.retryDelay * Math.pow(2, attempt); // Exponential backoff
                    console.log(`🔄 Retry ${attempt + 1}/${this.maxRetries} after ${delay}ms...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                    continue;
                }
            }
        }

        // All retries failed
        throw lastError;
    }

    async get(url, options = {}) {
        return this.request(url, { ...options, method: 'GET' });
    }

    async post(url, data, options = {}) {
        return this.request(url, {
            ...options,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            body: JSON.stringify(data),
        });
    }

    async put(url, data, options = {}) {
        return this.request(url, {
            ...options,
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            body: JSON.stringify(data),
        });
    }

    async delete(url, options = {}) {
        return this.request(url, { ...options, method: 'DELETE' });
    }
}

class APIError extends Error {
    constructor(message, status, data) {
        super(message);
        this.name = 'APIError';
        this.status = status;
        this.data = data;
    }
}

// Create default instance
const api = new APIClient('/api');

// Helper for authenticated requests
function getAuthHeaders() {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
}
