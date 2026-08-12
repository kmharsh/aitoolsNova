import React, { useState, useEffect } from 'react';
import '../../styles/components/CodeGeneratorModal.css';

interface CodeGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  nodeName: string;
  nodeType: string;
  projectName: string;
}

export const CodeGeneratorModal: React.FC<CodeGeneratorModalProps> = ({ isOpen, onClose, nodeName, nodeType, projectName }) => {
  const [code, setCode] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [techStack, setTechStack] = useState<string>('');

  const frontendOptions = ['React', 'Vue 3', 'Angular', 'Svelte', 'Vanilla JS/CSS'];
  const backendOptions = ['Node.js (Express)', 'Python (Django)', 'Python (Flask)', 'Java (Spring Boot)', 'Go (Fiber)'];
  const dbOptions = ['MongoDB (Mongoose)', 'PostgreSQL (TypeORM)', 'MySQL (Sequelize)'];

  useEffect(() => {
    if (isOpen) {
      if (nodeType === 'frontend' && !techStack) setTechStack('React');
      else if (nodeType === 'backend' && !techStack) setTechStack('Node.js (Express)');
      else if (nodeType === 'database' && !techStack) setTechStack('MongoDB (Mongoose)');
      // If it's already set from a previous open, we could keep it, but let's reset to defaults for the specific nodeType if they switch types
    }
  }, [isOpen, nodeType]);

  // When a user selects a new tech, or when the modal opens, trigger generation
  useEffect(() => {
    if (isOpen && nodeName && techStack) {
      generateCode();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, nodeName, techStack]);

  const generateCode = async () => {
    setIsGenerating(true);
    setCode(`Initializing AI Coder for ${techStack}...\n`);
    
    try {
      const prompt = `Write boilerplate code using ${techStack} for the ${nodeType} component: "${nodeName}" in the project "${projectName}". Respond ONLY with raw code.`;
      
      const res = await fetch('http://127.0.0.1:3001/api/generate-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });

      if (!res.ok) {
        throw new Error('Failed to reach AI Backend.');
      }
      
      const data = await res.json();
      setCode(data.reply || '// No code generated.');
    } catch (err) {
      console.error(err);
      setCode('// ERROR: Failed to generate code via AI model. Please ensure the backend and Ollama are running.');
    }
    
    setIsGenerating(false);
  };

  if (!isOpen) return null;

  let options = frontendOptions;
  if (nodeType === 'backend') options = backendOptions;
  if (nodeType === 'database') options = dbOptions;

  return (
    <div className="cgm-overlay">
      <div className="cgm-container">
        <div className="cgm-header">
          <h3 className="cgm-title">
            <span>⚡ AI Code Generator</span>
            <span className="cgm-badge">
              {nodeType.toUpperCase()}
            </span>
          </h3>
          <button onClick={onClose} className="cgm-close-btn">&times;</button>
        </div>
        
        <div className="cgm-toolbar">
          <div className="cgm-toolbar-text">
            Target Component: <strong className="cgm-toolbar-strong">{nodeName}</strong>
          </div>
          <div className="cgm-select-container">
            <span className="cgm-select-label">Technology:</span>
            <select 
              value={techStack} 
              onChange={(e) => setTechStack(e.target.value)}
              disabled={isGenerating}
              className="cgm-select"
            >
              {options.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="cgm-content">
          <div className="cgm-code-container">
            {isGenerating && (
              <div className="cgm-generating-badge">
                Generating...
              </div>
            )}
            <pre className="cgm-pre">
              {code}
            </pre>
          </div>
        </div>
        
        <div className="cgm-footer">
          <button 
            className="interactive-btn cgm-copy-btn"
            onClick={() => { navigator.clipboard.writeText(code); alert('Code copied to clipboard!'); }}
            disabled={isGenerating || !code}
          >
            📋 Copy Generated Code
          </button>
        </div>
      </div>
    </div>
  );
};
