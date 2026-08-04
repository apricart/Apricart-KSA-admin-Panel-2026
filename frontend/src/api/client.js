import axios from "axios";

let baseURL = import.meta.env.VITE_API_BASE_URL || "http://185.164.25.196:8081/v1/";

// Mixed Content Shield: If served over HTTPS, use the Vercel server rewrite proxy (/api-proxy/)
if (typeof window !== "undefined" && window.location.protocol === "https:" && baseURL.startsWith("http://")) {
  baseURL = "/api-proxy/";
}

const apiClient = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
    Language: "ENG",
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
