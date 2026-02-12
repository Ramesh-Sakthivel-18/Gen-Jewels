import axios from 'axios';

// 1. Determine the Base URL
// Matches your Netlify Variable "VITE_API_URL"
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

console.log(`🔌 Connecting to Backend at: ${API_BASE_URL}`);

// 2. Create Axios Instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    // MANDATORY: This bypasses the Ngrok "Visit Site" warning page
    'ngrok-skip-browser-warning': 'true'
  },
});

// 3. Add Token Interceptor (Keeps you logged in)
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