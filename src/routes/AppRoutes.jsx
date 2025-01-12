import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'; // Importando Navigate
import Home from '../pages/Home';
import '../assets/styles/css/bootstrap.min.css';

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        {/* Redireciona da raiz para /Home */}
        <Route path="/" element={<Navigate to="/Home" replace />} />
        {/* Define a rota para o componente Home */}
        <Route path="/Home" element={<Home />} />
        {/* Adicione outras rotas conforme necessário */}
      </Routes>
    </Router>
  );
};

export default AppRoutes;
