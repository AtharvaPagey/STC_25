// src/api/axiosInstance.js
import axios from "axios";

const baseURL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:8000/api/v1";

const api = axios.create({
  baseURL,
  withCredentials: true, // backend sets cookies too
});

// Attach our backend JWT (accessToken) stored in localStorage
api.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem("ACCESS_TOKEN") || null;
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      // ignore
    }
    return config;
  },
  (err) => Promise.reject(err)
);

export default api;
