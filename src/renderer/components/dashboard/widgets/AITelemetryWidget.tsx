import React from 'react';
import { TelemetryData } from '../../../hooks/useTelemetry';

export const AITelemetryWidget: React.FC<{ data: TelemetryData['ai'] }> = ({ data }) => {
  const usagePercent = (data.contextUsage / data.contextMax) * 100;
  
  return (
    <div className="telemetry-widget">
      <div className="telemetry-header">
        <span className="telemetry-icon">🧠</span> AI NEURAL CORE
      </div>
      <div className="telemetry-row">
        <span className="telemetry-label">MODEL</span>
        <span className="telemetry-value cyan">{data.model}</span>
      </div>
      <div className="telemetry-row">
        <span className="telemetry-label">SPEED</span>
        <span className="telemetry-value">{data.tokensPerSecond} t/s</span>
      </div>
      <div className="telemetry-row">
        <span className="telemetry-label">TEMP</span>
        <span className="telemetry-value amber">{data.temperature}</span>
      </div>
      <div style={{ marginTop: '4px' }}>
        <div className="telemetry-row">
          <span className="telemetry-label">CTX MEMORY</span>
          <span className="telemetry-value" style={{ fontSize: '9px' }}>
            {data.contextUsage} / {data.contextMax}
          </span>
        </div>
        <div className="telemetry-progress-bg">
          <div className="telemetry-progress-fill" style={{ width: `${usagePercent}%` }} />
        </div>
      </div>
    </div>
  );
};
