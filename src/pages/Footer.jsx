import React from "react";

const Footer = () => {
    return (
        <div className="container-fluid bg-dark text-light footer pt-5 mt-5 wow fadeIn" data-wow-delay="0.1s">
            <div className="container py-5">
                <div className="row g-5">
                    <div className="col-lg-3 col-md-6">
                        <h4 className="text-white mb-3">Quick Link</h4>
                        <a className="btn btn-link" href="/about">About Us</a>
                        <a className="btn btn-link" href="/contact">Contact Us</a>
                    </div>
                    <div className="col-lg-3 col-md-6">
                        <h4 className="text-white mb-3">Contact</h4>
                        <p className="mb-2">
                            <i className=""></i>
                            Cidade Universitária Paulo VI, Av, Lourenço Vieira da Silva, nº 1000, Jardim São Cristóvão, CEP: 65055-310, São Luís – MA
                        </p>
                        {/* 
            <p className="mb-2">
              <i className="fa fa-phone-alt me-3"></i>+012 345 67890
            </p>
            <p className="mb-2">
              <i className="fa fa-envelope me-3"></i>info@example.com
            </p>
            */}
                        <div className="d-flex pt-2">
                            {/* Redes Sociais
              <a className="btn btn-outline-light btn-social" href=""><i className="fab fa-twitter"></i></a>
              <a className="btn btn-outline-light btn-social" href=""><i className="fab fa-facebook-f"></i></a>
              <a className="btn btn-outline-light btn-social" href=""><i className="fab fa-youtube"></i></a>
              <a className="btn btn-outline-light btn-social" href=""><i className="fab fa-linkedin-in"></i></a>
              */}
                        </div>
                    </div>
                    {/* Espaço para futuras seções */}
                    <div className="col-lg-3 col-md-6"></div>
                    <div className="col-lg-3 col-md-6"></div>
                </div>
            </div>
            <div className="container">
                <div className="copyright">
                    <div className="row">
                        <div className="col-md-6 text-center text-md-start mb-3 mb-md-0">
                            &copy; <a className="border-bottom" href="#">LAPS</a>, All Right Reserved.
                            <br />
                            Designed By&nbsp;
                            <a
                                className="border-bottom"
                                href="https://github.com/Luluzao0"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Luis
                            </a>
                            &nbsp;&amp;&nbsp;
                            <a
                                className="border-bottom"
                                href="https://github.com/Pmelo22"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Patrick
                            </a>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default Footer;
