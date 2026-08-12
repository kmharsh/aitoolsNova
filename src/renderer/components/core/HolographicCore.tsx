import React from 'react';
import { AssistantState } from '../../../shared/types';

interface CoreProps {
  state: AssistantState;
}

export const HolographicCore: React.FC<CoreProps> = ({ state }) => {
  // Map the strict TS state to the CSS animation class
  const animationClass = `state-${state.toLowerCase().replace(/_/g, '-')}`;

  return (
    <div className="holographic-core-container" style={{ position: 'relative', width: '250px', height: '250px' }}>
      <div 
        className={`holographic-core ${animationClass}`}
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          position: 'absolute',
          top: 0,
          left: 0,
          backgroundImage: 'url(/hologram.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          mixBlendMode: 'screen',
          filter: 'drop-shadow(0 0 15px var(--nova-cyan)) hue-rotate(10deg)',
          animationDuration: state === 'EXECUTING' || state === 'LISTENING' ? '1s' : '4s',
          animationIterationCount: 'infinite',
          animationDirection: state === 'IDLE' ? 'alternate' : 'normal',
          animationTimingFunction: state === 'THINKING' || state === 'PLANNING' ? 'linear' : 'ease-in-out'
        }}
      >
        {/* Holographic Scanlines overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))',
          backgroundSize: '100% 2px, 3px 100%',
          mixBlendMode: 'overlay',
          pointerEvents: 'none'
        }} />
      </div>
      
      <style>
        {`
          .state-idle { animation-name: state-idle; }
          .state-listening { animation-name: state-listening; }
          .state-thinking { animation-name: state-thinking; }
          .state-planning { animation-name: state-planning; }
          .state-executing { animation-name: state-executing; }
          .state-waiting-for-permission { animation-name: state-waiting; animation-direction: alternate; }
          .state-completed { animation-name: state-completed; animation-iteration-count: 1 !important; }
          .state-error { animation-name: state-error; }
        `}
      </style>
    </div>
  );
};
