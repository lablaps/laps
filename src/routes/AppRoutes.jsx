// src/routes/AppRoutes.jsx
import React from 'react';
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Navigate 
} from 'react-router-dom';

// Import centralizado de components e pages
import { 
  Home, 
  About, 
  Contact, 
  Events, 
  News, 
  Projects 
} from '../pages';

function AppRoutes() {
  return (
    <Router>
      <Routes>
        {/* Rota "pai" com o MainLayout que contém Navbar/Footer */}
          {/* Redireciona "/" para "/Home" */}
          <Route index element={<Navigate to="/Home" replace />} />
          
          {/* Rotas filhas: Home, About, etc. */}
          <Route path="Home" element={<Home />} />
          <Route path="About" element={<About />} />
          <Route path="Contact" element={<Contact />} />
          <Route path="Events" element={<Events />} />
          <Route path="News" element={<News />} />
          <Route path="Projects" element={<Projects />} />
      </Routes>
    </Router>
  );
}

export default AppRoutes;
