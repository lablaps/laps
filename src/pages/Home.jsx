import React from "react";

const Home = () => {
    return (
        <>

            {/* Carousel Start */}
            <div className="container-fluid p-0 mb-5">
                <div className="position-relative">
                    <img
                        className="img-fluid w-100"
                        src={require('../assets/images/laps1.PNG')}
                        alt="LAPS Carousel 1"
                        style={{ objectFit: 'cover', height: '90vh' }} // Aumentando a altura para ocupar mais espaço
                    />
                    <div
                        className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
                        style={{ background: 'rgba(24, 29, 56, .7)' }}
                    >
                        <div className="text-center">
                            <h1 className="display-3 text-white animated slideInDown">
                                <strong>LAPS</strong>
                            </h1>
                            <p className="fs-5 text-white mb-4 pb-2">
                                Laboratório de Aquisição e Processamento de Sinais.
                                <br />
                                Aplicação nas áreas de Aquisição de Sinais, Inteligência Artificial, Redes de Sensores sem fio, Eletrônica e Processamento de Sinais.
                            </p>
                            <a
                                href="#"
                                className="btn btn-primary py-md-3 px-md-5 me-3 animated slideInLeft"
                            >
                                Saiba mais...
                            </a>
                        </div>
                    </div>
                </div>
            </div>
            {/* Carousel End */}

            {/* Service Start */}
            <div className="container-xxl py-5">
                <div className="container">
                    <div className="row g-4">
                        {/* Professores renomados */}
                        <div className="col-lg-3 col-sm-6 wow fadeInUp" data-wow-delay="0.1s">
                            <div className="service-item text-center pt-3">
                                <div className="p-4">
                                    <i className="fa fa-3x fa-graduation-cap text-primary mb-4"></i>
                                    <h5 className="mb-3">Professores renomados</h5>
                                    <p>
                                        <br></br>
                                        Os melhores da UEMA!
                                    </p>
                                </div>
                            </div>
                        </div>
                        {/* Bolsistas no Exterior */}
                        <div className="col-lg-3 col-sm-6 wow fadeInUp" data-wow-delay="0.3s">
                            <div className="service-item text-center pt-3">
                                <div className="p-4">
                                    <i className="fa fa-3x fa-globe text-primary mb-4"></i>
                                    <h5 className="mb-3">Bolsistas no Exterior</h5>
                                    <p>
                                        Aqui temos nossa equipe de estudantes fora do Brasil.
                                    </p>
                                </div>
                            </div>
                        </div>
                        {/* Projetos */}
                        <div className="col-lg-3 col-sm-6 wow fadeInUp" data-wow-delay="0.5s">
                            <div className="service-item text-center pt-3">
                                <div className="p-4">
                                    <i className="fa fa-3x fa-home text-primary mb-4"></i>
                                    <h5 className="mb-3">Projetos</h5>
                                    <p>
                                        Descubra mais sobre nossos projetos atuais.
                                    </p>
                                </div>
                            </div>
                        </div>
                        {/* Artigos Publicados */}
                        <div className="col-lg-3 col-sm-6 wow fadeInUp" data-wow-delay="0.7s">
                            <div className="service-item text-center pt-3">
                                <div className="p-4">
                                    <i className="fa fa-3x fa-book-open text-primary mb-4"></i>
                                    <h5 className="mb-3">Artigos Publicados</h5>
                                    <p>
                                        Produções literárias já publicadas em revistas, livros e outros.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Service End */}


            {/* About Start */}
            <div className="container-xxl py-5">
                <div className="container">
                    <div className="row g-5">
                        {/* Imagem */}
                        <div
                            className="col-lg-6 wow fadeInUp"
                            data-wow-delay="0.1s"
                            style={{ minHeight: "400px" }}
                        >
                            <div className="position-relative h-100">
                                <img
                                    className="img-fluid position-absolute w-100 h-100"
                                    src={require('../assets/images/placa.jpg')}
                                    alt="Imagem ilustrativa do laboratório"
                                    style={{ objectFit: "cover" }}
                                />
                            </div>
                        </div>
                        {/* Texto */}
                        <div
                            className="col-lg-6 wow fadeInUp"
                            data-wow-delay="0.3s"
                        >
                            <h6 className="section-title bg-white text-start text-primary pe-3">Sobre nós</h6>
                            <h1 className="mb-4">Bem-vindo ao LAPS</h1>
                            <p className="mb-4">
                                No LAPS (Laboratório de Aquisição e Processamento de Sinais), somos dedicados para publicar melhorias científicas.
                                Nossa facilidade é um hobby para inovação e colaboração, onde conhecemos tecnologias com propósito em conhecimento.
                            </p>
                            <p className="mb-4">
                                Nossa missão é conduzir pesquisas inovadoras em vários ramos científicos com foco na precisão.
                                De materiais científicos novos à análise biológica intrínseca, nos esforçamos para atingir a excelência em todo estudo e experimento.
                            </p>
                            <div className="row gy-2 gx-4 mb-4">
                                <div className="col-sm-6">
                                    <p className="mb-0">
                                        <i className="fa fa-arrow-right text-primary me-2"></i>
                                        Pesquisadores Habilidosos
                                    </p>
                                </div>
                                <div className="col-sm-6">
                                    <p className="mb-0">
                                        <i className="fa fa-arrow-right text-primary me-2"></i>
                                        Conversação Online
                                    </p>
                                </div>
                                <div className="col-sm-6">
                                    <p className="mb-0">
                                        <i className="fa fa-arrow-right text-primary me-2"></i>
                                        Laboratório Internacional
                                    </p>
                                </div>
                            </div>
                            <a
                                className="btn btn-primary py-3 px-5 mt-2"
                                href="about.html"
                            >
                                Saiba mais...
                            </a>
                        </div>
                    </div>
                </div>
            </div>
            {/* About End */}


            {/* Team Section */}
            <div className="container-xxl-Ewaldo py-5">
                <div className="container">
                    <div className="text-center wow fadeInUp" data-wow-delay="0.1s">
                        <h6 className="section-title bg-white text-center text-primary px-3"></h6>
                        <h1 className="mb-5">Chefe</h1>
                    </div>
                    <div className="row g-4 justify-content-center">
                        {/* Adição de justify-content-center para centralizar imagem */}
                        <div className="col-lg-3 col-md-6 wow fadeInUp" data-wow-delay="0.1s">
                            <div className="team-item bg-light">
                                <div
                                    className="overflow-hidden"
                                    style={{ display: "flex", justifyContent: "center" }}
                                >
                                    <img
                                        className="img-fluid"
                                        src={require("../assets/images/prof.ewaldo.png")}
                                        alt="Ph.D Ewaldo Eder Santana"
                                    />
                                </div>
                                <div
                                    className="position-relative d-flex justify-content-center"
                                    style={{ marginTop: "-23px" }}
                                >
                                    <div className="bg-light d-flex justify-content-center pt-2 px-1">
                                        <a
                                            className="btn btn-sm-square btn-primary mx-1"
                                            href="http://lattes.cnpq.br/0660692009750374"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <i className="fa fa-university"></i>
                                        </a>
                                    </div>
                                </div>
                                <div className="text-center p-4">
                                    <h5 className="mb-0">Ph.D Ewaldo Eder Santana</h5>
                                    <small>
                                        Head of the Laboratory of Signals Acquisition and Processing
                                    </small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Doutores Start */}
            <div className="container-xxl py-5">
                <div className="container">
                    <div
                        className="text-center wow fadeInUp"
                        data-wow-delay="0.1s"
                    >
                        <h6 className="section-title bg-white text-center text-primary px-3"></h6>
                        <h1 className="mb-5">Doutores</h1>
                    </div>
                    <div className="row g-4">
                        {/* Doutor 1 */}
                        <div
                            className="col-lg-3 col-md-6 wow fadeInUp"
                            data-wow-delay="0.1s"
                        >
                            <div className="team-item bg-light">
                                <div className="overflow-hidden">
                                    <img
                                        className="img-fluid"
                                        src={require('../assets/images/professor-magno.jpg')}
                                        alt="Dr. Carlos Magno Sousa Júnior"
                                    />
                                </div>
                                <div
                                    className="position-relative d-flex justify-content-center"
                                    style={{ marginTop: "-23px" }}
                                >
                                    <div className="bg-light d-flex justify-content-center pt-2 px-1">
                                        <a
                                            className="btn btn-sm-square btn-primary mx-1"
                                            href="http://lattes.cnpq.br/9561853644051629"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <i className="fa fa-university"></i>
                                        </a>
                                    </div>
                                </div>
                                <div className="text-center p-4">
                                    <h5 className="mb-0">Dr. Carlos Magno Sousa Júnior</h5>
                                    <small>Pesquisador</small>
                                </div>
                            </div>
                        </div>

                        {/* Doutor 2 */}
                        <div
                            className="col-lg-3 col-md-6 wow fadeInUp"
                            data-wow-delay="0.5s"
                        >
                            <div className="team-item bg-light">
                                <div className="overflow-hidden">
                                    <img
                                        className="img-fluid"
                                        src={require('../assets/images/fundo-preto-com-textura-de-tecido.jpg')}
                                        alt="Dr. Lúcio Flávio de Albuquerque Campos"
                                    />
                                </div>
                                <div
                                    className="position-relative d-flex justify-content-center"
                                    style={{ marginTop: "-23px" }}
                                >
                                    <div className="bg-light d-flex justify-content-center pt-2 px-1">
                                        <a
                                            className="btn btn-sm-square btn-primary mx-1"
                                            href="http://lattes.cnpq.br/6876234739101371"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <i className="fa fa-university"></i>
                                        </a>
                                    </div>
                                </div>
                                <div className="text-center p-4">
                                    <h5 className="mb-0">Dr. Lúcio Flávio de Albuquerque Campos</h5>
                                    <small>Pesquisador</small>
                                </div>
                            </div>
                        </div>

                        {/* Doutor 3 */}
                        <div
                            className="col-lg-3 col-md-6 wow fadeInUp"
                            data-wow-delay="0.5s"
                        >
                            <div className="team-item bg-light">
                                <div className="overflow-hidden">
                                    <img
                                        className="img-fluid"
                                        src={require('../assets/images/fundo-preto-com-textura-de-tecido.jpg')}
                                        alt="Dr. Mauro Sérgio Silva Pinto"
                                    />
                                </div>
                                <div
                                    className="position-relative d-flex justify-content-center"
                                    style={{ marginTop: "-23px" }}
                                >
                                    <div className="bg-light d-flex justify-content-center pt-2 px-1">
                                        <a
                                            className="btn btn-sm-square btn-primary mx-1"
                                            href="http://lattes.cnpq.br/0804349408744542"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <i className="fa fa-university"></i>
                                        </a>
                                    </div>
                                </div>
                                <div className="text-center p-4">
                                    <h5 className="mb-0">Dr. Mauro Sérgio Silva Pinto</h5>
                                    <small>Pesquisador</small>
                                </div>
                            </div>
                        </div>

                        {/* Doutor 4 */}
                        <div
                            className="col-lg-3 col-md-6 wow fadeInUp"
                            data-wow-delay="0.7s"
                        >
                            <div className="team-item bg-light">
                                <div className="overflow-hidden">
                                    <img
                                        className="img-fluid"
                                        src={require('../assets/images/prof-paulo-fernandes.jpg')}
                                        alt="Dr. Paulo Fernandes da Silva Júnior"
                                    />
                                </div>
                                <div
                                    className="position-relative d-flex justify-content-center"
                                    style={{ marginTop: "-23px" }}
                                >
                                    <div className="bg-light d-flex justify-content-center pt-2 px-1">
                                        <a
                                            className="btn btn-sm-square btn-primary mx-1"
                                            href="http://lattes.cnpq.br/7543812637795681"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <i className="fa fa-university"></i>
                                        </a>
                                    </div>
                                </div>
                                <div className="text-center p-4">
                                    <h5 className="mb-0">Dr. Paulo Fernandes da Silva Júnior</h5>
                                    <small>Pesquisador</small>
                                </div>
                            </div>
                        </div>

                        {/* Doutor 5 */}
                        <div
                            className="col-lg-3 col-md-6 wow fadeInUp"
                            data-wow-delay="0.7s"
                        >
                            <div className="team-item bg-light">
                                <div className="overflow-hidden">
                                    <img
                                        className="img-fluid"
                                        src={require('../assets/images/fundo-preto-com-textura-de-tecido.jpg')}
                                        alt="Dr. Raimundo Carlos Silvério Freire"
                                    />
                                </div>
                                <div
                                    className="position-relative d-flex justify-content-center"
                                    style={{ marginTop: "-23px" }}
                                >
                                    <div className="bg-light d-flex justify-content-center pt-2 px-1">
                                        <a
                                            className="btn btn-sm-square btn-primary mx-1"
                                            href="http://lattes.cnpq.br/4016576596215504"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <i className="fa fa-university"></i>
                                        </a>
                                    </div>
                                </div>
                                <div className="text-center p-4">
                                    <h5 className="mb-0">Dr. Raimundo Carlos Silvério Freire</h5>
                                    <small>Pesquisador</small>
                                </div>
                            </div>
                        </div>

                        {/* Doutor 6 */}
                        <div
                            className="col-lg-3 col-md-6 wow fadeInUp"
                            data-wow-delay="0.7s"
                        >
                            <div className="team-item bg-light">
                                <div className="overflow-hidden">
                                    <img
                                        className="img-fluid"
                                        src={require('../assets/images/fundo-preto-com-textura-de-tecido.jpg')}
                                        alt="Dr. Reinaldo de Jesus da Silva"
                                    />
                                </div>
                                <div
                                    className="position-relative d-flex justify-content-center"
                                    style={{ marginTop: "-23px" }}
                                >
                                    <div className="bg-light d-flex justify-content-center pt-2 px-1">
                                        <a
                                            className="btn btn-sm-square btn-primary mx-1"
                                            href="http://lattes.cnpq.br/7984455205688904"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <i className="fa fa-university"></i>
                                        </a>
                                    </div>
                                </div>
                                <div className="text-center p-4">
                                    <h5 className="mb-0">Dr. Reinaldo de Jesus da Silva</h5>
                                    <small>Pesquisador</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Doutores End */}


            {/* Doutorandos Start */}
            <div className="container-xxl py-5">
                <div className="container">
                    <div
                        className="text-center wow fadeInUp"
                        data-wow-delay="0.1s"
                    >
                        <h6 className="section-title bg-white text-center text-primary px-3"></h6>
                        <h1 className="mb-5">Doutorandos</h1>
                    </div>
                    <div className="row g-4">
                        {/* Doutorando 1 */}
                        <div
                            className="col-lg-3 col-md-6 wow fadeInUp"
                            data-wow-delay="0.1s"
                        >
                            <div className="team-item bg-light">
                                <div className="overflow-hidden">
                                    <img
                                        className="img-fluid"
                                        src={require('../assets/images/fundo-preto-com-textura-de-tecido.jpg')}
                                        alt="Antonio Fhillipi Maciel Silva"
                                    />
                                </div>
                                <div
                                    className="position-relative d-flex justify-content-center"
                                    style={{ marginTop: "-23px" }}
                                >
                                    <div className="bg-light d-flex justify-content-center pt-2 px-1">
                                        <a
                                            className="btn btn-sm-square btn-primary mx-1"
                                            href="http://lattes.cnpq.br/2741380271392818"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <i className="fa fa-university"></i>
                                        </a>
                                    </div>
                                </div>
                                <div className="text-center p-4">
                                    <h5 className="mb-0">Antonio Fhillipi Maciel Silva</h5>
                                    <small>Pesquisador</small>
                                </div>
                            </div>
                        </div>

                        {/* Doutorando 2 */}
                        <div
                            className="col-lg-3 col-md-6 wow fadeInUp"
                            data-wow-delay="0.5s"
                        >
                            <div className="team-item bg-light">
                                <div className="overflow-hidden">
                                    <img
                                        className="img-fluid"
                                        src={require('../assets/images/fundo-preto-com-textura-de-tecido.jpg')}
                                        alt="Dailan de jesus Pereira Bernardes"
                                    />
                                </div>
                                <div
                                    className="position-relative d-flex justify-content-center"
                                    style={{ marginTop: "-23px" }}
                                >
                                    <div className="bg-light d-flex justify-content-center pt-2 px-1">
                                        <a
                                            className="btn btn-sm-square btn-primary mx-1"
                                            href="http://lattes.cnpq.br/9875534210212360"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <i className="fa fa-university"></i>
                                        </a>
                                    </div>
                                </div>
                                <div className="text-center p-4">
                                    <h5 className="mb-0">Dailan de jesus Pereira Bernardes</h5>
                                    <small>Pesquisador</small>
                                </div>
                            </div>
                        </div>

                        {/* Doutorando 3 */}
                        <div
                            className="col-lg-3 col-md-6 wow fadeInUp"
                            data-wow-delay="0.5s"
                        >
                            <div className="team-item bg-light">
                                <div className="overflow-hidden">
                                    <img
                                        className="img-fluid"
                                        src={require('../assets/images/fundo-preto-com-textura-de-tecido.jpg')}
                                        alt="Freud Sebastian Bach Carvalho Lima"
                                    />
                                </div>
                                <div
                                    className="position-relative d-flex justify-content-center"
                                    style={{ marginTop: "-23px" }}
                                >
                                    <div className="bg-light d-flex justify-content-center pt-2 px-1">
                                        <a
                                            className="btn btn-sm-square btn-primary mx-1"
                                            href="http://lattes.cnpq.br/9368757906476173"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <i className="fa fa-university"></i>
                                        </a>
                                    </div>
                                </div>
                                <div className="text-center p-4">
                                    <h5 className="mb-0">Freud Sebastian Bach Carvalho Lima</h5>
                                    <small>Pesquisador</small>
                                </div>
                            </div>
                        </div>
                        {/* Doutorando 4 */}
                        <div
                            className="col-lg-3 col-md-6 wow fadeInUp"
                            data-wow-delay="0.7s"
                        >
                            <div className="team-item bg-light">
                                <div className="overflow-hidden">
                                    <img
                                        className="img-fluid"
                                        src={require('../assets/images/fundo-preto-com-textura-de-tecido.jpg')}
                                        alt="Marcelo Viana da Silva"
                                    />
                                </div>
                                <div
                                    className="position-relative d-flex justify-content-center"
                                    style={{ marginTop: "-23px" }}
                                >
                                    <div className="bg-light d-flex justify-content-center pt-2 px-1">
                                        <a
                                            className="btn btn-sm-square btn-primary mx-1"
                                            href="http://lattes.cnpq.br/6060981281076158"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <i className="fa fa-university"></i>
                                        </a>
                                    </div>
                                </div>
                                <div className="text-center p-4">
                                    <h5 className="mb-0">Marcelo Viana da Silva</h5>
                                    <small>Pesquisador</small>
                                </div>
                            </div>
                        </div>

                        {/* Doutorando 5 */}
                        <div
                            className="col-lg-3 col-md-6 wow fadeInUp"
                            data-wow-delay="0.9s"
                        >
                            <div className="team-item bg-light">
                                <div className="overflow-hidden">
                                    <img
                                        className="img-fluid"
                                        src={require('../assets/images/fundo-preto-com-textura-de-tecido.jpg')}
                                        alt="Nilton Rodrigues Cantanhede"
                                    />
                                </div>
                                <div
                                    className="position-relative d-flex justify-content-center"
                                    style={{ marginTop: "-23px" }}
                                >
                                    <div className="bg-light d-flex justify-content-center pt-2 px-1">
                                        <a
                                            className="btn btn-sm-square btn-primary mx-1"
                                            href="http://lattes.cnpq.br/1416218313180003"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <i className="fa fa-university"></i>
                                        </a>
                                    </div>
                                </div>
                                <div className="text-center p-4">
                                    <h5 className="mb-0">Nilton Rodrigues Cantanhede</h5>
                                    <small>Pesquisador</small>
                                </div>
                            </div>
                        </div>

                        {/* Doutorando 6 */}
                        <div
                            className="col-lg-3 col-md-6 wow fadeInUp"
                            data-wow-delay="0.9s"
                        >
                            <div className="team-item bg-light">
                                <div className="overflow-hidden">
                                    <img
                                        className="img-fluid"
                                        src={require('../assets/images/fundo-preto-com-textura-de-tecido.jpg')}
                                        alt="Paulo Henrique Bezerra Carvalho"
                                    />
                                </div>
                                <div
                                    className="position-relative d-flex justify-content-center"
                                    style={{ marginTop: "-23px" }}
                                >
                                    <div className="bg-light d-flex justify-content-center pt-2 px-1">
                                        <a
                                            className="btn btn-sm-square btn-primary mx-1"
                                            href="http://lattes.cnpq.br/"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <i className="fa fa-university"></i>
                                        </a>
                                    </div>
                                </div>
                                <div className="text-center p-4">
                                    <h5 className="mb-0">Paulo Henrique Bezerra Carvalho</h5>
                                    <small>Pesquisador</small>
                                </div>
                            </div>
                        </div>

                        {/* Doutorando 7 */}
                        <div
                            className="col-lg-3 col-md-6 wow fadeInUp"
                            data-wow-delay="0.9s"
                        >
                            <div className="team-item bg-light">
                                <div className="overflow-hidden">
                                    <img
                                        className="img-fluid"
                                        src={require('../assets/images/fundo-preto-com-textura-de-tecido.jpg')}
                                        alt="Rayanne Maria Cunha Silveira"
                                    />
                                </div>
                                <div
                                    className="position-relative d-flex justify-content-center"
                                    style={{ marginTop: "-23px" }}
                                >
                                    <div className="bg-light d-flex justify-content-center pt-2 px-1">
                                        <a
                                            className="btn btn-sm-square btn-primary mx-1"
                                            href="http://lattes.cnpq.br/2999561859534744"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <i className="fa fa-university"></i>
                                        </a>
                                    </div>
                                </div>
                                <div className="text-center p-4">
                                    <h5 className="mb-0">Rayanne Maria Cunha Silveira</h5>
                                    <small>Pesquisadora</small>
                                </div>
                            </div>
                        </div>

                        {/* Doutorando 8 */}
                        <div
                            className="col-lg-3 col-md-6 wow fadeInUp"
                            data-wow-delay="0.9s"
                        >
                            <div className="team-item bg-light">
                                <div className="overflow-hidden">
                                    <img
                                        className="img-fluid"
                                        src={require('../assets/images/fundo-preto-com-textura-de-tecido.jpg')}
                                        alt="Wesley Batista Dominices de Araújo"
                                    />
                                </div>
                                <div
                                    className="position-relative d-flex justify-content-center"
                                    style={{ marginTop: "-23px" }}
                                >
                                    <div className="bg-light d-flex justify-content-center pt-2 px-1">
                                        <a
                                            className="btn btn-sm-square btn-primary mx-1"
                                            href="http://lattes.cnpq.br/6048598111441819"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <i className="fa fa-university"></i>
                                        </a>
                                    </div>
                                </div>
                                <div className="text-center p-4">
                                    <h5 className="mb-0">Wesley Batista Dominices de Araújo</h5>
                                    <small>Pesquisador</small>
                                </div>
                            </div>
                        </div>

                        {/* Doutorando 9 */}
                        <div
                            className="col-lg-3 col-md-6 wow fadeInUp"
                            data-wow-delay="0.9s"
                        >
                            <div className="team-item bg-light">
                                <div className="overflow-hidden">
                                    <img
                                        className="img-fluid"
                                        src={require('../assets/images/fundo-preto-com-textura-de-tecido.jpg')}
                                        alt="Yanna Leidy Ketley Fernandes Cruz"
                                    />
                                </div>
                                <div
                                    className="position-relative d-flex justify-content-center"
                                    style={{ marginTop: "-23px" }}
                                >
                                    <div className="bg-light d-flex justify-content-center pt-2 px-1">
                                        <a
                                            className="btn btn-sm-square btn-primary mx-1"
                                            href="http://lattes.cnpq.br/1613229145306715"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <i className="fa fa-university"></i>
                                        </a>
                                    </div>
                                </div>
                                <div className="text-center p-4">
                                    <h5 className="mb-0">Yanna Leidy Ketley Fernandes Cruz</h5>
                                    <small>Pesquisadora</small>
                                </div>
                            </div>
                        </div>

                        {/* Outros Doutorandos */}
                        {/* Repita o padrão acima para os demais doutorandos. Altere os valores de `href`, `alt`, e `h5` para os dados corretos. */}
                    </div>
                </div>
            </div>
            {/* Doutorandos End */}


            {/* Mestrandos Start */}
            <div className="container-xxl py-5">
                <div className="container">
                    <div
                        className="text-center wow fadeInUp"
                        data-wow-delay="0.1s"
                    >
                        <h6 className="section-title bg-white text-center text-primary px-3"></h6>
                        <h1 className="mb-5">Mestrandos</h1>
                    </div>
                    <div className="row g-4">
                        {/* Mestrando 1 */}
                        <div
                            className="col-lg-3 col-md-6 wow fadeInUp"
                            data-wow-delay="0.1s"
                        >
                            <div className="team-item bg-light">
                                <div className="overflow-hidden">
                                    <img
                                        className="img-fluid"
                                        src={require('../assets/images/fundo-preto-com-textura-de-tecido.jpg')}
                                        alt="Jorge de Jesus Passinho Segundo"
                                    />
                                </div>
                                <div
                                    className="position-relative d-flex justify-content-center"
                                    style={{ marginTop: "-23px" }}
                                >
                                    <div className="bg-light d-flex justify-content-center pt-2 px-1">
                                        <a
                                            className="btn btn-sm-square btn-primary mx-1"
                                            href="http://lattes.cnpq.br/4913020111289067"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <i className="fa fa-university"></i>
                                        </a>
                                    </div>
                                </div>
                                <div className="text-center p-4">
                                    <h5 className="mb-0">Jorge de Jesus Passinho Segundo</h5>
                                    <small>Pesquisador</small>
                                </div>
                            </div>
                        </div>

                        {/* Mestrando 2 */}
                        <div
                            className="col-lg-3 col-md-6 wow fadeInUp"
                            data-wow-delay="0.5s"
                        >
                            <div className="team-item bg-light">
                                <div className="overflow-hidden">
                                    <img
                                        className="img-fluid"
                                        src={require('../assets/images/fundo-preto-com-textura-de-tecido.jpg')}
                                        alt="Breno Batista"
                                    />
                                </div>
                                <div
                                    className="position-relative d-flex justify-content-center"
                                    style={{ marginTop: "-23px" }}
                                >
                                    <div className="bg-light d-flex justify-content-center pt-2 px-1">
                                        <a
                                            className="btn btn-sm-square btn-primary mx-1"
                                            href="http://lattes.cnpq.br/0759368360744507"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <i className="fa fa-university"></i>
                                        </a>
                                    </div>
                                </div>
                                <div className="text-center p-4">
                                    <h5 className="mb-0">Breno Batista</h5>
                                    <small>Pesquisador</small>
                                </div>
                            </div>
                        </div>

                        {/* Mestrando 3 */}
                        <div
                            className="col-lg-3 col-md-6 wow fadeInUp"
                            data-wow-delay="0.5s"
                        >
                            <div className="team-item bg-light">
                                <div className="overflow-hidden">
                                    <img
                                        className="img-fluid"
                                        src={require('../assets/images/fundo-preto-com-textura-de-tecido.jpg')}
                                        alt="Frank Rodrigues"
                                    />
                                </div>
                                <div
                                    className="position-relative d-flex justify-content-center"
                                    style={{ marginTop: "-23px" }}
                                >
                                    <div className="bg-light d-flex justify-content-center pt-2 px-1">
                                        <a
                                            className="btn btn-sm-square btn-primary mx-1"
                                            href="http://lattes.cnpq.br/"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <i className="fa fa-university"></i>
                                        </a>
                                    </div>
                                </div>
                                <div className="text-center p-4">
                                    <h5 className="mb-0">Frank Rodrigues</h5>
                                    <small>Pesquisador</small>
                                </div>
                            </div>
                        </div>

                        {/* Mestrando 4 */}
                        <div
                            className="col-lg-3 col-md-6 wow fadeInUp"
                            data-wow-delay="0.7s"
                        >
                            <div className="team-item bg-light">
                                <div className="overflow-hidden">
                                    <img
                                        className="img-fluid"
                                        src={require('../assets/images/fundo-preto-com-textura-de-tecido.jpg')}
                                        alt="Philipe Lima"
                                    />
                                </div>
                                <div
                                    className="position-relative d-flex justify-content-center"
                                    style={{ marginTop: "-23px" }}
                                >
                                    <div className="bg-light d-flex justify-content-center pt-2 px-1">
                                        <a
                                            className="btn btn-sm-square btn-primary mx-1"
                                            href="http://lattes.cnpq.br/0783855241031834"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <i className="fa fa-university"></i>
                                        </a>
                                    </div>
                                </div>
                                <div className="text-center p-4">
                                    <h5 className="mb-0">Philipe Lima</h5>
                                    <small>Pesquisador</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Mestrandos End */}

            {/* Iniciação Científica Start */}
            <div className="container-xxl py-5">
                <div className="container">
                    <div
                        className="text-center wow fadeInUp"
                        data-wow-delay="0.1s"
                    >
                        <h6 className="section-title bg-white text-center text-primary px-3"></h6>
                        <h1 className="mb-5">Alunos de Iniciação Científica</h1>
                    </div>
                    <div className="row g-4">
                        {/* Aluno 1 */}
                        <div
                            className="col-lg-3 col-md-6 wow fadeInUp"
                            data-wow-delay="0.1s"
                        >
                            <div className="team-item bg-light">
                                <div className="overflow-hidden">
                                    <img
                                        className="img-fluid"
                                        src={require('../assets/images/luisao-foto-laps.jpg')}
                                        alt="Luis Guilherme Busaglo Lopes"
                                    />
                                </div>
                                <div
                                    className="position-relative d-flex justify-content-center"
                                    style={{ marginTop: "-23px" }}
                                >
                                    <div className="bg-light d-flex justify-content-center pt-2 px-1">
                                        <a
                                            className="btn btn-sm-square btn-primary mx-1"
                                            href="http://lattes.cnpq.br/9386464064790640"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <i className="fa fa-university"></i>
                                        </a>
                                    </div>
                                </div>
                                <div className="text-center p-4">
                                    <h5 className="mb-0">Luis Guilherme Busaglo Lopes</h5>
                                    <small>Pesquisador</small>
                                </div>
                            </div>
                        </div>

                        {/* Aluno 2 */}
                        <div
                            className="col-lg-3 col-md-6 wow fadeInUp"
                            data-wow-delay="0.5s"
                        >
                            <div className="team-item bg-light">
                                <div className="overflow-hidden">
                                    <img
                                        className="img-fluid"
                                        src={require('../assets/images/matheus-foto-laps.jpg')}
                                        alt="Matheus Machado Santos"
                                    />
                                </div>
                                <div
                                    className="position-relative d-flex justify-content-center"
                                    style={{ marginTop: "-23px" }}
                                >
                                    <div className="bg-light d-flex justify-content-center pt-2 px-1">
                                        <a
                                            className="btn btn-sm-square btn-primary mx-1"
                                            href="http://lattes.cnpq.br/6006502610681243"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <i className="fa fa-university"></i>
                                        </a>
                                    </div>
                                </div>
                                <div className="text-center p-4">
                                    <h5 className="mb-0">Matheus Machado Santos</h5>
                                    <small>Pesquisador</small>
                                </div>
                            </div>
                        </div>

                        {/* Aluno 3 */}
                        <div
                            className="col-lg-3 col-md-6 wow fadeInUp"
                            data-wow-delay="0.5s"
                        >
                            <div className="team-item bg-light">
                                <div className="overflow-hidden">
                                    <img
                                        className="img-fluid"
                                        src={require('../assets/images/patrick-foto-laps.jpg')}
                                        alt="Patrick Melo Albuquerque"
                                    />
                                </div>
                                <div
                                    className="position-relative d-flex justify-content-center"
                                    style={{ marginTop: "-23px" }}
                                >
                                    <div className="bg-light d-flex justify-content-center pt-2 px-1">
                                        <a
                                            className="btn btn-sm-square btn-primary mx-1"
                                            href="http://lattes.cnpq.br/2168675297197664"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <i className="fa fa-university"></i>
                                        </a>
                                    </div>
                                </div>
                                <div className="text-center p-4">
                                    <h5 className="mb-0">Patrick Melo Albuquerque</h5>
                                    <small>Pesquisador</small>
                                </div>
                            </div>
                        </div>

                        {/* Aluno 4 */}
                        <div
                            className="col-lg-3 col-md-6 wow fadeInUp"
                            data-wow-delay="0.7s"
                        >
                            <div className="team-item bg-light">
                                <div className="overflow-hidden">
                                    <img
                                        className="img-fluid"
                                        src={require('../assets/images/jovino-foto-laps.jpg')}
                                        alt="Pedro Luís Jovino da Silva"
                                    />
                                </div>
                                <div
                                    className="position-relative d-flex justify-content-center"
                                    style={{ marginTop: "-23px" }}
                                >
                                    <div className="bg-light d-flex justify-content-center pt-2 px-1">
                                        <a
                                            className="btn btn-sm-square btn-primary mx-1"
                                            href="http://lattes.cnpq.br/5164896326019855"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <i className="fa fa-university"></i>
                                        </a>
                                    </div>
                                </div>
                                <div className="text-center p-4">
                                    <h5 className="mb-0">Pedro Luís Jovino da Silva</h5>
                                    <small>Pesquisador</small>
                                </div>
                            </div>
                        </div>

                        {/* Aluno 5 */}
                        <div
                            className="col-lg-3 col-md-6 wow fadeInUp"
                            data-wow-delay="0.9s"
                        >
                            <div className="team-item bg-light">
                                <div className="overflow-hidden">
                                    <img
                                        className="img-fluid"
                                        src={require('../assets/images/manu-foto-laps.jpg')}
                                        alt="Manuele Vitoria da Conceição Ribeiro"
                                    />
                                </div>
                                <div
                                    className="position-relative d-flex justify-content-center"
                                    style={{ marginTop: "-23px" }}
                                >
                                    <div className="bg-light d-flex justify-content-center pt-2 px-1">
                                        <a
                                            className="btn btn-sm-square btn-primary mx-1"
                                            href="http://lattes.cnpq.br/6924012903453862"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <i className="fa fa-university"></i>
                                        </a>
                                    </div>
                                </div>
                                <div className="text-center p-4">
                                    <h5 className="mb-0">Manuele Vitoria da Conceição Ribeiro</h5>
                                    <small>Pesquisadora</small>
                                </div>
                            </div>
                        </div>

                        {/* Aluno 6 */}
                        <div
                            className="col-lg-3 col-md-6 wow fadeInUp"
                            data-wow-delay="0.9s"
                        >
                            <div className="team-item bg-light">
                                <div className="overflow-hidden">
                                    <img
                                        className="img-fluid"
                                        src={require('../assets/images/lethicia-foto-laps.jpg')}
                                        alt="Lethicia Kelly Silva Sousa"
                                    />
                                </div>
                                <div
                                    className="position-relative d-flex justify-content-center"
                                    style={{ marginTop: "-23px" }}
                                >
                                    <div className="bg-light d-flex justify-content-center pt-2 px-1">
                                        <a
                                            className="btn btn-sm-square btn-primary mx-1"
                                            href="http://lattes.cnpq.br/9653406005081478"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <i className="fa fa-university"></i>
                                        </a>
                                    </div>
                                </div>
                                <div className="text-center p-4">
                                    <h5 className="mb-0">Lethicia Kelly Silva Sousa</h5>
                                    <small>Pesquisadora</small>
                                </div>
                            </div>
                        </div>

                        {/* Aluno 7 */}
                        <div
                            className="col-lg-3 col-md-6 wow fadeInUp"
                            data-wow-delay="0.9s"
                        >
                            <div className="team-item bg-light">
                                <div className="overflow-hidden">
                                    <img
                                        className="img-fluid"
                                        src={require('../assets/images/fundo-preto-com-textura-de-tecido.jpg')}
                                        alt="Felipe Samuel Martins"
                                    />
                                </div>
                                <div
                                    className="position-relative d-flex justify-content-center"
                                    style={{ marginTop: "-23px" }}
                                >
                                    <div className="bg-light d-flex justify-content-center pt-2 px-1">
                                        <a
                                            className="btn btn-sm-square btn-primary mx-1"
                                            href="http://lattes.cnpq.br/"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <i className="fa fa-university"></i>
                                        </a>
                                    </div>
                                </div>
                                <div className="text-center p-4">
                                    <h5 className="mb-0">Felipe Samuel Martins</h5>
                                    <small>Pesquisador</small>
                                </div>
                            </div>
                        </div>

                        {/* Aluno 8 */}
                        <div
                            className="col-lg-3 col-md-6 wow fadeInUp"
                            data-wow-delay="0.9s"
                        >
                            <div className="team-item bg-light">
                                <div className="overflow-hidden">
                                    <img
                                        className="img-fluid"
                                        src={require('../assets/images/lorena-foto-laps.jpg')}
                                        alt="Lorena de Menezes"
                                    />
                                </div>
                                <div
                                    className="position-relative d-flex justify-content-center"
                                    style={{ marginTop: "-23px" }}
                                >
                                    <div className="bg-light d-flex justify-content-center pt-2 px-1">
                                        <a
                                            className="btn btn-sm-square btn-primary mx-1"
                                            href="http://lattes.cnpq.br/6021023013048499"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <i className="fa fa-university"></i>
                                        </a>
                                    </div>
                                </div>
                                <div className="text-center p-4">
                                    <h5 className="mb-0">Lorena de Menezes</h5>
                                    <small>Pesquisadora</small>
                                </div>
                            </div>
                        </div>
                        {/* Aluno 9 */}
                        <div
                            className="col-lg-3 col-md-6 wow fadeInUp"
                            data-wow-delay="0.9s"
                        >
                            <div className="team-item bg-light">
                                <div className="overflow-hidden">
                                    <img
                                        className="img-fluid"
                                        src={require('../assets/images/renan-foto-laps.jpg')}
                                        alt="Renan de Jesus Montenegro da Silva"
                                    />
                                </div>
                                <div
                                    className="position-relative d-flex justify-content-center"
                                    style={{ marginTop: "-23px" }}
                                >
                                    <div className="bg-light d-flex justify-content-center pt-2 px-1">
                                        <a
                                            className="btn btn-sm-square btn-primary mx-1"
                                            href="http://lattes.cnpq.br/4024887727981168"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <i className="fa fa-university"></i>
                                        </a>
                                    </div>
                                </div>
                                <div className="text-center p-4">
                                    <h5 className="mb-0">Renan de Jesus Montenegro da Silva</h5>
                                    <small>Pesquisador</small>
                                </div>
                            </div>
                        </div>

                        {/* Aluno 10 */}
                        <div
                            className="col-lg-3 col-md-6 wow fadeInUp"
                            data-wow-delay="0.9s"
                        >
                            <div className="team-item bg-light">
                                <div className="overflow-hidden">
                                    <img
                                        className="img-fluid"
                                        src={require('../assets/images/paulo-batara-foto-laps.jpg')}
                                        alt="Paulo Alex Carvalho Barata"
                                    />
                                </div>
                                <div
                                    className="position-relative d-flex justify-content-center"
                                    style={{ marginTop: "-23px" }}
                                >
                                    <div className="bg-light d-flex justify-content-center pt-2 px-1">
                                        <a
                                            className="btn btn-sm-square btn-primary mx-1"
                                            href="http://lattes.cnpq.br/2740501731019156"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <i className="fa fa-university"></i>
                                        </a>
                                    </div>
                                </div>
                                <div className="text-center p-4">
                                    <h5 className="mb-0">Paulo Alex Carvalho Barata</h5>
                                    <small>Pesquisador</small>
                                </div>
                            </div>
                        </div>

                        {/* Aluno 11 */}
                        <div
                            className="col-lg-3 col-md-6 wow fadeInUp"
                            data-wow-delay="0.9s"
                        >
                            <div className="team-item bg-light">
                                <div className="overflow-hidden">
                                    <img
                                        className="img-fluid"
                                        src={require('../assets/images/pedro-gabriel-foto-laps.jpg')}
                                        alt="Pedro Gabriel Moreira Gonçalves"
                                    />
                                </div>
                                <div
                                    className="position-relative d-flex justify-content-center"
                                    style={{ marginTop: "-23px" }}
                                >
                                    <div className="bg-light d-flex justify-content-center pt-2 px-1">
                                        <a
                                            className="btn btn-sm-square btn-primary mx-1"
                                            href="http://lattes.cnpq.br/0443240684859582"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <i className="fa fa-university"></i>
                                        </a>
                                    </div>
                                </div>
                                <div className="text-center p-4">
                                    <h5 className="mb-0">Pedro Gabriel Moreira Gonçalves</h5>
                                    <small>Pesquisador</small>
                                </div>
                            </div>
                        </div>

                        {/* Aluno 12 */}
                        <div
                            className="col-lg-3 col-md-6 wow fadeInUp"
                            data-wow-delay="0.9s"
                        >
                            <div className="team-item bg-light">
                                <div className="overflow-hidden">
                                    <img
                                        className="img-fluid"
                                        src={require('../assets/images/rayara-foto-laps.jpg')}
                                        alt="Rayara Vitória Oliveira Pinho"
                                    />
                                </div>
                                <div
                                    className="position-relative d-flex justify-content-center"
                                    style={{ marginTop: "-23px" }}
                                >
                                    <div className="bg-light d-flex justify-content-center pt-2 px-1">
                                        <a
                                            className="btn btn-sm-square btn-primary mx-1"
                                            href="http://lattes.cnpq.br/1271296895086677"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <i className="fa fa-university"></i>
                                        </a>
                                    </div>
                                </div>
                                <div className="text-center p-4">
                                    <h5 className="mb-0">Rayara Vitória Oliveira Pinho</h5>
                                    <small>Pesquisadora</small>
                                </div>
                            </div>
                        </div>

                        {/* Aluno 13 */}
                        <div
                            className="col-lg-3 col-md-6 wow fadeInUp"
                            data-wow-delay="0.9s"
                        >
                            <div className="team-item bg-light">
                                <div className="overflow-hidden">
                                    <img
                                        className="img-fluid"
                                        src={require('../assets/images/fundo-preto-com-textura-de-tecido.jpg')}
                                        alt="Suami Gomes Santos"
                                    />
                                </div>
                                <div
                                    className="position-relative d-flex justify-content-center"
                                    style={{ marginTop: "-23px" }}
                                >
                                    <div className="bg-light d-flex justify-content-center pt-2 px-1">
                                        <a
                                            className="btn btn-sm-square btn-primary mx-1"
                                            href="http://lattes.cnpq.br/7438929038035533"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <i className="fa fa-university"></i>
                                        </a>
                                    </div>
                                </div>
                                <div className="text-center p-4">
                                    <h5 className="mb-0">Suami Gomes Santos</h5>
                                    <small>Pesquisador</small>
                                </div>
                            </div>
                        </div>

                        {/* Aluno 14 */}
                        <div
                            className="col-lg-3 col-md-6 wow fadeInUp"
                            data-wow-delay="0.9s"
                        >
                            <div className="team-item bg-light">
                                <div className="overflow-hidden">
                                    <img
                                        className="img-fluid"
                                        src={require('../assets/images/ayrton-foto-laps.jpg')}
                                        alt="Ayrton"
                                    />
                                </div>
                                <div
                                    className="position-relative d-flex justify-content-center"
                                    style={{ marginTop: "-23px" }}
                                >
                                    <div className="bg-light d-flex justify-content-center pt-2 px-1">
                                        <a
                                            className="btn btn-sm-square btn-primary mx-1"
                                            href="http://lattes.cnpq.br/"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <i className="fa fa-university"></i>
                                        </a>
                                    </div>
                                </div>
                                <div className="text-center p-4">
                                    <h5 className="mb-0">Ayrton Cesar Teixeira e Silva </h5>
                                    <small>Pesquisador</small>
                                </div>
                            </div>
                        </div>

                        {/* Aluno 15 */}
                        <div
                            className="col-lg-3 col-md-6 wow fadeInUp"
                            data-wow-delay="0.9s"
                        >
                            <div className="team-item bg-light">
                                <div className="overflow-hidden">
                                    <img
                                        className="img-fluid"
                                        src={require('../assets/images/fundo-preto-com-textura-de-tecido.jpg')}
                                        alt="Maria Teresa"
                                    />
                                </div>
                                <div
                                    className="position-relative d-flex justify-content-center"
                                    style={{ marginTop: "-23px" }}
                                >
                                    <div className="bg-light d-flex justify-content-center pt-2 px-1">
                                        <a
                                            className="btn btn-sm-square btn-primary mx-1"
                                            href="http://lattes.cnpq.br/"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <i className="fa fa-university"></i>
                                        </a>
                                    </div>
                                </div>
                                <div className="text-center p-4">
                                    <h5 className="mb-0">Maria Teresa</h5>
                                    <small>Pesquisadora</small>
                                </div>
                            </div>
                        </div>

                        {/* Aluno 16 */}
                        <div
                            className="col-lg-3 col-md-6 wow fadeInUp"
                            data-wow-delay="0.9s"
                        >
                            <div className="team-item bg-light">
                                <div className="overflow-hidden">
                                    <img
                                        className="img-fluid"
                                        src={require('../assets/images/sophia-foto-laps.jpg')}
                                        alt="Sophia Macedo"
                                    />
                                </div>
                                <div
                                    className="position-relative d-flex justify-content-center"
                                    style={{ marginTop: "-23px" }}
                                >
                                    <div className="bg-light d-flex justify-content-center pt-2 px-1">
                                        <a
                                            className="btn btn-sm-square btn-primary mx-1"
                                            href="http://lattes.cnpq.br/"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <i className="fa fa-university"></i>
                                        </a>
                                    </div>
                                </div>
                                <div className="text-center p-4">
                                    <h5 className="mb-0">Sophia Macedo</h5>
                                    <small>Pesquisadora</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Iniciação Científica End */}




            {/* Footer */}
            < div className="container-fluid bg-dark text-light footer pt-5 mt-5" >
                <div className="container py-5">
                    <div className="row g-5">
                        <div className="col-lg-3 col-md-6">
                            <h4 className="text-white mb-3">Quick Link</h4>
                            <a className="btn btn-link" href="about.html">
                                About Us
                            </a>
                            <a className="btn btn-link" href="contact.html">
                                Contact Us
                            </a>
                        </div>
                        <div className="col-lg-3 col-md-6">
                            <h4 className="text-white mb-3">Contact</h4>
                            <p className="mb-2">
                                <i className="fa fa-map-marker-alt me-3"></i>Cidade
                                Universitária Paulo VI, Av, Lourenço Vieira da Silva, nº 1000,
                                Jardim São Cristóvão, São Luís – MA
                            </p>
                        </div>
                    </div>
                </div>
            </div >
        </>
    );
};

export default Home;
