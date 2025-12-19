'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';

interface TeamNode {
  id: string;
  name: string;
  role: 'director' | 'doctor' | 'phd_student' | 'master_student' | 'undergraduate';
  bio: string;
  expertise: string[];
  researchAreas: string[];
  email?: string;
  image?: string;
  active: boolean;
}

interface TeamLink {
  source: string;
  target: string;
  strength: number;
  collaborationType: string;
}

/**
 * Componente que renderiza um grafo de força interativo
 * Representa a rede de colaborações entre membros da equipe
 * 
 * Props:
 * - onNodeClick: Callback quando um nó é clicado
 */
interface NetworkGraphProps {
  onNodeClick: (node: TeamNode) => void;
  selectedNodeId?: string;
}

interface GraphNode extends TeamNode {
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number;
  fy?: number;
}

interface GraphLink {
  source: GraphNode;
  target: GraphNode;
  strength: number;
  collaborationType: string;
}

export const NetworkGraph: React.FC<NetworkGraphProps> = ({ onNodeClick, selectedNodeId }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [links, setLinks] = useState<GraphLink[]>([]);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const animationRef = useRef<number | null>(null);
  const simulationRef = useRef<any>(null);

  // Carrega dados do banco de dados
  useEffect(() => {
    async function loadData() {
      try {
        const [membersRes, collabsRes] = await Promise.all([
          fetch('/api/members'),
          fetch('/api/collaborations'),
        ]);

        const members: TeamNode[] = await membersRes.json();
        const collaborations = await collabsRes.json();

        // Inicializa nós
        const graphNodes: GraphNode[] = members.map((node) => ({
          ...node,
          x: Math.random() * 400 - 200,
          y: Math.random() * 400 - 200,
          vx: 0,
          vy: 0,
        }));

        // Cria links a partir das colaborações
        const graphLinks: GraphLink[] = collaborations
          .filter((collab: any) => {
            const source = graphNodes.find((n) => n.id === collab.memberId1);
            const target = graphNodes.find((n) => n.id === collab.memberId2);
            return source && target;
          })
          .map((collab: any) => {
            const source = graphNodes.find((n) => n.id === collab.memberId1)!;
            const target = graphNodes.find((n) => n.id === collab.memberId2)!;
            return {
              source,
              target,
              strength: collab.strength || 1,
              collaborationType: collab.type || 'collaboration',
            };
          });

        setNodes(graphNodes);
        setLinks(graphLinks);

        simulationRef.current = {
          alpha: 1,
          alphaDecay: 0.02,
          alphaMin: 0.001,
          velocityDecay: 0.4,
          forceStrength: -40,
          linkDistance: 80,
        };

        setLoading(false);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Aplica forças e simula física
  const simulate = useCallback(() => {
    if (nodes.length === 0 || !simulationRef.current) return;

    const sim = simulationRef.current;
    sim.alpha += (sim.alphaMin - sim.alpha) * sim.alphaDecay;

    // Forças de repulsão entre nós
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i];
        const b = nodes[j];
        const dx = b.x! - a.x!;
        const dy = b.y! - a.y!;
        const distance = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = sim.forceStrength / (distance * distance);

        a.vx! -= (force * dx) / distance;
        a.vy! -= (force * dy) / distance;
        b.vx! += (force * dx) / distance;
        b.vy! += (force * dy) / distance;
      }
    }

    // Forças de atração entre links
    links.forEach((link) => {
      const dx = link.target.x! - link.source.x!;
      const dy = link.target.y! - link.source.y!;
      const distance = Math.sqrt(dx * dx + dy * dy) || 1;
      const targetDistance = sim.linkDistance * (1 + (5 - link.strength) * 0.1);
      const force = (distance - targetDistance) * 0.1;

      const fx = (force * dx) / distance;
      const fy = (force * dy) / distance;

      link.source.vx! += fx;
      link.source.vy! += fy;
      link.target.vx! -= fx;
      link.target.vy! -= fy;
    });

    // Atualiza posições
    nodes.forEach((node) => {
      if (node.fx !== undefined) {
        node.x = node.fx;
        node.y = node.fy;
        node.vx = 0;
        node.vy = 0;
      } else {
        node.vx! *= sim.velocityDecay;
        node.vy! *= sim.velocityDecay;
        node.x! += node.vx!;
        node.y! += node.vy!;
      }
    });

    setNodes([...nodes]);
  }, [nodes, links]);

  // Loop de animação
  useEffect(() => {
    const animate = (_timestamp?: DOMHighResTimeStamp) => {
      simulate();
      draw();
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationRef.current!);
  }, [simulate]);

  // Desenha o grafo no canvas
  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Limpa o canvas
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, width, height);

    const scale = 1.5;
    const offsetX = width / 2;
    const offsetY = height / 2;

    // Desenha links
    ctx.strokeStyle = '#d1d5db';
    ctx.lineWidth = 1;
    links.forEach((link) => {
      const sx = link.source.x! * scale + offsetX;
      const sy = link.source.y! * scale + offsetY;
      const tx = link.target.x! * scale + offsetX;
      const ty = link.target.y! * scale + offsetY;

      const isConnectedToHovered =
        hoveredNodeId &&
        (link.source.id === hoveredNodeId || link.target.id === hoveredNodeId);

      if (isConnectedToHovered) {
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2;
      } else if (hoveredNodeId) {
        ctx.strokeStyle = '#e5e7eb';
        ctx.lineWidth = 0.5;
      } else {
        ctx.strokeStyle = '#d1d5db';
        ctx.lineWidth = 1;
      }

      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(tx, ty);
      ctx.stroke();
    });

    // Desenha nós
    nodes.forEach((node) => {
      const x = node.x! * scale + offsetX;
      const y = node.y! * scale + offsetY;
      const isHovered = node.id === hoveredNodeId;
      const isSelected = node.id === selectedNodeId;

      // Tamanho do nó baseado no role
      const roleSize: { [key: string]: number } = {
        director: 20,
        doctor: 16,
        phd_student: 14,
        master_student: 12,
        undergraduate: 10,
      };
      const radius = roleSize[node.role] || 12;

      // Desenha círculo de fundo
      if (isHovered || isSelected) {
        ctx.fillStyle = isSelected ? '#3b82f6' : '#60a5fa';
        ctx.beginPath();
        ctx.arc(x, y, radius + 4, 0, Math.PI * 2);
        ctx.fill();
      }

      // Desenha nó
      ctx.fillStyle = getRoleColor(node.role);
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();

      // Borda do nó
      ctx.strokeStyle = isHovered || isSelected ? '#1e40af' : '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Desenha label (iniciais do nome)
      const initials = node.name
        .split(' ')
        .slice(0, 2)
        .map((n) => n[0])
        .join('')
        .toUpperCase();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(initials, x, y);

      // Reduz opacidade de nós não conectados ao hovered
      if (hoveredNodeId && node.id !== hoveredNodeId) {
        const isConnected = links.some(
          (link) =>
            (link.source.id === hoveredNodeId && link.target.id === node.id) ||
            (link.target.id === hoveredNodeId && link.source.id === node.id)
        );
        if (!isConnected) {
          // Já desenhado com opacidade reduzida pelo link
        }
      }
    });
  };

  // Detecta clique em nó
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - canvas.width / 2) / 1.5;
    const y = (e.clientY - rect.top - canvas.height / 2) / 1.5;

    for (const node of nodes) {
      const dx = node.x! - x;
      const dy = node.y! - y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      const roleSize: { [key: string]: number } = {
        director: 20,
        doctor: 16,
        phd_student: 14,
        master_student: 12,
        undergraduate: 10,
      };
      const radius = roleSize[node.role] || 12;

      if (distance < radius + 4) {
        onNodeClick(node);
        return;
      }
    }
  };

  // Detecta hover em nó
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - canvas.width / 2) / 1.5;
    const y = (e.clientY - rect.top - canvas.height / 2) / 1.5;

    let foundNode = null;

    for (const node of nodes) {
      const dx = node.x! - x;
      const dy = node.y! - y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      const roleSize: { [key: string]: number } = {
        director: 20,
        doctor: 16,
        phd_student: 14,
        master_student: 12,
        undergraduate: 10,
      };
      const radius = roleSize[node.role] || 12;

      if (distance < radius + 8) {
        foundNode = node.id;
        break;
      }
    }

    setHoveredNodeId(foundNode);
    if (foundNode) {
      canvas.style.cursor = 'pointer';
    } else {
      canvas.style.cursor = 'default';
    }
  };

  const handleCanvasMouseLeave = () => {
    setHoveredNodeId(null);
  };

  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-50 to-blue-50 rounded-lg overflow-hidden border border-blue-100 flex items-center justify-center">
      {loading ? (
        <div className="text-center">
          <div className="inline-block animate-spin mb-4">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full"></div>
          </div>
          <p className="text-slate-600 font-medium">Carregando rede de colaborações...</p>
        </div>
      ) : nodes.length === 0 ? (
        <div className="text-center">
          <p className="text-slate-600 font-medium">Nenhum membro na equipe ainda</p>
          <p className="text-sm text-slate-500">Adicione membros no painel administrativo</p>
        </div>
      ) : (
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          onClick={handleCanvasClick}
          onMouseMove={handleCanvasMouseMove}
          onMouseLeave={handleCanvasMouseLeave}
          className="w-full h-full"
        />
      )}
    </div>
  );
};

/**
 * Retorna a cor baseada no role do membro
 */
function getRoleColor(role: string): string {
  const colors: { [key: string]: string } = {
    director: '#0891b2', // Cyan
    doctor: '#0ea5e9', // Sky blue
    phd_student: '#3b82f6', // Blue
    master_student: '#60a5fa', // Light blue
    undergraduate: '#93c5fd', // Lighter blue
  };
  return colors[role] || '#3b82f6';
}
