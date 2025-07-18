import axios from "axios";

const api = axios.create({
  baseURL: "http://185.23.236.113:8000/api/",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Интерцептор для обработки 401 и обновления токена
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      const refresh = localStorage.getItem("refresh");
      if (refresh) {
        try {
          const res = await axios.post("http://185.23.236.113:8000/api/token/refresh/", {
            refresh,
          });
          localStorage.setItem("access", res.data.access);
          api.defaults.headers.common["Authorization"] = "Bearer " + res.data.access;
          originalRequest.headers["Authorization"] = "Bearer " + res.data.access;
          return api(originalRequest);
        } catch (err) {
          // Refresh токен невалиден — принудительный logout
          localStorage.removeItem("access");
          localStorage.removeItem("refresh");
          window.location.href = "/login";
        }
      } else {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;