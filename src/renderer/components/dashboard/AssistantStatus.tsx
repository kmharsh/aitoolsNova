import React from 'react';
import { AssistantState } from '../../../shared/types';
import '../../styles/components/AssistantStatus.css';

interface StatusProps {
  state: AssistantState;
}

export const AssistantStatus: React.FC<StatusProps> = ({ state }) => {
  return (
    <div className="assistant-status-container">
      <h2 className="glow-text assistant-status-title">
        {state.replace(/_/g, ' ')}
      </h2>
      <p className="assistant-status-subtitle">
        {state === 'IDLE' ? 'Awaiting Voice Command' : 'Processing Core Intent'}
      </p>
    </div>
  );
};
