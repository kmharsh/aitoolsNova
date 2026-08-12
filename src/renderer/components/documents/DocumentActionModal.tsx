import { memo } from 'react';

interface DocumentActionModalProps {
  file: File;
  onClose: () => void;
  onActionSelect: (action: 'analyze' | 'build_fsd' | 'compare') => void;
}

export const DocumentActionModal = memo(({ file, onClose, onActionSelect }: DocumentActionModalProps) => {
  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0, 10, 15, 0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999
    }}>
      <div style={{
        background: 'rgba(10, 15, 25, 0.95)',
        border: '1px solid var(--nova-teal)',
        padding: '30px',
        borderRadius: '12px',
        width: '400px',
        textAlign: 'center',
        boxShadow: '0 0 30px rgba(0, 255, 255, 0.2)'
      }}>
        <h2 style={{ color: 'var(--nova-cyan)', marginTop: 0 }}>Document Detected</h2>
        <p style={{ color: '#ccc', marginBottom: '30px' }}>
          File: <strong>{file.name}</strong><br/>
          What would you like Nova to do with this document?
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <button 
            className="interactive-btn"
            onClick={() => onActionSelect('analyze')}
            style={{ padding: '12px', background: 'rgba(0, 255, 255, 0.1)', border: '1px solid var(--nova-cyan)', color: '#fff', borderRadius: '8px', cursor: 'pointer' }}
          >
            📊 General Analysis & Summary
          </button>
          
          <button 
            className="interactive-btn"
            onClick={() => onActionSelect('build_fsd')}
            style={{ padding: '12px', background: 'rgba(0, 255, 170, 0.1)', border: '1px solid var(--nova-green)', color: '#fff', borderRadius: '8px', cursor: 'pointer' }}
          >
            🏗️ Build Project Structure (FSD)
          </button>

          <button 
            className="interactive-btn"
            onClick={() => onActionSelect('compare')}
            style={{ padding: '12px', background: 'rgba(255, 100, 100, 0.1)', border: '1px solid #ff6464', color: '#fff', borderRadius: '8px', cursor: 'pointer' }}
          >
            ⚖️ Compare with another file
          </button>
        </div>

        <button 
          onClick={onClose}
          style={{ marginTop: '20px', background: 'none', border: 'none', color: '#888', cursor: 'pointer', textDecoration: 'underline' }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
});
