import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout to prevent hanging requests
});

// ── Request Interceptor ───────────────────────────────────────────────────────
// Attaches the JWT Bearer token to every outgoing request automatically.
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor ──────────────────────────────────────────────────────
// Handles 401 Unauthorized responses by attempting a token refresh.
// If refresh succeeds → retries the original request transparently.
// If refresh fails or no refresh token exists → clears session and redirects to login.
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only attempt refresh on 401 errors, and not for auth endpoints themselves
    const isAuthEndpoint = originalRequest.url?.includes('/api/auth/login')
      || originalRequest.url?.includes('/api/auth/refresh')
      || originalRequest.url?.includes('/api/auth/register')
      || originalRequest.url?.includes('/api/auth/logout');

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      const refreshToken = localStorage.getItem('refreshToken');

      // No refresh token at all — immediately force logout
      if (!refreshToken) {
        clearSessionAndRedirect();
        return Promise.reject(error);
      }

      // If already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers['Authorization'] = `Bearer ${token}`;
          return api(originalRequest);
        }).catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const res = await axios.post(`${BASE_URL}/api/auth/refresh`, {
          refreshToken,
        });

        if (res.status === 200 && res.data?.success) {
          const { accessToken, refreshToken: newRefreshToken } = res.data.data;
          localStorage.setItem('token', accessToken);
          if (newRefreshToken) {
            localStorage.setItem('refreshToken', newRefreshToken);
          }
          api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
          originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;

          processQueue(null, accessToken);
          return api(originalRequest);
        } else {
          processQueue(new Error('Token refresh returned unsuccessful response'));
          clearSessionAndRedirect();
          return Promise.reject(error);
        }
      } catch (refreshError) {
        processQueue(refreshError);
        clearSessionAndRedirect();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

/**
 * Clears all auth state from localStorage and redirects to login.
 * Used when token refresh fails or no refresh token is available.
 */
function clearSessionAndRedirect() {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  // Use replace to prevent back button returning to authenticated page
  if (!window.location.pathname.includes('/login')) {
    window.location.replace('/login?session=expired');
  }
}

export default api;
