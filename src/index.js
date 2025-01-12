import React from 'react';
import ReactDOM from 'react-dom/client'; // Biblioteca para renderizar o React no DOM
import App from './App'; // Componente principal da aplicação
import './assets/styles/css/bootstrap.min.css';
import './assets/styles/css/global.css'; // Se houver um arquivo CSS customizado.
import 'font-awesome/css/font-awesome.min.css'; // Se for necessário para Font Awesome.


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
