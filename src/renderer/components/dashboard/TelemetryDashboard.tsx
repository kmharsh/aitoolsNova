import React from 'react';
import { useTelemetry } from '../../hooks/useTelemetry';
import { AITelemetryWidget } from './widgets/AITelemetryWidget';
import { NetworkTelemetryWidget } from './widgets/NetworkTelemetryWidget';
import { WorkspaceTelemetryWidget } from './widgets/WorkspaceTelemetryWidget';
import { AgentSwarmWidget } from './widgets/AgentSwarmWidget';
import { SecurityGuardWidget } from './widgets/SecurityGuardWidget';
import '../../styles/components/TelemetryDashboard.css';

export const TelemetryDashboard: React.FC = () => {
  const telemetry = useTelemetry();

  return (
    <div className="telemetry-dashboard">
      <AITelemetryWidget data={telemetry.ai} />
      <NetworkTelemetryWidget data={telemetry.network} />
      <WorkspaceTelemetryWidget data={telemetry.workspace} />
      <AgentSwarmWidget data={telemetry.swarm} />
      <SecurityGuardWidget data={telemetry.security} />
    </div>
  );
};
