import React from "react";
import "../assets/styles/css/Projects.css"; // Importe o CSS específico para projetos

function Projects() {
  return (
    <>
    {/* Header Start */}
    <div className="container-fluid bg-primary py-5 mb-5 page-header">
        <div className="container py-5">
          <div className="row justify-content-center">
            <div className="col-lg-10 text-center">
              <h1 className="display-3 text-white animated slideInDown">
                Projetos
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
                    Projetos
                  </li>
                </ol>
              </nav>
            </div>
          </div>
        </div>
      </div>
      {/* Header End */}
    <div className="projects-container">
      <h1 className="projects-title">Projetos do LAPS</h1>
      <p className="projects-intro">
        Aqui você encontra alguns dos principais projetos desenvolvidos pelo 
        Laboratório de Aquisição e Processamento de Sinais (LAPS). Pesquisadores, 
        professores e estudantes trabalham em parceria para levar inovação e soluções 
        práticas a diversas áreas, tais como saúde, meio ambiente e inteligência artificial.
      </p>

      <div className="projects-grid">
        {/* Projeto 1 */}
        <div className="project-card">
          <h3 className="project-card-title">Avaliação da Qualidade do Sono</h3>
          <p className="project-card-desc">
            Pesquisadores: Carlos Magno Sousa, Georlene Lima Morais.
          </p>
        </div>

        {/* Projeto 2 */}
        <div className="project-card">
          <h3 className="project-card-title">
            Sistema de Auxílio ao Diagnóstico de Câncer
          </h3>
          <p className="project-card-desc">
            Propor um sistema de auxílio ao diagnóstico de câncer de próstata utilizando 
            informações dos pacientes e exames de rotina. <br />
            Pesquisador: Wesley Batista Dominices de Araújo (Doutorando)
          </p>
        </div>

        {/* Projeto 3 */}
        <div className="project-card">
          <h3 className="project-card-title">Detecção de Ovócitos</h3>
          <p className="project-card-desc">
            Desenvolvimento de uma metodologia para detectar automaticamente ovócitos 
            utilizando redes neurais. <br />
            Pesquisadoras: Yanna Cruz (Doutoranda), Lethicia (IC), Manuele (IC)
          </p>
        </div>

        {/* Projeto 4 */}
        <div className="project-card">
          <h3 className="project-card-title">Monitoramento Ambiental</h3>
          <p className="project-card-desc">
            Análise de biomarcadores de contaminação em peixes e desenvolvimento 
            de metodologias para monitoramento de ecossistemas. <br />
            Pesquisadores: Antonio Fhillipi (Doutorando), Lethicia (IC), Manuele (IC)
          </p>
        </div>

        {/* Projeto 5 */}
        <div className="project-card">
          <h3 className="project-card-title">Criação de uma Base de Dados</h3>
          <p className="project-card-desc">
            Desenvolvimento de banco de dados para pesquisas em agroecologia. <br />
            Pesquisadores: Guillaume Rousseau, Fhillipi, Pedro Jovino
          </p>
        </div>

        {/* Projeto 6 */}
        <div className="project-card">
          <h3 className="project-card-title">Projeto Guyamazon: SenCSoil</h3>
          <p className="project-card-desc">
            Interrelações entre a erosão dos solos e o ciclo do carbono via rede de sensores. <br />
            Parceria: LAPS-IRD
          </p>
        </div>

        {/* Projeto 7 */}
        <div className="project-card">
          <h3 className="project-card-title">Modelagem de Sensor à Ondas de Love</h3>
          <p className="project-card-desc">
            Pesquisadores: Dailan Bernardes (Doutorando), Marcelo Viana da Silva (Doutorando)
          </p>
        </div>

        {/* Projeto 8 */}
        <div className="project-card">
          <h3 className="project-card-title">RSSF para Pavimentação</h3>
          <p className="project-card-desc">
            Pesquisadores: Dailan Bernardes, Marcelo Viana, Airton César (IC), Marcus Torres (IC)
          </p>
        </div>

        {/* Projeto 9 */}
        <div className="project-card">
          <h3 className="project-card-title">Algoritmo de Roteamento para RSSF</h3>
          <p className="project-card-desc">
            Pesquisadores: Allyx Fontaine (UMR Espace Dev), Rayanne Silveira (Doutoranda), 
            Frank Rodrigues (Mestrando)
          </p>
        </div>

        {/* Projeto 10 */}
        <div className="project-card">
          <h3 className="project-card-title">Topologias para Redes de Sensores</h3>
          <p className="project-card-desc">
            Pesquisador: Freud Sebastian (Doutorando)
          </p>
        </div>

        {/* Projeto 11 */}
        <div className="project-card">
          <h3 className="project-card-title">Sistema para Aceite Técnico de Navios</h3>
          <p className="project-card-desc">
            Pesquisadores: Lúcio Flávio, Fhillipi, Paulo Alex, Renan
          </p>
        </div>

        {/* Projeto 12 */}
        <div className="project-card">
          <h3 className="project-card-title">
            Monitoramento Ambiental no Cerrado e Amazônia
          </h3>
          <p className="project-card-desc">
            Uso de inteligência artificial para detecção de queimadas e desmatamento. <br />
            Pesquisadores: Rony, Lorena (IC), Felipe Samuel (IC)
          </p>
        </div>

        {/* Projeto 13 */}
        <div className="project-card">
          <h3 className="project-card-title">Modernização de Produtos Digitais do IMESC</h3>
          <p className="project-card-desc">
            Pesquisadores: David, Ana Paula, Danilo e mais 6 alunos de graduação
          </p>
        </div>

        {/* Projeto 14 */}
        <div className="project-card">
          <h3 className="project-card-title">
            Melhorias em Sistemas de Combate a Incêndio
          </h3>
          <p className="project-card-desc">
            Pesquisador: Jorge De Jesus Passinho Segundo
          </p>
        </div>
      </div>
    </div>
    </>
  );
}

export default Projects;
