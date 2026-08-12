import React from 'react';
import { Task } from '../../../shared/schemas';

interface Props {
  task: Task | null;
}

export const TaskProgress: React.FC<Props> = ({ task }) => {
  if (!task) return null;

  return (
    <div className="glass-panel" style={{ position: 'absolute', left: '40px', top: '50%', transform: 'translateY(-50%)', padding: '20px', width: '250px' }}>
      <h4 style={{ color: 'var(--nova-cyan)', marginBottom: '16px' }}>Execution Graph</h4>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {task.steps.map((step, i) => (
          <li key={i} style={{ display: 'flex', alignItems: 'center', marginBottom: '12px', opacity: step.status === 'COMPLETED' ? 0.6 : 1 }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: step.status === 'COMPLETED' ? 'var(--nova-teal)' : (step.status === 'RUNNING' ? 'var(--nova-amber)' : 'transparent'), border: `1px solid var(--nova-cyan)`, marginRight: '12px' }} />
            <span style={{ fontSize: '0.9rem' }}>{step.description}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
