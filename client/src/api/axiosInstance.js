// client/src/api/axiosInstance.js
import axios from "axios";

const API_BASE = "https://placement-platform-s-2.onrender.com";

const api = axios.create({
  baseURL: API_BASE,             // e.g. https://placement-platform-s-2.onrender.com/api
  withCredentials: true,
  headers: { "Content-Type": "application/json" }
});

// --- attach token on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    // IMPORTANT: Bearer prefix (server expects this)
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    delete config.headers.Authorization;
  }
  return config;
});

// --- optional: global 401 handler
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      // token missing/invalid/expired — log out locally
      localStorage.removeItem("token");
      // optionally redirect to login:
      // window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default api;
