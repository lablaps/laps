import React from "react";
import 'font-awesome/css/font-awesome.min.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'animate.css';


const Home = () => {
    return (
        <>
        
            {/* Carousel Start */}
            <div className="container-fluid p-0 mb-5">
                <div className="owl-carousel header-carousel position-relative">
                    <div className="owl-carousel-item position-relative">
                        <img className="img-fluid" src={require('../assets/images/laps1.PNG')} alt="LAPS Carousel 1" />
                        <div
                            className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center"
                            style={{ background: 'rgba(24, 29, 56, .7)' }}
                        >
                            <div className="container">
                                <div className="row justify-content-start">
                                    <div className="col-sm-10 col-lg-8">
                                        <h1 className="display-3 text-white animated slideInDown">
                                            <strong>LAPS</strong>
                                        </h1>
                                        <p className="fs-5 text-white mb-4 pb-2">
                                            Laboratório de Aquisição e Processamento de Sinais.
                                            <br />
                                            Aplicação nas áreas de Aquisição de Sinais, Inteligência Artificial, Redes de Sensores sem fio, Eletrônica e Processamento de Sinais.
                                        </p>
                                        <a
                                            href="about.html"
                                            className="btn btn-primary py-md-3 px-md-5 me-3 animated slideInLeft"
                                        >
                                            Saiba mais...
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Carousel End */}

            {/* Service Start */}
            <div className="container-xxl py-5">
                <div className="container">
                    <div className="row g-4">
                        <div className="col-lg-3 col-sm-6 wow fadeInUp" data-wow-delay="0.1s">
                            <div className="service-item text-center pt-3">
                                <div className="p-4">
                                    <i className="fa fa-3x fa-graduation-cap text-primary mb-4"></i>
                                    <h5 className="mb-3">Professores renomados</h5>
                                    <p>Os melhores da UEMA!</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-3 col-sm-6 wow fadeInUp" data-wow-delay="0.3s">
                            <div className="service-item text-center pt-3">
                                <div className="p-4">
                                    <i className="fa fa-3x fa-globe text-primary mb-4"></i>
                                    <h5 className="mb-3">Bolsistas no Exterior</h5>
                                    <p>Aqui temos nossa equipe de estudantes fora do Brasil.</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-3 col-sm-6 wow fadeInUp" data-wow-delay="0.5s">
                            <div className="service-item text-center pt-3">
                                <div className="p-4">
                                    <i className="fa fa-3x fa-home text-primary mb-4"></i>
                                    <h5 className="mb-3">Projetos</h5>
                                    <p>Descubra mais sobre nossos projetos atuais.</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-3 col-sm-6 wow fadeInUp" data-wow-delay="0.7s">
                            <div className="service-item text-center pt-3">
                                <div className="p-4">
                                    <i className="fa fa-3x fa-book-open text-primary mb-4"></i>
                                    <h5 className="mb-3">Artigos Publicados</h5>
                                    <p>Produções literárias já publicadas em revistas, livros e outros.</p>
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
                        {/* Imagem Sobre Nós */}
                        <div className="col-lg-6 wow fadeInUp" data-wow-delay="0.1s">
                            <img
                                className="img-fluid position-absolute w-100 h-100"
                                src={require("../assets/images/placa.jpg")}
                                alt="Sobre Nós"
                                style={{ objectFit: "cover" }}
                            />
                        </div>
                        {/* Texto Sobre Nós */}
                        <div className="col-lg-6 wow fadeInUp" data-wow-delay="0.3s">
                            <h6 className="section-title bg-white text-start text-primary pe-3">
                                Sobre nós
                            </h6>
                            <h1 className="mb-4">Bem-vindo ao LAPS</h1>
                            <p>
                                No LAPS (Laboratório de Aquisição e Processamento de Sinais),
                                somos dedicados a publicar melhorias científicas. Nossa facilidade
                                é um hobby para inovação e colaboração, onde conhecemos tecnologias
                                com propósito em conhecimento.
                            </p>
                            <a
                                className="btn btn-primary py-3 px-5 mt-2"
                                href="about.html"
                                target="_blank"
                                rel="noopener noreferrer"
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

            {/* Doutores Section */}
            <div className="container-xxl py-5">
                <div className="container">
                    <div className="text-center wow fadeInUp" data-wow-delay="0.1s">
                        <h1 className="mb-5">Doutores</h1>
                    </div>
                    <div className="row g-4">
                        {/* Doutor 1 */}
                        <div className="col-lg-3 col-md-6 wow fadeInUp" data-wow-delay="0.1s">
                            <div className="team-item bg-light">
                                <div className="overflow-hidden">
                                    <img className="img-fluid" src={require('../assets/images/professor-magno.jpg')} alt="Dr. Carlos Magno Sousa Júnior" />
                                </div>
                                <div
                                    className="position-relative d-flex justify-content-center"
                                    style={{ marginTop: "-23px" }}
                                >
                                    <div className="bg-light d-flex justify-content-center pt-2 px-1">
                                        <a
                                            className="btn btn-sm-square btn-primary mx-1"
                                            href="http://lattes.cnpq.br/9561853644051629"
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
                        {/* Adicione mais doutores da mesma forma */}
                    </div>
                </div>
            </div>

            {/* Doutorandos Section */}
            <div className="container-xxl py-5">
                <div className="container">
                    <div className="text-center wow fadeInUp" data-wow-delay="0.1s">
                        <h1 className="mb-5">Doutorandos</h1>
                    </div>
                    <div className="row g-4">
                        <div className="col-lg-3 col-md-6 wow fadeInUp" data-wow-delay="0.1s">
                            <div className="team-item bg-light">
                                <div className="overflow-hidden">
                                    <img className="img-fluid" src={require('../assets/images/fundo-preto-com-textura-de-tecido.jpg')} alt="Antonio Fhillipi Maciel Silva" />

                                </div>
                                <div
                                    className="position-relative d-flex justify-content-center"
                                    style={{ marginTop: "-23px" }}
                                >
                                    <div className="bg-light d-flex justify-content-center pt-2 px-1">
                                        <a
                                            className="btn btn-sm-square btn-primary mx-1"
                                            href="http://lattes.cnpq.br/2741380271392818"
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
                        {/* Adicione mais doutorandos da mesma forma */}
                    </div>
                </div>
            </div>

            {/* Mestrandos Section */}
            <div className="container-xxl py-5">
                <div className="container">
                    <div className="text-center wow fadeInUp" data-wow-delay="0.1s">
                        <h1 className="mb-5">Mestrandos</h1>
                    </div>
                    <div className="row g-4">
                        <div className="col-lg-3 col-md-6 wow fadeInUp" data-wow-delay="0.1s">
                            <div className="team-item bg-light">
                                <div className="overflow-hidden">
                                    <img className="img-fluid" src={require('../assets/images/fundo-preto-com-textura-de-tecido.jpg')} alt="Jorge de Jesus Passinho Segundo" />

                                </div>
                                <div
                                    className="position-relative d-flex justify-content-center"
                                    style={{ marginTop: "-23px" }}
                                >
                                    <div className="bg-light d-flex justify-content-center pt-2 px-1">
                                        <a
                                            className="btn btn-sm-square btn-primary mx-1"
                                            href="http://lattes.cnpq.br/4913020111289067"
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
                        {/* Adicione mais mestrandos da mesma forma */}
                    </div>
                </div>
            </div>



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
