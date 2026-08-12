import React from 'react';
import { TelemetryData } from '../../../hooks/useTelemetry';

export const SecurityGuardWidget: React.FC<{ data: TelemetryData['security'] }> = ({ data }) => {
  return (
    <div className="telemetry-widget">
      <div className="telemetry-header">
        <span className="telemetry-icon">🛡️</span> SYSTEM SECURITY
      </div>
      <div className="telemetry-row" style={{ marginBottom: '8px' }}>
        <span className="telemetry-label">GRANTED PERMISSIONS</span>
      </div>
      <div className="security-tags">
        {data.permissions.map(perm => (
          <span key={perm} className="security-tag">{perm}</span>
        ))}
      </div>
    </div>
  );
};
