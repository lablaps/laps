import React from "react";
import "../assets/styles/css/Contact.css"; // Importa o CSS específico para Contact


function Contact() {
  return (
    <>
      {/* Header Start */}
      <div className="container-fluid bg-primary py-5 mb-5 page-header">
        <div className="container py-5">
          <div className="row justify-content-center">
            <div className="col-lg-10 text-center">
              <h1 className="display-3 text-white animated slideInDown">
                Contatos
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
                    Contatos
                  </li>
                </ol>
              </nav>
            </div>
          </div>
        </div>
      </div>
      {/* Header End */}
      <div className="contact-container">
        <h1 className="contact-title">Fale Conosco</h1>
        <p className="contact-intro">
          Localização e Contato do Laboratório de Aquisição e Processamento de
          Sinais (LAPS). Fique à vontade para nos visitar ou entrar em contato
          por e-mail.
        </p>

        <div className="contact-content">
          {/* Bloco de Informações de Contato */}
          <div className="contact-info">
            <h2 className="contact-subheading">Entre em contato</h2>
            <p className="contact-description">Localização e Contato do LAPS</p>

            <div className="contact-card">
              <h3 className="contact-card-title">Laboratório</h3>
              <p className="contact-card-text">
                CCT, Cidade Universitária Paulo VI, Av, Lourenço Vieira da Silva,
                nº 1000, Jardim São Cristóvão, CEP: 65055-310, São Luís - MA
              </p>
            </div>

            <div className="contact-card">
              <h3 className="contact-card-title">Email</h3>
              <p className="contact-card-text">
                <a
                  href="mailto:laps@engcomp.uema.br?subject=Assunto%20do%20E-mail&body=Olá!%20Escreva%20sua%20mensagem%20aqui."
                  className="contact-card-link"
                >
                  laps@engcomp.uema.br
                </a>
              </p>
            </div>
          </div>

          {/* Bloco com o Mapa */}
          <div className="contact-map">
            <iframe
              title="Localização LAPS"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1013.836663134625!2d-44.21096824228935!3d-2.5840323512860373!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x7f69b74faebfacf%3A0x7b51d3fd663371da!2sLAPS%20-%20Laborat%C3%B3rio%20de%20Aquisi%C3%A7%C3%A3o%20e%20Processamento%20de%20Sinais!5e0!3m2!1spt-BR!2sbr!4v1715395738902!5m2!1spt-BR!2sbr"
              width="100%"
              height="450"
              style={{ border: 0 }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </div>
    </>
  );
}

export default Contact;
