import React from 'react';
import '../../styles/components/SettingsPanel.css';

interface SettingsProps {
  show: boolean;
}

export const SettingsPanel: React.FC<SettingsProps> = ({ show }) => {
  if (!show) return null;

  return (
    <div className="glass-panel settings-panel">
      <h3 className="settings-title">System Configuration</h3>
      
      <div className="settings-field">
        <label className="settings-label">AI Provider</label>
        <select className="settings-select">
          <option>Ollama (Local)</option>
          <option>Cloud LLM</option>
        </select>
      </div>

      <div className="settings-field">
        <label className="settings-label">Voice Model</label>
        <select className="settings-select">
          <option>Nova (High Quality)</option>
          <option>System Default</option>
        </select>
      </div>
    </div>
  );
};
