import React from 'react';
import ReactDOM from 'react-dom/client'; // Biblioteca para renderizar o React no DOM
import './index.css'; // Importação do arquivo global de estilos
import App from './App'; // Componente principal da aplicação
import './assets/styles/css/bootstrap.min.css'

// Seleciona o elemento com o ID 'root' no HTML
const root = ReactDOM.createRoot(document.getElementById('root'));

// Renderiza o aplicativo React no DOM
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Configuração opcional para medir métricas de performance
// Você pode usar: reportWebVitals(console.log) ou enviar os dados para um serviço de análise
