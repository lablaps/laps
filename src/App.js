import React from 'react';
import AppRoutes from './routes/AppRoutes';
import Navbar from './components/Navbar';
import './assets/styles/css/bootstrap.min.css'

const App = () => {
  return (
    <>
      <Navbar />
      <AppRoutes />
    </>
  );
};

export default App;
