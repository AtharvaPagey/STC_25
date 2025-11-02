import axios from "axios";
import { getAuth, signOut } from "firebase/auth";
import { app } from "../firebaseConfig"; // Make sure this path is correct

const baseURL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:8000/api/v1";

const api = axios.create({
  baseURL,
  withCredentials: true,
});

let isRedirecting = false;

api.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem("ACCESS_TOKEN") || null;
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {}
    return config;
  },
  (err) => Promise.reject(err)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response ? error.response.status : null;

    if (status === 401) {
      if (!isRedirecting && window.location.pathname !== "/login") {
        isRedirecting = true;

        localStorage.removeItem("ACCESS_TOKEN");

        const auth = getAuth(app);
        signOut(auth).finally(() => {
          window.location.href = "/login";
        });
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;