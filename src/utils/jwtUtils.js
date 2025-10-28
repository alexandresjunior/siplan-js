import { jwtDecode } from 'jwt-decode';

export const tokenEstaExpirado = (token) => {
  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  } catch (error) {
    return true;
  }
};

export const obterToken = () => {
  return localStorage.getItem('token');
};