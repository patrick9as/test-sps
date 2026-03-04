import axios from "axios";

export const AUTH_TOKEN_KEY = "auth_token";
export const AUTH_USER_KEY = "auth_user";

const baseURL = import.meta.env.VITE_SERVER_URL || "";

/** URL da documentação Swagger (abre em nova aba). */
export const getApiDocsUrl = () => (baseURL.replace(/\/$/, "") || "http://localhost:3000") + "/api-docs";

const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(AUTH_USER_KEY);
      const path = window.location.pathname || "";
      if (!path.endsWith("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
