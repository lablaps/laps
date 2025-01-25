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

      {/* News Start */}
      <div className="container py-5">
        <div className="row">
          <div className="col-lg-4 mb-4">
            <div className="card border-0 shadow-sm rounded">
              <div className="card-img-top news-card-img news-card-img-1"></div>
              <div className="card-body">
                <h5 className="card-title">Assessoria de Comunicação Institucional</h5>
                <p className="card-text">
                  Conheça o Laboratório de Aquisição e Processamento de Sinais da Uema
                </p>
                <a href="https://www.uema.br/2024/07/conheca-o-laboratorio-de-aquisicao-e-processamento-de-sinais-da-uema/" className="btn btn-primary">
                  Leia Mais
                </a>
              </div>
            </div>
          </div>
          <div className="col-lg-4 mb-4">
            <div className="card border-0 shadow-sm rounded">
              <div className="card-img-top news-card-img news-card-img-2"></div>
              <div className="card-body">
                <h5 className="card-title">Instagram UEMA</h5>
                <p className="card-text">
                  Quando inovação e ciência se unem, o Maranhão dá um salto no futuro! 🚀
                </p>
                <a href="https://www.instagram.com/p/DCR9WYixeQa/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==" className="btn btn-primary">
                  Leia Mais
                </a>
              </div>
            </div>
          </div>
          <div className="col-lg-4 mb-4">
            <div className="card border-0 shadow-sm rounded">
              <div className="card-img-top news-card-img news-card-img-3"></div>
              <div className="card-body">
                <h5 className="card-title">Redação Imirante</h5>
                <p className="card-text">
                  Laboratório de Aquisição e Processamento de Sinais da Uema estimula o desenvolvimento científico e tecnológico do estado
                </p>
                <a href="https://imaranhense.com/noticia/23500/laboratorio-de-aquisicao-e-processamento-de-sinais-da-uema-estimula-o-desenvolvimento-cientifico-e-tecnologico-do-estado" className="btn btn-primary">
                  Leia Mais
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* News End */}
    </>
  );
}

export default News;
