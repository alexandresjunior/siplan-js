import { jwtDecode } from 'jwt-decode';

export const isTokenExpired = (token) => {
  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    console.log('Exp:', decoded.exp, 'Current:', currentTime, 'Expirado?', decoded.exp < currentTime);
    return decoded.exp < currentTime;
  } catch (error) {
    console.log('Erro ao decodificar token:', error);
    return true;
  }
};

export const getToken = () => {
  return localStorage.getItem('token');
};