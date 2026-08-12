import React, { useMemo, useState } from 'react';
import { CodeGeneratorModal } from './CodeGeneratorModal';

interface AnimatedArchitectureFlowProps {
  blueprint: {
    projectName?: string;
    frontendComponents?: string[];
    backendEndpoints?: string[];
    databaseModels?: string[];
  };
}

import '../../styles/components/AnimatedArchitectureFlow.css';

export const AnimatedArchitectureFlow: React.FC<AnimatedArchitectureFlowProps> = ({ blueprint }) => {
  const { frontendComponents = [], backendEndpoints = [], databaseModels = [], projectName = 'NovaProject' } = blueprint;
  
  const [activeNode, setActiveNode] = useState<{name: string, type: string} | null>(null);

  // We only render the chart if there is at least one node in any layer
  const totalNodes = frontendComponents.length + backendEndpoints.length + databaseModels.length;
  if (totalNodes === 0) return null;

  const layout = useMemo(() => {
    const width = 800; // SVG ViewBox width
    const height = Math.max(frontendComponents.length, backendEndpoints.length, databaseModels.length) * 100 + 100;
    
    const xPositions = {
      frontend: 150,
      backend: 400,
      database: 650
    };

    const getNodes = (items: string[], x: number, type: string) => {
      const spacing = height / (items.length + 1);
      return items.map((item, i) => ({
        id: `${type}-${i}`,
        label: item.length > 20 ? item.substring(0, 18) + '...' : item,
        fullLabel: item,
        x,
        y: spacing * (i + 1),
        type
      }));
    };

    const nodes = [
      ...getNodes(frontendComponents, xPositions.frontend, 'frontend'),
      ...getNodes(backendEndpoints, xPositions.backend, 'backend'),
      ...getNodes(databaseModels, xPositions.database, 'database')
    ];

    // Generate edges mapping Front -> Back and Back -> DB
    const edges: { x1: number; y1: number; x2: number; y2: number }[] = [];
    
    const frontNodes = nodes.filter(n => n.type === 'frontend');
    const backNodes = nodes.filter(n => n.type === 'backend');
    const dbNodes = nodes.filter(n => n.type === 'database');

    // Connect every frontend to every backend
    frontNodes.forEach(f => {
      backNodes.forEach(b => {
        edges.push({ x1: f.x + 60, y1: f.y, x2: b.x - 60, y2: b.y });
      });
    });

    // Connect every backend to every db
    backNodes.forEach(b => {
      dbNodes.forEach(d => {
        edges.push({ x1: b.x + 60, y1: b.y, x2: d.x - 60, y2: d.y });
      });
    });

    return { nodes, edges, width, height };
  }, [frontendComponents, backendEndpoints, databaseModels]);

  return (
    <div className="holo-panel aaf-container">
      <h3 className="aaf-title">
        🌌 Dynamic Architecture Flow
      </h3>
      <p className="aaf-subtitle">Click any node to generate its codebase</p>
      
      <div className="aaf-svg-container">
        <svg viewBox={`0 0 ${layout.width} ${layout.height}`} width="100%" height={Math.min(layout.height, 600)}>
          <defs>
            <linearGradient id="edgeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(0, 255, 170, 0.2)" />
              <stop offset="50%" stopColor="rgba(0, 255, 255, 0.8)" />
              <stop offset="100%" stopColor="rgba(0, 255, 170, 0.2)" />
            </linearGradient>
            
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Edges */}
          {layout.edges.map((edge, i) => (
            <g key={`edge-${i}`}>
              {/* Static faint line */}
              <line 
                x1={edge.x1} y1={edge.y1} 
                x2={edge.x2} y2={edge.y2} 
                stroke="rgba(255, 255, 255, 0.1)" 
                strokeWidth="2" 
              />
              {/* Animated pulsing dashed line representing data flow */}
              <line 
                x1={edge.x1} y1={edge.y1} 
                x2={edge.x2} y2={edge.y2} 
                stroke="url(#edgeGradient)" 
                strokeWidth="2" 
                strokeDasharray="10 15"
                className="flow-edge-animated"
              />
            </g>
          ))}

          {/* Nodes */}
          {layout.nodes.map(node => (
            <g key={node.id} transform={`translate(${node.x}, ${node.y})`} onClick={() => setActiveNode({ name: node.fullLabel, type: node.type })}>
              {/* Outer Glow Ring */}
              <rect 
                x="-60" y="-20" width="120" height="40" rx="8"
                fill="rgba(0, 0, 0, 0.6)"
                stroke={node.type === 'frontend' ? 'var(--nova-teal)' : node.type === 'backend' ? 'var(--nova-cyan)' : 'var(--nova-green)'}
                strokeWidth="1.5"
                filter="url(#glow)"
                className="flow-node-rect"
              />
              {/* Icon/Color Indicator */}
              <circle 
                cx="-45" cy="0" r="5" 
                fill={node.type === 'frontend' ? '#00ffa0' : node.type === 'backend' ? '#00ffff' : '#33ff33'} 
                className="flow-node-icon"
              />
              {/* Text Label */}
              <text 
                x="-30" y="4" 
                fill="#fff" 
                fontSize="11" 
                fontFamily="monospace"
                style={{ pointerEvents: 'none' }}
              >
                {node.label}
              </text>
              <title>{node.fullLabel}</title>
            </g>
          ))}
        </svg>
      </div>

      <CodeGeneratorModal 
        isOpen={!!activeNode} 
        onClose={() => setActiveNode(null)} 
        nodeName={activeNode?.name || ''} 
        nodeType={activeNode?.type || ''}
        projectName={projectName}
      />
    </div>
  );
};
