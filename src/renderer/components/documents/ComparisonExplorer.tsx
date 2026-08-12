import React from 'react';
import { DocumentComparison } from '../../../../src/main/core/documents/ComparisonSchemaValidator';
import '../../styles/components/ComparisonExplorer.css';

export const DeltaOrb: React.FC<{ metric: string, oldVal: string, newVal: string, trend: string }> = ({ metric, oldVal, newVal, trend }) => {
  const trendClass = trend === 'INCREASE' ? 'increase' : trend === 'DECREASE' ? 'decrease' : '';
  
  return (
    <div className={`delta-orb ${trendClass}`}>
      <div style={{ fontSize: '10px', color: '#ccc', textTransform: 'uppercase', marginBottom: '4px' }}>{metric}</div>
      <div className="old-val">{oldVal}</div>
      <div className="new-val">{newVal}</div>
    </div>
  );
};

export const CSSHumanHologram: React.FC = () => {
  return (
    <div style={{ position: 'relative', width: '200px', height: '250px', margin: '0 auto' }}>
      {/* Abstract Glowing CSS Avatar */}
      <svg width="100%" height="100%" viewBox="0 0 200 250" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="holoGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(0,255,255,0.8)" />
            <stop offset="100%" stopColor="rgba(0,100,255,0.2)" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Head Silhouette */}
        <path 
          d="M 100 20 C 130 20 160 50 160 100 C 160 150 140 180 120 210 C 110 225 90 225 80 210 C 60 180 40 150 40 100 C 40 50 70 20 100 20 Z" 
          fill="none" 
          stroke="url(#holoGradient)" 
          strokeWidth="2" 
          filter="url(#glow)"
          strokeDasharray="4 4"
        />
        
        {/* Wireframe Eyes */}
        <circle cx="75" cy="90" r="6" fill="rgba(0,255,255,0.9)" filter="url(#glow)">
          <animate attributeName="opacity" values="0.4;1;0.4" dur="2s" repeatCount="indefinite"/>
        </circle>
        <circle cx="125" cy="90" r="6" fill="rgba(0,255,255,0.9)" filter="url(#glow)">
          <animate attributeName="opacity" values="0.4;1;0.4" dur="2s" repeatCount="indefinite"/>
        </circle>
        
        {/* Artificial Brain/Nodes */}
        <circle cx="100" cy="50" r="2" fill="#fff" />
        <line x1="100" y1="50" x2="75" y2="70" stroke="rgba(0,255,255,0.5)" strokeWidth="1" />
        <line x1="100" y1="50" x2="125" y2="70" stroke="rgba(0,255,255,0.5)" strokeWidth="1" />
        <line x1="75" y1="110" x2="100" y2="130" stroke="rgba(0,255,255,0.5)" strokeWidth="1" />
        <line x1="125" y1="110" x2="100" y2="130" stroke="rgba(0,255,255,0.5)" strokeWidth="1" />
        
        {/* Speaking Mouth Animation (Dynamic Audio Wave) */}
        <rect x="85" y="150" width="4" height="2" fill="rgba(0,255,255,0.8)" filter="url(#glow)">
          <animate attributeName="height" values="2;10;2" dur="0.4s" repeatCount="indefinite"/>
          <animate attributeName="y" values="150;146;150" dur="0.4s" repeatCount="indefinite"/>
        </rect>
        <rect x="95" y="150" width="4" height="2" fill="rgba(0,255,255,0.8)" filter="url(#glow)">
          <animate attributeName="height" values="2;16;2" dur="0.5s" repeatCount="indefinite"/>
          <animate attributeName="y" values="150;142;150" dur="0.5s" repeatCount="indefinite"/>
        </rect>
        <rect x="105" y="150" width="4" height="2" fill="rgba(0,255,255,0.8)" filter="url(#glow)">
          <animate attributeName="height" values="2;12;2" dur="0.3s" repeatCount="indefinite"/>
          <animate attributeName="y" values="150;144;150" dur="0.3s" repeatCount="indefinite"/>
        </rect>
        
        {/* Scanning horizontal line */}
        <line x1="30" y1="20" x2="170" y2="20" stroke="rgba(0,255,255,0.6)" strokeWidth="2" filter="url(#glow)">
          <animate attributeName="y1" values="20; 230; 20" dur="4s" repeatCount="indefinite"/>
          <animate attributeName="y2" values="20; 230; 20" dur="4s" repeatCount="indefinite"/>
        </line>
      </svg>
    </div>
  );
};

