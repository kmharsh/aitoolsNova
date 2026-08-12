import React from 'react';
import { TelemetryData } from '../../../hooks/useTelemetry';

export const AgentSwarmWidget: React.FC<{ data: TelemetryData['swarm'] }> = ({ data }) => {
  // We'll show a maximum of 4 dots
  const maxDots = 4;
  
  return (
    <div className="telemetry-widget">
      <div className="telemetry-header">
        <span className="telemetry-icon">🤖</span> AGENT SWARM
      </div>
      <div className="telemetry-row" style={{ marginBottom: '6px' }}>
        <span className="telemetry-label">WORKERS</span>
        <div className="swarm-dots">
          {Array.from({ length: maxDots }).map((_, i) => (
            <div key={i} className={`swarm-dot ${i < data.activeWorkers ? 'active' : ''}`} />
          ))}
        </div>
      </div>
      <div className="telemetry-row">
        <span className="telemetry-label">TASK QUEUE</span>
        <span className="telemetry-value">{data.taskQueue}</span>
      </div>
    </div>
  );
};
