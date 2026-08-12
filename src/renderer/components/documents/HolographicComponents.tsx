import React from 'react';
import '../../styles/components/HolographicComponents.css';

export const MetricOrb: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="metric-orb">
    <div className="value">{value}</div>
    <div className="label">{label}</div>
  </div>
);

export const HolographicSummary: React.FC<{ title: string; summary: string }> = ({ title, summary }) => (
  <div className="holo-panel holo-summary">
    <h2 className="holo-summary-title">{title}</h2>
    <p className="holo-summary-text">{summary}</p>
  </div>
);

export const RiskIndicator: React.FC<{ risks: string[] }> = ({ risks }) => {
  if (!risks || risks.length === 0) return null;
  return (
    <div className="risk-container">
      {risks.map((risk, i) => (
        <div key={i} className="risk-indicator">
          <strong className="risk-label">⚠ RISK DETECTED</strong>
          <p className="risk-text">{risk}</p>
        </div>
      ))}
    </div>
  );
};

export const EntityNode: React.FC<{ label: string }> = ({ label }) => (
  <div className="entity-node">{label}</div>
);

export const Timeline: React.FC<{ dates: string[] }> = ({ dates }) => (
  <div className="timeline-container">
    {dates.map((date, i) => (
      <div key={i} className="timeline-item">
        <div className="timeline-date-label">EXTRACTED DATE</div>
        <div className="timeline-date-value">{date}</div>
      </div>
    ))}
  </div>
);
