"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from 'react';

export default function HeroSection() {
  const svgRef = useRef<SVGSVGElement>(null);
  const animationRef = useRef<number | null>(null);  const [dimensions, setDimensions] = useState({ width: 1200, height: 250 });

  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: 250
      });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const { width, height } = dimensions;
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);

    while (svg.firstChild) {
      svg.removeChild(svg.firstChild);
    }

    // Create multiple wave paths for more complex animation
    const createPath = (color: string, strokeWidth: string) => {
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("stroke", color);
      path.setAttribute("stroke-width", strokeWidth);
      path.setAttribute("fill", "none");
      path.setAttribute("stroke-linecap", "round");
      path.setAttribute("stroke-linejoin", "round");
      path.setAttribute("opacity", "0.8");
      svg.appendChild(path);
      return path;
    };

    const pathAzulClaro1 = createPath("#51AEB1", "6");
    const pathAzulClaro2 = createPath("#51AEB1", "4");
    const pathAzulEscuro1 = createPath("#003A70", "6");
    const pathAzulEscuro2 = createPath("#003A70", "4");

    let t = 0;    function animate() {
      const baseFreq = 0.008;
      const baseAmp = 30;
      const speed = 0.015;

      // Multiple waves with different frequencies, amplitudes, and phases
      const waves = [
        { 
          path: pathAzulClaro1, 
          freq: baseFreq, 
          amp: baseAmp, 
          phase: 0, 
          yOffset: 0,
          verticalFreq: 0.3,
          verticalAmp: 12
        },
        { 
          path: pathAzulClaro2, 
          freq: baseFreq * 1.7, 
          amp: baseAmp * 0.5, 
          phase: Math.PI / 2, 
          yOffset: 15,
          verticalFreq: 0.5,
          verticalAmp: 8
        },
        { 
          path: pathAzulEscuro1, 
          freq: baseFreq * 0.9, 
          amp: baseAmp * 1.1, 
          phase: Math.PI, 
          yOffset: -5,
          verticalFreq: 0.4,
          verticalAmp: 10
        },
        { 
          path: pathAzulEscuro2, 
          freq: baseFreq * 1.3, 
          amp: baseAmp * 0.7, 
          phase: Math.PI * 1.8, 
          yOffset: -12,
          verticalFreq: 0.35,
          verticalAmp: 15
        }
      ];

      waves.forEach(wave => {
        let d = `M 0 ${height / 2 + wave.yOffset}`;
        
        for (let x = 0; x <= width; x += 4) {
          // Complex vertical movement combining multiple sine waves
          const globalVerticalMovement = Math.sin(t * wave.verticalFreq) * wave.verticalAmp;
          const localVerticalMovement = Math.sin(t * 0.8 + x * 0.002) * (wave.verticalAmp * 0.3);
          const breathingEffect = Math.cos(t * 0.2) * 5;
          
          const y = height / 2 + wave.yOffset + 
                   wave.amp * Math.sin(wave.freq * x + t + wave.phase) +
                   globalVerticalMovement + 
                   localVerticalMovement +
                   breathingEffect;
          
          d += ` L ${x} ${y}`;
        }
        
        wave.path.setAttribute("d", d);
      });

      t += speed;
      animationRef.current = requestAnimationFrame(animate);
    }

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [dimensions]);

  return (
    <section className="relative min-h-screen flex flex-col bg-gradient-to-b from-gray-50 via-white to-gray-50 dark:from-black dark:via-gray-950 dark:to-black">      
      {/* Wave Animation at Top */}
      <div className="absolute top-0 left-0 right-0 h-[250px] overflow-hidden z-10">
        <svg 
          ref={svgRef} 
          width="100%" 
          height="250"
          className="block"
          style={{ filter: 'drop-shadow(0 4px 20px rgba(0,122,255,0.12))' }}
        />
        {/* Gradient overlay for smoother transition */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-transparent via-white/20 to-transparent dark:via-black/20" />
      </div>

      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-100"></div>
      
      {/* Content */}
      <div className="flex-1 flex items-center justify-center pt-[280px] pb-24">
        <div className="container mx-auto px-6 text-center relative z-10">
          <div className="max-w-4xl mx-auto">

            {/* Main Title - academic style without gradients */}
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight tracking-tight">
              Laboratório de Aquisição e
              <span className="text-blue-700 dark:text-blue-400 block mt-2">
                Processamento de Sinais
              </span>
            </h1>

            {/* Subtitle - professional tone */}
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-10 max-w-3xl mx-auto font-normal leading-relaxed">
              Desenvolvendo tecnologias inovadoras em processamento de sinais e 
              inteligência artificial para impactar positivamente a sociedade
            </p>

            {/* CTA Buttons - simple and professional */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Button asChild size="lg" className="text-base px-8 py-6 rounded-lg ios-shadow hover-lift active-press font-medium bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 border-0">
                <Link href="/projetos">
                  Nossos Projetos
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-base px-8 py-6 rounded-lg ios-shadow hover-lift active-press font-medium bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                <Link href="/sobre">
                  Conheça o LAPS
                </Link>
              </Button>
            </div>

            {/* Stats - clean cards without blur effects */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 ios-shadow hover-lift transition-ios border border-gray-200 dark:border-gray-700">
                <div className="text-4xl md:text-5xl font-bold text-blue-700 dark:text-blue-400 mb-2">15+</div>
                <div className="text-sm md:text-base text-gray-600 dark:text-gray-300 font-medium">Anos de Pesquisa</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 ios-shadow hover-lift transition-ios border border-gray-200 dark:border-gray-700">
                <div className="text-4xl md:text-5xl font-bold text-green-700 dark:text-green-400 mb-2">50+</div>
                <div className="text-sm md:text-base text-gray-600 dark:text-gray-300 font-medium">Publicações</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 ios-shadow hover-lift transition-ios border border-gray-200 dark:border-gray-700">
                <div className="text-4xl md:text-5xl font-bold text-orange-700 dark:text-orange-400 mb-2">20+</div>
                <div className="text-sm md:text-base text-gray-600 dark:text-gray-300 font-medium">Projetos Ativos</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 ios-shadow hover-lift transition-ios border border-gray-200 dark:border-gray-700">
                <div className="text-4xl md:text-5xl font-bold text-purple-700 dark:text-purple-400 mb-2">30+</div>
                <div className="text-sm md:text-base text-gray-600 dark:text-gray-300 font-medium">Pesquisadores</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator with iOS-style animation */}
      <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-8 h-12 rounded-full border-2 border-gray-400 dark:border-gray-600 flex items-start justify-center p-2">
          <div className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-600 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
}
