import React from "react";
import "../assets/styles/css/News.css";

function News() {
  return (
    <>
    {/* Header Start */}
    <div className="container-fluid bg-primary py-5 mb-5 page-header">
        <div className="container py-5">
          <div className="row justify-content-center">
            <div className="col-lg-10 text-center">
              <h1 className="display-3 text-white animated slideInDown">
                Notícias
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
                    Notícias
                  </li>
                </ol>
              </nav>
            </div>
          </div>
        </div>
      </div>
      {/* Header End */}
    <div className="news-container">
      <h1 className="news-title">Acompanhe as últimas notícias do LAPS</h1>
      <p className="news-intro">
        Fique por dentro dos eventos, publicações e novidades relacionados ao
        Laboratório de Aquisição e Processamento de Sinais (LAPS). Aqui você
        encontrará atualizações constantes sobre nossas pesquisas, projetos e
        colaborações.
      </p>

      {/* Exemplo de "card" simples para uma notícia */}
      <div className="news-card">
        <h2 className="news-card-title">Título da Notícia</h2>
        <p className="news-card-resumo">
          Resumo da notícia para informar aos visitantes. Destaque pontos mais
          importantes e ofereça uma prévia do que podem esperar ao ler mais.
        </p>
        <button className="news-button">Leia Mais</button>
      </div>

      <div className="news-card">
        <h2 className="news-card-title">Título da Notícia</h2>
        <p className="news-card-resumo">
          Resumo da notícia para informar aos visitantes. Destaque pontos mais
          importantes e ofereça uma prévia do que podem esperar ao ler mais.
        </p>
        <button className="news-button">Leia Mais</button>
      </div>

      {/* Você pode repetir o bloco .news-card com outras notícias */}
    </div>
    </>
  );
}

export default News;