export const ComparisonExplorer: React.FC<{ comparison: DocumentComparison | null }> = ({ comparison }) => {
  if (!comparison) return null;

  return (
    <div className="document-explorer ce-container">
      <div className="ce-header">
        <div className="ce-brand">
          NOVA // DOCUMENT COMPARISON ENGINE
        </div>
        <div className="ce-score">
          Similarity Score: {comparison.similarityScore}%
        </div>
      </div>

      <div className="ce-layout">
        
        {/* Left Side: Avatar */}
        <div style={{ flex: '0 0 250px', textAlign: 'center' }}>
          <CSSHumanHologram />
          <div style={{ marginTop: '10px', fontSize: '12px', color: 'var(--nova-cyan)', letterSpacing: '1px' }}>
            [ AI ANALYSIS ACTIVE ]
          </div>
        </div>
        
        {/* Right Side: Data Panels */}
        <div style={{ flex: 1 }}>
          <div className="holo-panel" style={{ marginBottom: '20px' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#fff' }}>Delta Summary</h3>
            <p style={{ color: '#ccc', lineHeight: '1.6' }}>{comparison.summaryOfDifferences}</p>
          </div>

          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '20px' }}>
            {comparison.metricChanges?.map((m, i) => (
              <DeltaOrb key={i} metric={m.metricName} oldVal={m.oldValue} newVal={m.newValue} trend={m.trend} />
            ))}
          </div>

          {/* New Match / Unmatch Section */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div className="holo-panel" style={{ borderLeft: '4px solid #00ffaa' }}>
              <h3 style={{ color: '#00ffaa', marginTop: 0 }}>✅ Matching Data</h3>
              <ul style={{ color: '#ddd', paddingLeft: '20px', margin: 0, fontSize: '14px', lineHeight: '1.6' }}>
                {(comparison as any).matchedPoints?.length > 0 
                  ? (comparison as any).matchedPoints.map((pt: string, i: number) => <li key={i}>{pt}</li>)
                  : <li>No identical data points found.</li>}
              </ul>
            </div>
            
            <div className="holo-panel" style={{ borderLeft: '4px solid #ffaa00' }}>
              <h3 style={{ color: '#ffaa00', marginTop: 0 }}>❌ Conflicting Data</h3>
              <ul style={{ color: '#ddd', paddingLeft: '20px', margin: 0, fontSize: '14px', lineHeight: '1.6' }}>
                {(comparison as any).unmatchedPoints?.length > 0 
                  ? (comparison as any).unmatchedPoints.map((pt: string, i: number) => <li key={i}>{pt}</li>)
                  : <li>No conflicting data points found.</li>}
              </ul>
            </div>
          </div>

          {/* Legacy Risks Section */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {comparison.newRisks && comparison.newRisks.length > 0 && (
              <div className="holo-panel" style={{ borderLeft: '4px solid #ff3333' }}>
                <h3 style={{ color: '#ff3333', marginTop: 0 }}>⚠️ New Risks</h3>
                <ul style={{ color: '#ddd', paddingLeft: '20px', margin: 0, fontSize: '14px', lineHeight: '1.6' }}>
                  {comparison.newRisks.map((risk, i) => <li key={i}>{risk}</li>)}
                </ul>
              </div>
            )}
            
            {comparison.resolvedRisks && comparison.resolvedRisks.length > 0 && (
              <div className="holo-panel" style={{ borderLeft: '4px solid #32ff64' }}>
                <h3 style={{ color: '#32ff64', marginTop: 0 }}>🛡️ Resolved Risks</h3>
                <ul style={{ color: '#ddd', paddingLeft: '20px', margin: 0, fontSize: '14px', lineHeight: '1.6' }}>
                  {comparison.resolvedRisks.map((risk, i) => <li key={i}>{risk}</li>)}
                </ul>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
