import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'; // Importando Navigate
import Home from '../pages/Home';
import Sobre from '../pages/About';
import Projetos from '../pages/Projects';
import Noticias from '../pages/News';
import Contato from '../pages/Contact';
import Events from '../pages/Events';
import '../assets/styles/css/bootstrap.min.css';

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        {/* Redireciona da raiz para /Home */}
        <Route path="/" element={<Navigate to="/Home" replace />} />
        {/* Define a rota para o componente Home */}
        <Route path="/Home" element={<Home />} />
        <Route path="/About" element={<Sobre />} />
        <Route path="/News" element={<Noticias />} />
        <Route path="/Projects" element={<Projetos />} />
        <Route path="/Contact" element={<Contato />} />
        {/* Adicione outras rotas conforme necessário */}
        <Route path="/events" element={<Events />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
