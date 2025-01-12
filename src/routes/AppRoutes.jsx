import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'; // Importando Navigate
import Home from '../pages/Home';
import Events from '../pages/Events';
import '../assets/styles/css/bootstrap.min.css';

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        {/* Redireciona da raiz para /Home */}
        <Route path="/" element={<Navigate to="/Home" replace />} />
        {/* Define a rota para o componente Home */}
        <Route path="/home" element={<Home />} />
        {/* Adicione outras rotas conforme necessário */}
        <Route path="/events" element={<Events />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
