import axios from 'axios';

// 1. Determine the Base URL from Netlify environment variables
// Falls back to localhost if the variable isn't set
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

console.log(`🔌 Connecting to LocalTunnel at: ${API_BASE_URL}`);

// 2. Create Axios Instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    // ADDED: Bypass LocalTunnel interstitial/password page
    'bypass-tunnel-reminder': 'true',
    // Keep this for Ngrok compatibility if needed
    'ngrok-skip-browser-warning': 'true'
  },
});

// 3. Token Interceptor (Preserves your authentication session)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;