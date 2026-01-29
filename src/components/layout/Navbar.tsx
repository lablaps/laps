'use client';

import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useNavigation } from '@/context/NavigationContext';

const navItems = [
  { name: 'Sobre', href: '/sobre' },
  { name: 'Equipe', href: '/equipe' },
  { name: 'Home', href: '/', active: true },
  { name: 'Projetos', href: '/projetos' },
  { name: 'Contato', href: '/contato' },
];

const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { setDirection, setCurrentIndex } = useNavigation();
  const navRefs = useRef<(HTMLDivElement | null)[]>([]);
  const highlightRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [refsReady, setRefsReady] = useState(false);
  const previousIndexRef = useRef<number>(2); // Home é o índice 2

  // Inicializar refs quando componente montar
  useEffect(() => {
    setRefsReady(true);
  }, []);

  useEffect(() => {
    if (!refsReady) return;

    // Normalizar pathname removendo barra final
    const normalizedPathname = pathname.endsWith('/') && pathname !== '/' 
      ? pathname.slice(0, -1) 
      : pathname;

    const activeIndex = navItems.findIndex(
      (item) => normalizedPathname === item.href || (item.href === '/' && normalizedPathname === '')
    );

    if (activeIndex === -1) {
      return;
    }

    // Detectar direção da navegação
    if (activeIndex !== previousIndexRef.current) {
      const newDirection = activeIndex > previousIndexRef.current ? 'right' : 'left';
      setDirection(newDirection);
      previousIndexRef.current = activeIndex;
    }

    setCurrentIndex(activeIndex);

    // Aguardar para garantir que o DOM está renderizado
    const timer = setTimeout(() => {
      const activeElement = navRefs.current[activeIndex];
      const highlight = highlightRef.current;
      const container = containerRef.current;

      if (!activeElement || !highlight || !container) {
        console.log('Missing refs:', { activeElement: !!activeElement, highlight: !!highlight, container: !!container });
        return;
      }

      const containerRect = container.getBoundingClientRect();
      const itemRect = activeElement.getBoundingClientRect();

      const relativeLeft = itemRect.left - containerRect.left;
      const width = itemRect.width;
      const height = itemRect.height;

      gsap.to(highlight, {
        left: relativeLeft,
        top: 0,
        width: width,
        height: height,
        duration: 0.5,
        ease: 'power3.out',
      });
    }, 50);

    return () => clearTimeout(timer);
  }, [pathname, refsReady, setDirection, setCurrentIndex]);

  return (
    <nav className="fixed top-8 left-0 right-0 z-50 flex justify-center pointer-events-none">
      <div 
        ref={containerRef}
        className="relative flex items-center gap-3 md:gap-6 pointer-events-auto"
      >
        {/* Highlight background animado */}
        <div
          ref={highlightRef}
          className="absolute bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-lg shadow-blue-600/60 z-0 pointer-events-none"
          style={{
            boxShadow: '0 0 30px rgba(37, 99, 235, 0.6), inset 0 1px 0 rgba(235, 235, 235, 0.2)',
          }}
        />

        {navItems.map((item, index) => {
          const normalizedPathname = pathname.endsWith('/') && pathname !== '/' 
            ? pathname.slice(0, -1) 
            : pathname;
          const isActive = normalizedPathname === item.href || (item.href === '/' && normalizedPathname === '');
          
          return (
            <Link key={item.name} href={item.href}>
              <div
                ref={(el) => {
                  navRefs.current[index] = el;
                }}
                className={`
                  relative z-10 px-5 py-2.5 rounded-2xl text-sm font-bold tracking-wide
                  flex items-center justify-center min-w-[100px] cursor-pointer
                  transition-colors duration-300
                  ${isActive
                    ? 'text-white' 
                    : 'text-black hover:text-blue-600'
                  }
                `}
              >
                {item.name}
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default Navbar;
