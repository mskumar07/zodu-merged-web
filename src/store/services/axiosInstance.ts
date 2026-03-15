// Z-T71
import axios from "axios";

// const baseURL = import.meta.env.VITE_API_BASE_URL;
   const baseURL = "https://api.zodusolutions.cloud";
      // const baseURL = " http://localhost:5000";
// const baseURL = "http://192.168.0.117:5000/"; // For local testing
const axiosInstance = axios.create({
  baseURL: baseURL, // your backend URL
});

// Example interceptor: attach token if exists
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default axiosInstance;
