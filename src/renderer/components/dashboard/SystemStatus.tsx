import React from 'react';

export const SystemStatus: React.FC = () => {
  return (
    <div className="glass-panel" style={{ position: 'absolute', bottom: '40px', left: '40px', padding: '16px', display: 'flex', gap: '20px' }}>
      <div>
        <div style={{ fontSize: '0.7rem', color: 'var(--nova-cyan)' }}>CPU</div>
        <div style={{ fontWeight: 'bold' }}>14%</div>
      </div>
      <div>
        <div style={{ fontSize: '0.7rem', color: 'var(--nova-teal)' }}>MEM</div>
        <div style={{ fontWeight: 'bold' }}>212 MB</div>
      </div>
      <div>
        <div style={{ fontSize: '0.7rem', color: 'var(--nova-amber)' }}>DB</div>
        <div style={{ fontWeight: 'bold' }}>OK</div>
      </div>
    </div>
  );
};
