import axios from "axios";

// Create an Axios instance
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL, // http://localhost:8000/api/auth
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to attach the token automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers!["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
