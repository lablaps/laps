"use client";

import { useEffect, useRef, useState } from 'react';

export default function WaveAnimation() {
  const svgRef = useRef<SVGSVGElement>(null);
  const animationRef = useRef<number | null>(null);
  const [dimensions, setDimensions] = useState({ width: 1200, height: 200 });

  useEffect(() => {
    // Set initial dimensions
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: 200
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

    // Clear existing paths
    while (svg.firstChild) {
      svg.removeChild(svg.firstChild);
    }

    // Create path elements
    const pathAzulClaro = document.createElementNS("http://www.w3.org/2000/svg", "path");
    pathAzulClaro.setAttribute("stroke", "#51AEB1");
    pathAzulClaro.setAttribute("stroke-width", "8");
    pathAzulClaro.setAttribute("fill", "none");
    pathAzulClaro.setAttribute("stroke-linecap", "round");
    pathAzulClaro.setAttribute("stroke-linejoin", "round");
    svg.appendChild(pathAzulClaro);

    const pathAzulEscuro = document.createElementNS("http://www.w3.org/2000/svg", "path");
    pathAzulEscuro.setAttribute("stroke", "#003A70");
    pathAzulEscuro.setAttribute("stroke-width", "8");
    pathAzulEscuro.setAttribute("fill", "none");
    pathAzulEscuro.setAttribute("stroke-linecap", "round");
    pathAzulEscuro.setAttribute("stroke-linejoin", "round");
    svg.appendChild(pathAzulEscuro);

    let t = 0;

    function animate() {
      const freq = 0.015; // Frequência mais suave
      const amp = 35; // Amplitude um pouco menor
      const speed = 0.025; // Velocidade mais suave

      let d1 = "M 0 " + (height / 2);
      let d2 = "M 0 " + (height / 2);

      for (let x = 0; x <= width; x += 8) {
        const y1 = height / 2 + amp * Math.sin(freq * x + t);
        const y2 = height / 2 + amp * Math.sin(freq * x + t + Math.PI); // defasada

        d1 += ` L ${x} ${y1}`;
        d2 += ` L ${x} ${y2}`;
      }

      pathAzulClaro.setAttribute("d", d1);
      pathAzulEscuro.setAttribute("d", d2);

      t += speed;
      animationRef.current = requestAnimationFrame(animate);
    }

    animate();

    // Cleanup function
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [dimensions]);

  return (
    <div className="relative bg-gradient-to-b from-gray-50 to-white h-[200px] w-full overflow-hidden border-b border-gray-100">
      <svg 
        ref={svgRef} 
        width="100%" 
        height="200"
        className="block"
        style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
      />
      
      {/* Overlay gradient for smooth integration */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/20 pointer-events-none" />
    </div>
  );
}
