"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronDown } from "lucide-react";
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
    <section className="relative min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">      {/* Wave Animation at Top */}
      <div className="absolute top-0 left-0 right-0 h-[250px] overflow-hidden z-10 bg-gradient-to-b from-white/80 via-white/60 to-transparent dark:from-gray-900/80 dark:via-gray-900/60 dark:to-transparent">
        <svg 
          ref={svgRef} 
          width="100%" 
          height="250"
          className="block"
          style={{ filter: 'drop-shadow(0 2px 12px rgba(0,0,0,0.15))' }}
        />
        {/* Additional gradient overlay for smoother transition */}
        <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-transparent to-white/30 dark:to-gray-900/30" />
      </div>

      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>        {/* Content */}
      <div className="flex-1 flex items-center justify-center pt-[250px]">
        <div className="container mx-auto px-6 text-center relative z-10">
          <div className="max-w-4xl mx-auto">

            {/* Main Title */}
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              Laboratório de Aquisição e
              <span className="text-blue-600 dark:text-blue-400 block">
                Processamento de Sinais
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              Desenvolvendo tecnologias inovadoras em processamento de sinais e 
              inteligência artificial para impactar positivamente a sociedade
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button asChild size="lg" className="text-lg px-8 py-6">
                <Link href="/projetos">
                  Nossos Projetos
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6">
                <Link href="/sobre">
                  Conheça o LAPS
                </Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">15+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Anos de Pesquisa</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">50+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Publicações</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">20+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Projetos Ativos</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">30+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Pesquisadores</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <ChevronDown className="h-8 w-8 text-gray-400" />
      </div>
    </section>
  );
}
