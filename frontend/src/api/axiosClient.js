import axios from 'axios';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  'http://localhost:8000/api';

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Access Token
axiosClient.interceptors.request.use(
  (config) => {
    const tokens = localStorage.getItem('merzado_tokens');
    if (tokens) {
      try {
        const { access } = JSON.parse(tokens);
        if (access) {
          config.headers.Authorization = `Bearer ${access}`;
        }
      } catch (e) {
        console.error('Error parsing stored tokens:', e);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle Token Expiration & Refresh
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes('/auth/login/') &&
      !originalRequest.url.includes('/auth/register/') &&
      !originalRequest.url.includes('/auth/refresh/')
    ) {
      originalRequest._retry = true;
      const tokensStr = localStorage.getItem('merzado_tokens');

      if (tokensStr) {
        try {
          const tokens = JSON.parse(tokensStr);
          if (tokens.refresh) {
            // Attempt to refresh access token
            const refreshResponse = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
              refresh: tokens.refresh,
            });

            const newAccess = refreshResponse.data.access;
            const updatedTokens = { ...tokens, access: newAccess };
            localStorage.setItem('merzado_tokens', JSON.stringify(updatedTokens));

            originalRequest.headers.Authorization = `Bearer ${newAccess}`;
            return axiosClient(originalRequest);
          }
        } catch (refreshErr) {
          console.error('Failed to refresh authentication token:', refreshErr);
          localStorage.removeItem('merzado_tokens');
          localStorage.removeItem('merzado_user');
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
