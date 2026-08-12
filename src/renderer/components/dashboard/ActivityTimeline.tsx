import React from 'react';
import '../../styles/components/ActivityTimeline.css';

interface TimelineProps {
  logs: string[];
}

export const ActivityTimeline: React.FC<TimelineProps> = ({ logs }) => {
  return (
    <div className="glass-panel activity-timeline">
      <h4 className="activity-timeline-title">System Logs</h4>
      <div className="activity-timeline-logs">
        {logs.map((log, i) => (
          <div key={i}>{log}</div>
        ))}
      </div>
    </div>
  );
};
