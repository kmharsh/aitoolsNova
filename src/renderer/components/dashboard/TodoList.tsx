import React, { useState } from 'react';
import { playSFX } from '../../utils/audioSFX';

export interface TodoTask {
  id: string;
  text: string;
}

interface Props {
  tasks: TodoTask[];
  onAddTask: (text: string) => void;
  onDeleteTask: (id: string) => void;
  onClose: () => void;
}

export const TodoList: React.FC<Props> = ({ tasks, onAddTask, onDeleteTask, onClose }) => {
  const [newTaskText, setNewTaskText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    playSFX('click');
    onAddTask(newTaskText.trim());
    setNewTaskText('');
  };

  return (
    <div className="glass-panel" style={{
      position: 'absolute',
      left: '40px',
      top: '100px',
      width: '320px',
      maxHeight: '400px',
      display: 'flex',
      flexDirection: 'column',
      padding: '20px',
      background: 'rgba(20, 25, 30, 0.85)',
      borderRadius: '16px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)',
      boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
      zIndex: 900
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '10px', marginBottom: '15px' }}>
        <h3 style={{ margin: 0, color: 'var(--nova-teal)', fontSize: '16px' }}>📝 Reminders</h3>
        <button 
          onClick={() => { playSFX('click'); onClose(); }}
          style={{ background: 'transparent', border: 'none', color: '#ff3333', cursor: 'pointer', fontSize: '16px' }}
        >×</button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', marginBottom: '15px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {tasks.length === 0 ? (
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', textAlign: 'center', marginTop: '20px' }}>
            No pending tasks.
          </div>
        ) : (
          tasks.map(task => (
            <div key={task.id} style={{
              display: 'flex',
              alignItems: 'flex-start',
              background: 'rgba(0, 0, 0, 0.4)',
              padding: '10px',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              gap: '10px',
              transition: 'all 0.2s ease'
            }}>
              <input 
                type="checkbox" 
                onChange={() => {
                  playSFX('hover');
                  // Add a small delay for animation before deleting
                  setTimeout(() => onDeleteTask(task.id), 300);
                }}
                style={{ marginTop: '4px', cursor: 'pointer', accentColor: 'var(--nova-teal)' }}
              />
              <span style={{ fontSize: '14px', color: '#f0f0f0', flex: 1, lineHeight: '1.4' }}>
                {task.text}
              </span>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px' }}>
        <input 
          type="text"
          value={newTaskText}
          onChange={(e) => setNewTaskText(e.target.value)}
          placeholder="Add a new task..."
          style={{
            flex: 1,
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '6px',
            color: 'white',
            padding: '8px 12px',
            fontSize: '14px',
            outline: 'none'
          }}
        />
        <button 
          type="submit"
          className="interactive-btn"
          style={{
            background: 'var(--nova-teal)',
            border: 'none',
            borderRadius: '6px',
            color: 'black',
            fontWeight: 'bold',
            padding: '0 12px',
            cursor: 'pointer'
          }}
        >
          +
        </button>
      </form>
    </div>
  );
};
