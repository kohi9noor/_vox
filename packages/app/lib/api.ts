import axios from "axios";

const bashUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";

const api = axios.create({
  baseURL: bashUrl,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    console.log("API ERROR:", error);
    return Promise.reject(error);
  }
);

export default api;
