import axios from "axios";
import { tokenEstaExpirado, obterToken } from "../utils/jwtUtils";
import { toast } from 'react-toastify';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BACKEND_URL,
});

api.interceptors.request.use(
  (config) => {
    const token = obterToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error("Erro no interceptor de requisição:", error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const token = obterToken();
    if ((token && tokenEstaExpirado(token)) || error.response?.status === 401) {
      toast.error("Sessão expirada. Faça login novamente.", {
        position: "top-center",
        autoClose: 3000,
        onClose: () => {
          localStorage.removeItem("token");
          window.location.href = "/";
        }
      });

      return Promise.reject(new Error("Sessão expirada"));
    }

    return Promise.reject(error);
  }
);

export default api;