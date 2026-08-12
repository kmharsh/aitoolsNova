import React, { useState } from 'react';
import { DocumentAnalysis } from '../../../main/core/documents/DocumentSchemaValidator';

interface HistorySidebarProps {
  history: { name: string; date: string; data: DocumentAnalysis }[];
  onSelect: (doc: DocumentAnalysis) => void;
  onDelete?: (name: string) => void;
}

export const HistorySidebar: React.FC<HistorySidebarProps> = ({ history, onSelect, onDelete }) => {
  const [isOpen, setIsOpen] = useState(true);

  // Group history by category (documentType)
  const groupedHistory = history.reduce((acc, item) => {
    const category = item.data.documentType || 'Other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {} as Record<string, typeof history>);

  return (
    <>
      <div style={{
        position: 'absolute',
        left: isOpen ? 0 : '-280px',
        top: 0,
        bottom: 0,
        width: '280px',
        background: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(10px)',
        borderRight: '1px solid var(--nova-glass-border)',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 500,
        overflowY: 'auto',
        transition: 'left 0.3s ease-in-out'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid rgba(0, 255, 170, 0.3)', paddingBottom: '10px' }}>
          <h3 style={{ color: 'var(--nova-teal)', margin: 0 }}>Project History</h3>
          <button 
            onClick={() => setIsOpen(false)} 
            style={{ background: 'none', border: 'none', color: 'var(--nova-cyan)', cursor: 'pointer', fontSize: '18px' }}
          >
            ✕
          </button>
        </div>
        
        {history.length === 0 ? (
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', textAlign: 'center', marginTop: '20px' }}>
            No projects uploaded yet.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {Object.entries(groupedHistory).map(([category, items]) => (
              <div key={category}>
                <h4 style={{ color: 'var(--nova-cyan)', margin: '0 0 10px 0', fontSize: '13px', textTransform: 'uppercase', opacity: 0.8 }}>
                  📂 {category}
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {items.map((item, index) => (
                    <div 
                      key={index}
                      className="glass-panel"
                      style={{
                        padding: '12px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        borderRadius: '8px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div style={{ flex: 1, overflow: 'hidden' }}>
                        <div style={{ color: 'white', fontWeight: 'bold', fontSize: '14px', marginBottom: '4px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                          {item.name}
                        </div>
                        <div style={{ color: 'var(--nova-teal)', fontSize: '11px' }}>
                          {item.date}
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', gap: '8px', marginLeft: '10px' }}>
                        <button
                          className="interactive-btn"
                          onClick={() => onSelect(item.data)}
                          style={{
                            background: 'rgba(0, 255, 170, 0.1)',
                            border: '1px solid var(--nova-teal)',
                            color: 'var(--nova-teal)',
                            cursor: 'pointer',
                            fontSize: '12px',
                            padding: '4px 8px',
                            borderRadius: '4px'
                          }}
                          title="Open Document"
                        >
                          👁️ Open
                        </button>

                        {onDelete && (
                          <button
                            className="interactive-btn"
                            onClick={() => onDelete(item.name)}
                            style={{
                              background: 'rgba(255, 100, 100, 0.1)',
                              border: '1px solid rgba(255, 100, 100, 0.5)',
                              color: 'rgba(255, 100, 100, 0.9)',
                              cursor: 'pointer',
                              fontSize: '12px',
                              padding: '4px 8px',
                              borderRadius: '4px'
                            }}
                            title="Delete History"
                          >
                            🗑️ Delete
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Button to open sidebar if closed */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            position: 'absolute',
            left: '20px',
            top: '20px',
            zIndex: 499,
            background: 'rgba(0, 255, 170, 0.1)',
            border: '1px solid var(--nova-green)',
            color: 'var(--nova-green)',
            padding: '10px 15px',
            borderRadius: '8px',
            cursor: 'pointer',
            boxShadow: '0 0 10px rgba(0, 255, 170, 0.2)'
          }}
          className="interactive-btn"
        >
          ☰ History
        </button>
      )}
    </>
  );
};
