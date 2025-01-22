import React from "react";
import "../assets/styles/css/About.css"; // <-- Importa o CSS acima

function About() {
  return (
    <>
      {/* Header Start */}
      <div className="container-fluid bg-primary py-5 mb-5 page-header">
        <div className="container py-5">
          <div className="row justify-content-center">
            <div className="col-lg-10 text-center">
              <h1 className="display-3 text-white animated slideInDown">
                Sobre
              </h1>
              <nav aria-label="breadcrumb">
                <ol className="breadcrumb justify-content-center">
                  <li className="breadcrumb-item">
                    <a className="text-white" href="/">
                      Home
                    </a>
                  </li>
                  <li
                    className="breadcrumb-item text-white active"
                    aria-current="page"
                  >
                    Sobre
                  </li>
                </ol>
              </nav>
            </div>
          </div>
        </div>
      </div>
      {/* Header End */}
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
    </>
  );
}

export default About;
