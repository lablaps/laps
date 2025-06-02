import Link from 'next/link';
import { Mail, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo e Descrição */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-bold text-blue-400 mb-4">LAPS</h3>
            <p className="text-gray-300 mb-4">
              Laboratório de Aquisição e Processamento de Sinais da UEMA. 
              Dedicado à pesquisa e inovação em processamento de sinais, 
              inteligência artificial e sistemas embarcados.
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://instagram.com/laps_uema" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Instagram
              </a>
              <a 
                href="https://github.com/lablaps" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                GitHub
              </a>
            </div>
          </div>

          {/* Links Rápidos */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Links Rápidos</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/sobre" className="text-gray-300 hover:text-white transition-colors">
                  Sobre
                </Link>
              </li>
              <li>
                <Link href="/projetos" className="text-gray-300 hover:text-white transition-colors">
                  Projetos
                </Link>
              </li>
              <li>
                <Link href="/noticias" className="text-gray-300 hover:text-white transition-colors">
                  Notícias
                </Link>
              </li>
              <li>
                <Link href="/eventos" className="text-gray-300 hover:text-white transition-colors">
                  Eventos
                </Link>
              </li>
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contato</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <MapPin size={16} className="text-blue-400" />
                <span className="text-gray-300 text-sm">
                  CCT, Cidade Universitária Paulo VI, São Luís - MA
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail size={16} className="text-blue-400" />
                <a 
                  href="mailto:laps@engcomp.uema.br" 
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  laps@engcomp.uema.br
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2025 LAPS - Laboratório de Aquisição e Processamento de Sinais. Todos os direitos reservados.
            </p>
            <p className="text-gray-400 text-sm mt-2 md:mt-0">
              Desenvolvido pela Equipe de Desenvolvimento LAPS
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
