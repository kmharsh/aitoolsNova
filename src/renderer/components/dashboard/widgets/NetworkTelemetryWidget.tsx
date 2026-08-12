import React from 'react';
import { TelemetryData } from '../../../hooks/useTelemetry';

export const NetworkTelemetryWidget: React.FC<{ data: TelemetryData['network'] }> = ({ data }) => {
  return (
    <div className="telemetry-widget">
      <div className="telemetry-header">
        <span className="telemetry-icon">🌐</span> NETWORK RELAY
      </div>
      <div className="telemetry-row">
        <span className="telemetry-label">API LATENCY</span>
        <span className={`telemetry-value ${data.latency > 100 ? 'amber' : 'cyan'}`}>
          {data.latency} ms
        </span>
      </div>
      <div className="telemetry-row">
        <span className="telemetry-label">DATA PROC</span>
        <span className="telemetry-value">{data.throughputMb} MB</span>
      </div>
    </div>
  );
};
