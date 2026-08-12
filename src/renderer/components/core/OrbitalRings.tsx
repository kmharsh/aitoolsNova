import React from 'react';

interface RingsProps {
  active: boolean;
}

export const OrbitalRings: React.FC<RingsProps> = ({ active }) => {
  if (!active) return null;

  return (
    <div style={{ position: 'absolute', width: '400px', height: '400px', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', pointerEvents: 'none' }}>
      {[1, 2, 3].map((ring) => (
        <div
          key={ring}
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            border: `2px solid rgba(0, 240, 255, ${0.1 * ring})`,
            borderRadius: '50%',
            animation: 'orbit-spin 8s linear infinite',
            animationDelay: `${ring * -2}s`,
            boxShadow: '0 0 15px rgba(0,240,255,0.2) inset'
          }}
        />
      ))}
    </div>
  );
};
