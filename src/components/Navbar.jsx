import React from 'react';

const Navbar = () => {
    return (
        <nav className="navbar navbar-expand-lg bg-white navbar-light shadow sticky-top p-0">
            <a href="Home" className="navbar-brand d-flex align-items-center px-4 px-lg-5">
                <h2 className="m-0 text-primary">LAPS</h2>
            </a>
            <button
                type="button"
                className="navbar-toggler me-4"
                data-bs-toggle="collapse"
                data-bs-target="#navbarCollapse"
            >
                <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarCollapse">
                <div className="navbar-nav ms-auto p-4 p-lg-0">
                    <a href="Home" className="nav-item nav-link">Home</a>
                    <a href="about" className="nav-item nav-link">Sobre</a>
                    <a href="news" className="nav-item nav-link">Notícias</a>
                    <a href="events" className="nav-item nav-link active">Eventos</a>
                    <a href="projects" className="nav-item nav-link">Projetos</a>
                    <a href="contact" className="nav-item nav-link">Contatos</a>
                </div>
                <a
                    href="https://forms.gle/NTwE9Y5EmdFMs3eH9"
                    className="btn btn-primary py-4 px-lg-5 d-none d-lg-block"
                >
                    Envie uma mensagem<i className="fa fa-arrow-right ms-3"></i>
                </a>
            </div>
        </nav>
    );
};

export default Navbar;
