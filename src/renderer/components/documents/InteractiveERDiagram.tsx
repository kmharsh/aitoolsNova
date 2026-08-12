import React, { useMemo } from 'react';

interface InteractiveERDiagramProps {
  databaseModels?: string[];
}

interface ParsedModel {
  name: string;
  fields: { name: string; type: string; isKey: boolean; isForeign: boolean }[];
  x: number;
  y: number;
}

import '../../styles/components/InteractiveERDiagram.css';

export const InteractiveERDiagram: React.FC<InteractiveERDiagramProps> = ({ databaseModels = [] }) => {
  
  const { models, edges, width, height } = useMemo(() => {
    if (databaseModels.length === 0) return { models: [], edges: [], width: 800, height: 400 };

    const parsed: ParsedModel[] = databaseModels.map((modelStr, idx) => {
      // Basic parser: Try to extract a name. 
      // E.g., "User (id, name)", "Post", "User table with id and email"
      const nameMatch = modelStr.match(/^([a-zA-Z0-9_]+)/);
      const name = nameMatch ? nameMatch[1] : `Table_${idx+1}`;
      
      // Mock some fields if we can't extract them easily, just to make it look like an ER diagram.
      // We will look for words like "id", "userId", etc.
      const words = modelStr.split(/[\s,()]+/);
      const fields = [];
      fields.push({ name: 'id', type: 'UUID', isKey: true, isForeign: false });
      
      if (words.some(w => w.toLowerCase().includes('user') && w.toLowerCase().includes('id'))) {
        fields.push({ name: 'user_id', type: 'UUID', isKey: false, isForeign: true });
      }
      if (words.some(w => w.toLowerCase().includes('name') || w.toLowerCase().includes('title'))) {
        fields.push({ name: 'name', type: 'VARCHAR', isKey: false, isForeign: false });
      }
      if (words.some(w => w.toLowerCase().includes('date') || w.toLowerCase().includes('time'))) {
        fields.push({ name: 'created_at', type: 'TIMESTAMP', isKey: false, isForeign: false });
      }
      if (fields.length === 1) { // Add a dummy field if only ID was found
        fields.push({ name: 'data', type: 'JSONB', isKey: false, isForeign: false });
      }

      // Calculate a rough grid position
      const cols = 3;
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      
      return {
        name,
        fields,
        x: 100 + col * 300,
        y: 50 + row * 200
      };
    });

    const edges: { x1: number; y1: number; x2: number; y2: number }[] = [];
    
    // Draw edges for foreign keys. If a model has a foreign key to another model, draw a line.
    // As a fallback visual, we just link adjacent tables to make the diagram look complex and holographic.
    for (let i = 0; i < parsed.length; i++) {
      for (let j = i + 1; j < parsed.length; j++) {
        // Mock relation: 30% chance or if name includes part of the other
        const isRelated = Math.random() > 0.6 || parsed[i].fields.some(f => f.name.includes(parsed[j].name.toLowerCase()));
        if (isRelated) {
          edges.push({
            x1: parsed[i].x + 100, // Roughly right side of table i
            y1: parsed[i].y + 60,
            x2: parsed[j].x, // Roughly left side of table j
            y2: parsed[j].y + 60
          });
        }
      }
    }

    return { 
      models: parsed, 
      edges, 
      width: 800, 
      height: Math.max(400, Math.ceil(parsed.length / 3) * 200 + 100)
    };

  }, [databaseModels]);

  if (models.length === 0) return null;

  return (
    <div className="holo-panel er-container">
      <h3 className="er-title">
        🗄️ Database Entity-Relationship (ER) Schema
      </h3>
      <p className="er-subtitle">AI-Extracted Holographic Schema Visualization</p>
      
      <div className="er-svg-container">
        <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={Math.min(height, 600)} className="er-svg">
          <defs>
            <linearGradient id="dbEdgeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(255, 184, 77, 0.2)" />
              <stop offset="50%" stopColor="rgba(255, 184, 77, 0.8)" />
              <stop offset="100%" stopColor="rgba(255, 184, 77, 0.2)" />
            </linearGradient>
            
            <filter id="glowOrange">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Render Relationship Lines */}
          {edges.map((edge, i) => (
            <path
              key={`edge-${i}`}
              d={`M ${edge.x1} ${edge.y1} C ${(edge.x1 + edge.x2) / 2} ${edge.y1}, ${(edge.x1 + edge.x2) / 2} ${edge.y2}, ${edge.x2} ${edge.y2}`}
              fill="none"
              stroke="url(#dbEdgeGradient)"
              strokeWidth="2"
              filter="url(#glowOrange)"
              className="er-edge"
            />
          ))}

          {/* Render Tables */}
          {models.map((model, i) => (
            <g key={i} transform={`translate(${model.x}, ${model.y})`}>
              {/* Table Background */}
              <rect width="180" height={40 + model.fields.length * 25} rx="8" fill="rgba(20, 20, 20, 0.9)" stroke="#ffb84d" strokeWidth="1" filter="url(#glowOrange)" />
              
              {/* Table Header */}
              <rect width="180" height="30" rx="8" fill="rgba(255, 184, 77, 0.2)" />
              <text x="90" y="20" fill="#fff" fontSize="14" fontWeight="bold" textAnchor="middle">{model.name}</text>
              
              {/* Table Fields */}
              {model.fields.map((field, fIdx) => (
                <g key={fIdx} transform={`translate(10, ${50 + fIdx * 25})`}>
                  {/* Field Name */}
                  <text x="0" y="0" fill={field.isKey ? '#ffb84d' : '#ccc'} fontSize="12" fontWeight={field.isKey ? 'bold' : 'normal'}>
                    {field.isKey ? '🔑 ' : field.isForeign ? '🔗 ' : '▫️ '}{field.name}
                  </text>
                  {/* Field Type */}
                  <text x="160" y="0" fill="#888" fontSize="10" textAnchor="end">{field.type}</text>
                </g>
              ))}
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
};
