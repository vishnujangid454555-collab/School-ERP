import axios from 'axios';

const TOKEN_KEY = 'school_erp_access_token';
const REFRESH_TOKEN_KEY = 'school_erp_refresh_token';
let refreshPromise = null;

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

const storedToken = localStorage.getItem(TOKEN_KEY);
if (storedToken) axiosClient.defaults.headers.common.Authorization = `Bearer ${storedToken}`;

function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem('school_erp_user');
  window.dispatchEvent(new Event('school-erp:logout'));
}

async function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = axios.post(
      `${axiosClient.defaults.baseURL}/auth/refresh`,
      { refreshToken: localStorage.getItem(REFRESH_TOKEN_KEY) },
      { headers: { 'Content-Type': 'application/json' } },
    ).then(({ data }) => {
      const session = data.data;
      localStorage.setItem(TOKEN_KEY, session.token);
      axiosClient.defaults.headers.common.Authorization = `Bearer ${session.token}`;
      return session.token;
    }).finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const request = error.config;
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (error.response?.status !== 401 || request?._retry || !refreshToken || request?.url?.endsWith('/auth/refresh')) {
      return Promise.reject(error);
    }

    request._retry = true;
    try {
      const token = await refreshAccessToken();
      request.headers.Authorization = `Bearer ${token}`;
      return axiosClient(request);
    } catch (refreshError) {
      clearSession();
      return Promise.reject(refreshError);
    }
  },
);

export default axiosClient;
