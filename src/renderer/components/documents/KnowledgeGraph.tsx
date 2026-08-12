import { memo } from 'react';
import '../../styles/components/KnowledgeGraph.css';

interface KnowledgeGraphProps {
  entities?: string[];
  relationships?: string[]; // Kept for future use
}

export const KnowledgeGraph = memo(({ entities = [] }: KnowledgeGraphProps) => {
  if (entities.length === 0) return null;

  // Simple circular layout algorithm
  const radius = 120;
  const centerX = 200;
  const centerY = 200;
  
  const nodes = entities.slice(0, 8).map((entity, i, arr) => {
    const angle = (i / arr.length) * 2 * Math.PI;
    return {
      id: entity,
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle)
    };
  });

  return (
    <div className="kg-container">
      <svg className="kg-svg">
        <defs>
          <radialGradient id="glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(0,255,255,0.5)" />
            <stop offset="100%" stopColor="rgba(0,255,255,0)" />
          </radialGradient>
        </defs>
        
        {/* Draw relationships as lines */}
        {nodes.map((node, i) => {
          // Connect every node to the next one, and randomly to others for a "network" feel
          const target = nodes[(i + 1) % nodes.length];
          const crossTarget = nodes[(i + 3) % nodes.length];
          return (
            <g key={`lines-${i}`}>
              <line x1={node.x} y1={node.y} x2={target.x} y2={target.y} stroke="rgba(0, 255, 255, 0.3)" strokeWidth="1" />
              {crossTarget && (
                <line x1={node.x} y1={node.y} x2={crossTarget.x} y2={crossTarget.y} stroke="rgba(0, 255, 255, 0.1)" strokeWidth="1" strokeDasharray="5,5" />
              )}
            </g>
          );
        })}
        
        {/* Draw nodes */}
        {nodes.map((node, i) => (
          <g key={i} className="kg-node-group" style={{ transformOrigin: `${node.x}px ${node.y}px` }}>
            <circle cx={node.x} cy={node.y} r="25" fill="url(#glow)" />
            <circle cx={node.x} cy={node.y} r="6" fill="#00ffff" />
            <text 
              x={node.x} 
              y={node.y + 20} 
              fill="#fff" 
              fontSize="10" 
              textAnchor="middle"
              className="kg-node-text"
            >
              {node.id.length > 15 ? node.id.substring(0, 15) + '...' : node.id}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
});
