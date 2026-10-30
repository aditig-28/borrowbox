import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5053/api",
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("borrowbox_token");
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    // If token expired on an authenticated call, clear expired session
    if (error.response?.status === 401) {
      const url = error.config?.url || "";
      const isAuthUrl = url.includes("/login") || url.includes("/register") || url.includes("/mfa");
      if (!isAuthUrl && localStorage.getItem("borrowbox_token")) {
        localStorage.removeItem("borrowbox_token");
        localStorage.removeItem("borrowbox_user");
      }
    }
    return Promise.reject(error);
  }
);

export default API;
