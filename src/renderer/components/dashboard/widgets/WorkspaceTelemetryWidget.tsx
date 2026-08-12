import React from 'react';
import { TelemetryData } from '../../../hooks/useTelemetry';

export const WorkspaceTelemetryWidget: React.FC<{ data: TelemetryData['workspace'] }> = ({ data }) => {
  return (
    <div className="telemetry-widget">
      <div className="telemetry-header">
        <span className="telemetry-icon">📂</span> WORKSPACE NODE
      </div>
      <div className="telemetry-row">
        <span className="telemetry-label">ACTIVE DIR</span>
        <span className="telemetry-value cyan" style={{ textTransform: 'lowercase' }}>
          /{data.activeDir}
        </span>
      </div>
      <div className="telemetry-row">
        <span className="telemetry-label">BRAIN SIZE</span>
        <span className="telemetry-value">{data.dbSizeMb} MB</span>
      </div>
      <div className="telemetry-row">
        <span className="telemetry-label">FILES IDXD</span>
        <span className="telemetry-value">{data.filesIndexed}</span>
      </div>
    </div>
  );
};
