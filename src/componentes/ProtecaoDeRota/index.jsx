import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token'); // Verifica o token no localStorage

  useEffect(() => {
    if (!token) {
      navigate('/'); // Redireciona para a rota raiz (Login) se não houver token
    }
  }, [token, navigate]);

  return token ? children : null; // Renderiza o conteúdo apenas se o token existir
};

export default ProtectedRoute;