'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useNavigation } from '@/context/NavigationContext';

interface PageTransitionProps {
  children: React.ReactNode;
}

const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  const { direction } = useNavigation();
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Reset inicial
    gsap.set(containerRef.current, {
      opacity: 1,
      x: 0,
    });

    // Animar entrada
    if (direction) {
      const startX = direction === 'left' ? 100 : -100;
      
      gsap.fromTo(
        containerRef.current,
        {
          opacity: 0,
          x: startX,
        },
        {
          opacity: 1,
          x: 0,
          duration: 0.6,
          ease: 'power2.out',
        }
      );
    }
  }, [direction]);

  return (
    <div ref={containerRef}>
      {children}
    </div>
  );
};

export default PageTransition;
