import React from "react";
import "../assets/styles/css/About.css"; // <-- Importa o CSS acima
import Footer from "../pages/Footer"; 

function About() {
  return (
    <>
    <div className="about-container">
      <h1 className="about-title">Sobre o LAPS</h1>
      <p className="about-paragraph">
        O Laboratório de Aquisição e Processamento de Sinais (LAPS) é o epicentro tecnológico
        no campus universitário, onde mentes dedicadas exploram algoritmos inovadores para aprimorar
        a eficiência na interpretação de sinais. Equipado com tecnologia de ponta, o LAPS é mais do
        que um laboratório; é um berço de descobertas práticas que transcendem as fronteiras
        teóricas. Cada clique de teclado e análise de dados contribui para desvendar os segredos
        codificados nos sinais, moldando o futuro da comunicação e tecnologia de sensores.
      </p>

    </div>
    <Footer />
    </>
  );
}

export default About;
