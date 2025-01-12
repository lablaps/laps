import React from "react";
import "../assets/styles/css/News.css";
import Footer from "../pages/Footer"; 

function News() {
  return (
    <>
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
    <Footer />
    </>
  );
}

export default News;
