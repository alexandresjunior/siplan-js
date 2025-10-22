import axios from 'axios';
import { isTokenExpired, getToken } from './utils/jwtUtils';

const api = axios.create({
  baseURL: 'http://localhost:8098',
});

api.interceptors.request.use(
  (config) => {
    const token = getToken();
    console.log('Interceptor de requisição:', { url: config.url, token });
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Erro no interceptor de requisição:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log('Resposta recebida:', response.config.url, response.status);
    return response;
  },
  (error) => {
    console.log('Interceptor de resposta acionado:', {
      status: error.response?.status,
      message: error.message,
      url: error.config?.url,
    });

    const token = getToken();
    if ((token && isTokenExpired(token)) || (error.response?.status === 401)) {
      console.log('Exibindo aviso de sessão expirada');

      const overlay = document.createElement('div');
      overlay.style.position = 'fixed';
      overlay.style.top = '0';
      overlay.style.left = '0';
      overlay.style.width = '100vw';
      overlay.style.height = '100vh';
      overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
      overlay.style.backdropFilter = 'blur(5px)';
      overlay.style.zIndex = '5000';
      overlay.style.display = 'flex';
      overlay.style.justifyContent = 'center';
      overlay.style.alignItems = 'center';

      const warning = document.createElement('div');
      warning.className = 'alert alert-warning';
      warning.style.backgroundColor = '#fff240ff';
      warning.style.color = '#4b4b4bff';
      warning.style.padding = '20px';
      warning.style.borderRadius = '5px';
      warning.style.textAlign = 'center';
      warning.style.fontSize = '15px';
      warning.style.zIndex = '5001';
      warning.style.minWidth = '300px';
       warning.style.fontFamily = 'Open Sans, sans-serif';
      warning.innerText = 'Sessão expirada. Faça login novamente. (3)';

      overlay.appendChild(warning);
      document.body.appendChild(overlay);

      let countdown = 3;
      const countdownInterval = setInterval(() => {
        countdown -= 1;
        if (countdown > 0) {
          warning.innerText = `Sessão expirada. Faça login novamente. (${countdown})`;
        } else {
          clearInterval(countdownInterval);
        }
      }, 1000);

      setTimeout(() => {
        console.log('Redirecionando para /');
        if (document.body.contains(overlay)) {
          document.body.removeChild(overlay);
        }
        localStorage.removeItem('token');
        window.location.href = '/';
      }, 3000);

      return Promise.reject(new Error('Sessão expirada'));
    }

    console.log('Propagando erro:', error.message);
    return Promise.reject(error);
  }
);

export default api;