import React from 'react';

interface VisualizerProps {
  isListening: boolean;
}

export const VoiceVisualizer: React.FC<VisualizerProps> = ({ isListening }) => {
  if (!isListening) return null;

  return (
    <div style={{ 
      position: 'absolute', 
      bottom: '-80px', 
      left: '50%', 
      transform: 'translateX(-50%)', 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center',
      gap: '15px',
      zIndex: 100
    }}>
      {/* Audio Bars */}
      <div style={{ display: 'flex', gap: '6px', alignItems: 'center', height: '60px' }}>
        {[1, 2, 3, 5, 8, 5, 3, 2, 1].map((bar, i) => (
          <div
            key={i}
            style={{
              width: '6px',
              height: `${bar * 6}px`,
              background: 'var(--nova-teal)',
              borderRadius: '3px',
              animation: `pulse-bar 0.4s ease-in-out infinite alternate`,
              animationDelay: `${i * 0.08}s`
            }}
          />
        ))}
      </div>
      
      {/* "Listening..." Text Indicator */}
      <div style={{
        color: 'var(--nova-teal)',
        fontSize: '18px',
        fontWeight: 'bold',
        letterSpacing: '4px',
        textTransform: 'uppercase',
        animation: 'pulse-text 1s infinite alternate',
        textShadow: '0 0 10px var(--nova-teal)'
      }}>
        Listening...
      </div>

      <style>
        {`
          @keyframes pulse-bar {
            0% { transform: scaleY(0.3); opacity: 0.6; box-shadow: 0 0 5px var(--nova-teal); }
            100% { transform: scaleY(1.5); opacity: 1; box-shadow: 0 0 20px var(--nova-teal), 0 0 40px var(--nova-teal); }
          }
          @keyframes pulse-text {
            0% { opacity: 0.5; }
            100% { opacity: 1; text-shadow: 0 0 20px var(--nova-teal); }
          }
        `}
      </style>
    </div>
  );
};

