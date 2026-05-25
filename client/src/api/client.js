// ============================================================
// Annimverse API Client
// ============================================================

class APIError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.data = data;
  }
}

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

class APIClient {
  constructor(baseURL = '/api') {
    this.baseURL = baseURL;
    this.maxRetries = 3;
    this.retryDelay = 1000;
    this.timeout = 30000;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    let lastError;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      try {
        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
          headers: {
            ...getAuthHeaders(),
            ...options.headers,
          },
        });

        clearTimeout(timeoutId);

        // Parse response body
        let data;
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          data = await response.json();
        } else {
          data = await response.text();
        }

        if (!response.ok) {
          const errorMsg = typeof data === 'object' && data !== null
            ? data.message || data.error || `Request failed with status ${response.status}`
            : `Request failed with status ${response.status}`;

          const error = new APIError(errorMsg, response.status, data);

          // Don't retry on client errors (4xx) except 408 (timeout) and 429 (rate limit)
          if (response.status >= 400 && response.status < 500 && response.status !== 408 && response.status !== 429) {
            throw error;
          }

          lastError = error;
        } else {
          return data;
        }
      } catch (err) {
        clearTimeout(timeoutId);

        if (err instanceof APIError) {
          // Already handled above — check if it's a 4xx that should not retry
          if (err.status >= 400 && err.status < 500 && err.status !== 408 && err.status !== 429) {
            throw err;
          }
          lastError = err;
        } else if (err.name === 'AbortError') {
          lastError = new APIError('Request timed out', 408, null);
        } else {
          lastError = new APIError(err.message || 'Network error', 0, null);
        }
      }

      // Wait before retry with exponential backoff
      if (attempt < this.maxRetries) {
        const delay = this.retryDelay * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    throw lastError;
  }

  get(endpoint, params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query.append(key, value);
      }
    });
    const queryString = query.toString();
    const fullEndpoint = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request(fullEndpoint, { method: 'GET' });
  }

  post(endpoint, body, options = {}) {
    const isFormData = body instanceof FormData;
    const fetchOptions = {
      method: 'POST',
      body: isFormData ? body : JSON.stringify(body),
      ...options,
    };
    if (isFormData) {
      // Let browser set Content-Type with boundary for FormData
      fetchOptions.headers = { ...options.headers };
    }
    return this.request(endpoint, fetchOptions);
  }

  put(endpoint, body, options = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
      ...options,
    });
  }

  delete(endpoint, options = {}) {
    return this.request(endpoint, {
      method: 'DELETE',
      ...options,
    });
  }
}

// Default API instance
const api = new APIClient('/api');

// ============================================================
// Auth API
// ============================================================
export const authAPI = {
  login(email, password) {
    return api.post('/auth/login', { email, password });
  },

  register(username, email, password) {
    return api.post('/auth/register', { username, email, password });
  },

  forgotPassword(email) {
    return api.post('/auth/forgot-password', { email });
  },

  resetPassword(email, code, newPassword) {
    return api.post('/auth/reset-password', { email, code, newPassword });
  },
};

// ============================================================
// Anime API
// ============================================================
export const animeAPI = {
  getAll(params = {}) {
    return api.get('/anime', params);
  },

  search(q, params = {}) {
    return api.get('/anime/search', { q, ...params });
  },

  getBySlug(slug) {
    return api.get(`/anime/${slug}`);
  },

  getEpisodes(slug) {
    return api.get(`/anime/${slug}/episodes`);
  },

  getWatchData(slug, eps) {
    return api.get(`/anime/${slug}/watch/${eps}`);
  },

  create(data) {
    return api.post('/anime', data);
  },

  createEpisode(data) {
    const isFormData = data instanceof FormData;
    return api.post('/anime/episode', data, isFormData ? {} : undefined);
  },
};

// ============================================================
// User API
// ============================================================
export const userAPI = {
  getProfile(id) {
    return api.get(`/users/${id}`);
  },

  updateProfile(id, data) {
    return api.put(`/users/${id}`, data);
  },

  uploadAvatar(id, formData) {
    return api.post(`/users/${id}/avatar`, formData);
  },
};

// ============================================================
// Interact API (Bookmarks, Likes, Comments, History)
// ============================================================
export const interactAPI = {
  toggleBookmark(animeId, userId) {
    return api.post('/interact/bookmark', { animeId, userId });
  },

  checkBookmark(animeId, userId) {
    return api.get('/interact/bookmark/check', { animeId, userId });
  },

  toggleLike(episodeId, userId) {
    return api.post('/interact/like', { episodeId, userId });
  },

  postComment(episodeId, userId, text) {
    return api.post('/interact/comment', { episodeId, userId, text });
  },

  getComments(episodeId) {
    return api.get(`/interact/comment/${episodeId}`);
  },

  addToHistory(userId, animeId, episodeId) {
    return api.post('/interact/history', { userId, animeId, episodeId });
  },

  getUserHistory(userId) {
    return api.get(`/interact/history/${userId}`);
  },
};

// ============================================================
// Stream API
// ============================================================
export const streamAPI = {
  getStreamUrl(episodeId) {
    return `/api/stream/${episodeId}`;
  },
};

// ============================================================
// Recommendations API
// ============================================================
export const recommendAPI = {
  getTrending(params = {}) {
    return api.get('/recommendations/trending', params);
  },

  getSimilar(animeId, params = {}) {
    return api.get(`/recommendations/similar/${animeId}`, params);
  },

  getPersonalized() {
    return api.get('/recommendations');
  },

  submitFeedback(animeId, type) {
    return api.post('/recommendations/feedback', { animeId, type });
  },

  getPersonalizedTrending() {
    return api.get('/recommendations/trending', { personalized: true });
  },
};

// ============================================================
// Requests API
// ============================================================
export const requestAPI = {
  getAll(params = {}) {
    return api.get('/requests', params);
  },

  getById(id) {
    return api.get(`/requests/${id}`);
  },

  create(data) {
    return api.post('/requests', data);
  },

  vote(id, voteType) {
    return api.put(`/requests/${id}/vote`, { voteType });
  },

  deleteRequest(id) {
    return api.delete(`/requests/${id}`);
  },

  updateStatus(id, status, adminNote) {
    return api.put(`/requests/${id}/status`, { status, adminNote });
  },
};

// ============================================================
// Admin API
// ============================================================
export const adminAPI = {
  getStats() {
    return api.get('/admin/stats');
  },

  createBadge(data) {
    return api.post('/admin/badge', data);
  },

  getUsers() {
    return api.get('/admin/users');
  },

  updateUserRole(id, role) {
    return api.put(`/admin/users/${id}/role`, { role });
  },
};

// ============================================================
// Badges API
// ============================================================
export const badgeAPI = {
  getUserBadges(userId) {
    return api.get(`/users/${userId}/badges`);
  },

  getAllBadges() {
    return api.get('/badges');
  },
};

// Export classes and utilities
export { APIClient, APIError, getAuthHeaders, api };
export default api;
